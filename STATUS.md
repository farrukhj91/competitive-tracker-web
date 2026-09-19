# Status — read this first

**As of 19 September 2026.** This is the single place recording what is
actually true about the running system right now: what works, what is broken,
what is blocked behind what, and what is sitting uncommitted. Plans live in
`BUILD-PLAN.md`; this file is reality.

Update it whenever something breaks, ships or unblocks. If it disagrees with
another document, this one is newer.

---

## Working

- **Web app deployed** — https://competitive-tracker-web.vercel.app, design
  system v2, verified live 18 Sep (commit `787da21`).
- **Auth** — signup, login, email confirmation, cookie sessions.
- **Dashboard** — businesses, competitors, report history, report viewer.
- **Nightly crawl fires on schedule** — GitHub Actions cron `0 3 * * *`. Rows
  are written to `crawl_results` and `reports` every night.
- **10 businesses** across **2 accounts**; 44 competitors, of which **15 are
  active** after the quota backfill below.
- **Per-account quotas are live** (Session 5, 19 Sep) — 1 business, 5 active
  competitors per business, 3 manual crawls per day. Enforced by database
  triggers and a `SECURITY DEFINER` function, *not* by route handlers:
  `createBusiness` runs in the browser, so with RLS off an application-code
  check is bypassed by one direct PostgREST call. `usage_counters` has RLS on
  with no policies at all, so a client holding the publishable key can neither
  read nor reset a counter — verified as the `authenticated` role.
  Migration: `../my-tracker/migrations/002_quotas.sql`.
- **Cost ledger is live** — `token_usage` + `model_prices`, with cost computed
  at write time. Wired into the web research route and all three Python call
  sites. `../my-tracker/migrations/003_token_usage.sql`.

## Broken right now

### P0 — Anthropic credit balance is exhausted

Every scheduled run since at least 15 Sep has failed. From run
`35198995626` (17 Sep):

```
report_generator - ERROR - Failed to generate recommendations: Error code: 400
  'Your credit balance is too low to access the Anthropic API.'
Completed: 0 successful, 6 skipped, 2 failed (out of 10 businesses)
##[error]Process completed with exit code 1
```

**Why this is easy to miss:** the dashboard looks healthy. Crawl results and
report rows are still written, so "Last crawl" and the report list both look
current — but every report is being produced *without* its AI recommendations.
The valuable half is silently absent.

**Still live as of 18 Sep 07:52** — scheduled run `#35321544127` failed the
same way.

**And a manual trigger does not escape it.** The successful dispatch run
`#35313862212` (business "Frixals") *also* hit the credit error:

```
report_generator - ERROR - Failed to generate recommendations:
  'Your credit balance is too low to access the Anthropic API.'
```

It still reported `success`, because a single-business run whose recommendations
fail does not trip the exit code — the report saves without them. **So neither
the exit code nor the dashboard is a health signal.** A green run can still
produce a degraded report. This is tech-debt item 13 in `TECH-STACK.md`, and it
is the strongest argument for alerting on content rather than on status.

**Fix:** top up at console.anthropic.com. This blocks nearly everything else,
so do it first.

### ~~P1 — `GITHUB_PAT` in Vercel is rejected by GitHub~~ — RESOLVED 18 Sep

The **Trigger crawl** button returns "Failed to trigger crawl workflow". The
onboarding wizard's first-crawl call hits the same route and swallows the
failure with a `console.warn`, so new businesses have been silently skipping
their first crawl too.

Ruled out by checking GitHub directly on 18 Sep: repo is active, default branch
is `main`, `daily_crawl.yml` is `active`, and its `business_id` input matches
what the route sends. The request the code builds is correct, so the credential
is what GitHub is rejecting. Most likely an expired fine-grained PAT — the
nightly cron kept working because Actions uses *repo secrets*, a different
credential entirely. That asymmetry is the tell.

**Confirm before fixing:** Vercel → Logs → filter `[crawl]`. The route logs
`[crawl] GitHub API error: <status> <body>`.
`401` = expired/invalid · `403` = missing **Actions: Read and write** ·
`404` = fine-grained PAT not granted this repo (GitHub returns 404 not 403, so
a 404 here does *not* mean a wrong URL) · `422` = bad inputs or ref.

**Fixed.** PAT regenerated and updated in Vercel. Confirmed by evidence, not
assumption: run `#35313862212` on 18 Sep 06:11 UTC has event
`workflow_dispatch`, conclusion `success` — the button reached GitHub and the
workflow ran. Diagnosis for next time is kept below.

*Diagnosis, for the next occurrence:* regenerate the PAT (*Only select
repositories* → `pm-competitive-research-tracker`, Actions: Read and write,
longer expiry) → update `GITHUB_PAT` in Vercel **Production** → **redeploy**.
Vercel env changes do not reach existing deployments; the running function keeps
the old value until a new build ships.

### P2 — Resend is still a sandbox sender

`onboarding@resend.dev` only delivers to `farrukh.jamal91@gmail.com`. Every
other recipient gets a 403. Confirmed live in the same 17 Sep run. Blocks any
real user receiving a report. Fix: verify a domain at resend.com/domains.

### P2 — RLS disabled on all five tables

See `SECRETS-AND-ACCESS.md` and `CLAUDE.md` decision 6. Verified via Supabase's
security advisor: `rls_disabled_in_public`, **ERROR**, facing **EXTERNAL**, on
`businesses`, `competitors`, `crawl_results`, `crawl_diffs`, `reports`. The
publishable key ships in the public browser bundle, so those tables are
reachable through PostgREST today.

**Do not just turn it on.** The crawler uses the anon key with no user session;
policies landing first take the nightly run offline silently. Order: crawler →
service-role key in Actions secrets, verify a run, *then* RLS, then re-run the
advisor.

**This is already publicly documented, which raises the urgency.** The sibling
repo `github.com/farrukhj91/pm-competitive-research-tracker` is **public**, and
its committed `CLAUDE.md` has stated since May 2026:

- line 41–42 — the Supabase project URL and project ID
- line 54 — "**RLS is DISABLED** on all tables"

So the project's identity and the fact that RLS is off are already on the open
internet, next to each other, in a file anyone can read. Treat RLS as a live
incident rather than scheduled hygiene.

### P3 — 4 of 10 businesses have no competitors

They return `skipped` every night. Harmless (the 3-state return in
`scheduler.py` distinguishes skipped from failed) but it means much of the
database is inert. *(Counted live on 19 Sep — an earlier version of this file
said 6, which was wrong.)*

## Blocked behind the above

- **Onboarding wizard competitor discovery** — needs `ANTHROPIC_API_KEY` set in
  Vercel *and* credit on the account. Both currently missing.
- ~~**Phase 3 SQL migration** never run~~ — **already applied.** Checked
  against the live schema on 19 Sep: `competitors.description`,
  `competitors.overlap_reason`, `competitors.confidence_score` and
  `businesses.industry` all exist. This was stale; the wizard is blocked only
  on `ANTHROPIC_API_KEY` and credit.
- **Rebrand — "Winnow" is dead. Do not use it.** Checked 19 Sep.
  *Domains:* every sensible variant is registered — `winnow.com` (1998,
  **MarkMonitor**, a corporate brand-protection registrar), `winnow.io` (2020,
  locked), `usewinnow.com`, `winnowhq.com`, `trywinnow.com`, and
  `getwinnow.com` (held on Afternic to resell).
  *Name collisions in software:* **Winnow** (food-waste AI, London, ~$26.3M
  revenue, Hilton/Accor/IKEA), **Winnow** (`winnow.law`, RegTech), and
  decisively **WinnowPro** (San Mateo), whose product is literally named
  **"Competitive Intelligence Tool (CIT)"** — same name, same goods class,
  adjacent buyer.
  *Not established:* a formal USPTO register search. That is a trademark
  attorney's job, and a clean register would not rescue the name anyway.
  **Lodestar is not a safe fallback either** — it is a common mark across
  finance and logistics. Generate three or four candidates and clear them as a
  batch rather than falling back serially.

## Commit decision — RESOLVED 19 Sep

The documentation is committed and pushed. `competitive-tracker-web` commit
`6562888` carries `CLAUDE.md`, `README.md`, `TECH-STACK.md`, `BUILD-PLAN.md`,
`STATUS.md`, `SECRETS-AND-ACCESS.md`, `.env.example` and `.gitignore`;
`my-tracker` commit `45e4e6f` carries its `CLAUDE.md`.

**The reasoning, kept because it is the part worth remembering.** The original
decision to withhold assumed committing would be a *new* disclosure. It was
not. Verified before staging: `pm-competitive-research-tracker` is public,
`origin/main` matches local `HEAD`, and its committed `CLAUDE.md` has carried
the Supabase URL and project ID (lines 41–42) twelve lines from "**RLS is
DISABLED** on all tables" (line 54) since May 2026.

So withholding bought attacker *inconvenience*, not protection, while costing
documentation quality. What the web repo's docs add is a better **map** — the
five table names, the fact that the publishable key ships in the browser
bundle, and that `user_email` filtering only constrains our own queries. That
is a real delta, but a delta in convenience rather than capability: all of it
is derivable from devtools in ten minutes.

**Neither committing nor withholding closes the hole.** Fixing RLS does. That
is why it is next.

Still held back deliberately: **`MARKET-RESEARCH.md`**. Its uncommitted diff
adds a teardown of a named live competitor including their founder, the
pricing hypothesis, and the analysis of why competitors structurally cannot
follow. Publishing competitive strategy to the competitors it analyses is a
separate decision from the security one, and has not been taken.

Now gitignored rather than committed: `*.docx` (generated from the `.md`
sources; binary, unreviewable in diffs, and `Winnow-Overview.docx` would have
published an unverified brand name) and `.claude/*` except `launch.json`,
which is kept as the shared dev-server definition.

## Known code weaknesses

1. `app/api/businesses/[id]/crawl/route.ts` collapses every GitHub failure into
   one opaque string. You cannot tell an expired token from a permissions
   problem without opening Vercel logs — which is exactly what cost a
   round-trip on 18 Sep. **Still open, and deliberately so**: commit `65ec719`
   removed the detail on purpose to stop leaking infrastructure info to the
   browser. The fix is a distinguishable *user-facing* code, not putting the
   GitHub body back.
2. ~~The onboarding wizard swallows a failed first crawl with
   `console.warn`~~ — **fixed 19 Sep** (`3328c90`). It now passes the reason
   through to the business page. Quota was a new way for that call to fail, and
   unexplained silence was no longer defensible.
3. No alerting on a red nightly run. Three consecutive failures went unnoticed
   because the dashboard still looked fine. **This is the highest-value
   remaining item** — the credit exhaustion in P0 ran for three days precisely
   because nothing watches content rather than status.
4. `app/api/businesses/[id]/research/route.ts` hard-codes `claude-opus-4-7`
   with no fallback chain, where the Python side tries several. The model is
   **current, not retired** (checked 19 Sep), so nothing is broken today — but
   this is BUILD-PLAN pre-work item 2 and it stays outstanding.

## Suggested order for the next session

**Done in Session 5 (19 Sep):** documentation committed and pushed
(`6562888`, `45e4e6f`) · dead `SUPABASE_SERVICE_KEY` removed from `.env.local`
· per-account quotas live (`4723b5a`, `3328c90`) · `token_usage` cost ledger
live (`a06f7c2`, `2f80447`) · Winnow verified and rejected.

**Still to do, in this order:**

1. **Top up Anthropic credit** — still P0, still blocks the most. Verify
   recovery by reading the run log for the *absence* of the credit error, not
   by a green tick: run `#35313862212` returned `success` while failing this
   way.
2. **Rotate the Supabase service-role key.** Deleting the local copy from
   `.env.local` did not revoke it, and it sat on disk since May. It is the one
   credential that bypasses RLS entirely.
3. **Security pass, in order** — (a) crawler to a service-role key in Actions
   secrets, verified by a `workflow_dispatch` run *and* the next scheduled run;
   (b) RLS on with per-user policies; (c) re-run the advisor; (d) leaked-password
   protection. Getting (a) and (b) the wrong way round takes the nightly crawl
   offline silently.
4. **Alerting on content, not status** — weakness 3 above.
5. Then the rest of `BUILD-PLAN.md` Session 5: a *new* brand candidate set
   (Winnow is out, Lodestar unverified), Inngest, the global/tenant schema
   split, eval harness v0.

**Note for whoever picks this up:** the quota and cost tables were born with
RLS enabled and correct policies. The five original tables were not. Enabling
RLS on those five is the remaining gap, not a from-scratch job.
