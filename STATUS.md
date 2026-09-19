# Status — read this first

**As of 18 September 2026.** This is the single place recording what is
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
- **10 businesses** now exist in the database.

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

### P3 — 6 of 10 businesses have no competitors

They return `skipped` every night. Harmless (the 3-state return in
`scheduler.py` distinguishes skipped from failed) but it means most of the
database is inert.

## Blocked behind the above

- **Onboarding wizard competitor discovery** — needs `ANTHROPIC_API_KEY` set in
  Vercel *and* credit on the account. Both currently missing.
- **Phase 3 SQL migration** never run. Needed by the wizard:
  ```sql
  ALTER TABLE competitors ADD COLUMN IF NOT EXISTS description TEXT;
  ALTER TABLE competitors ADD COLUMN IF NOT EXISTS overlap_reason TEXT;
  ALTER TABLE competitors ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(3,2);
  ALTER TABLE businesses ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
  ```
- **Rebrand** — "Winnow" is still unverified for domain and trademark.
  Lodestar was the stated fallback. Nothing has been renamed.

## Uncommitted, deliberately

`competitive-tracker-web` **is a public repo.** The design system v2 code was
pushed (`787da21`); the documentation was not.

Still uncommitted in the working tree: `CLAUDE.md`, `TECH-STACK.md`,
`BUILD-PLAN.md`, `README.md`, `STATUS.md`, `SECRETS-AND-ACCESS.md`,
`.env.example`, `.gitignore`.

Those files describe, accurately and in detail, that RLS is off and why that is
exploitable. Committing them to a public repo publishes a working exploit guide
for a live database holding real data, while the hole is still open. The
information is technically derivable by anyone who opens devtools — the
difference is that today it takes curiosity, and committed it takes a GitHub
search.

**Correction (18 Sep, later the same day).** The reasoning above was built on
the premise that committing these docs would be a *new* disclosure. That premise
was wrong. The public `pm-competitive-research-tracker` repo has published the
Supabase project ID alongside "RLS is DISABLED on all tables" since May 2026.

Withholding the web repo's documentation therefore buys very little, while
costing documentation quality. The decision that actually matters is not what to
commit — it is **fixing RLS, or making both repos private, or both**.

**Options:** (a) fix RLS, then commit freely — recommended, and now urgent
rather than tidy; (b) make both repos private today as a stopgap, then commit;
(c) commit as-is on the basis that the information is already public — defensible,
and no longer the reckless option it appeared to be. Awaiting a decision.

Also untracked and probably belonging in `.gitignore` rather than the repo:
`.claude/` (local editor config) and the two generated `.docx` files.

## Known code weaknesses (not yet fixed)

1. `app/api/businesses/[id]/crawl/route.ts:79-93` collapses every GitHub
   failure into one opaque string. You cannot tell an expired token from a
   permissions problem without opening Vercel logs — which is exactly what
   cost a round-trip on 18 Sep.
2. `app/(dashboard)/dashboard/businesses/new/page.tsx:157` swallows a failed
   first crawl with `console.warn`. The user is told nothing.
3. No alerting on a red nightly run. Three consecutive failures went unnoticed
   because the dashboard still looked fine.

## Suggested order for the next session

1. Top up Anthropic credit — unblocks the most.
2. Confirm the PAT status in Vercel logs, regenerate, update, **redeploy**.
3. Decide the public-repo question, then commit the documentation.
4. Security pass: remove the dead `SUPABASE_SERVICE_KEY` from `.env.local`,
   crawler → service-role key, RLS, leaked-password protection.
5. Then `BUILD-PLAN.md` Session 5 proper — rebrand, Inngest, schema migration,
   eval harness v0.
