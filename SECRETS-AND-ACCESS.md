# Secrets & Access — Architecture Review Handover

**For:** solutions architect, architecture and risk review
**Date:** 16 September 2026
**Contains no credential values** — deliberately. Everything below is the
*shape* of the system's credentials: what exists, what each one grants, where
it is stored, and what the blast radius is if it leaks. That is what an
architecture and risk review needs; live keys are not required to assess any
of it, and sharing them would itself be a finding.

---

## 1. System shape

Two deployables, one database.

| Component | Runtime | Repo |
|---|---|---|
| Web dashboard | Next.js 16 on Vercel | `competitive-tracker-web` |
| Crawler | Python, on GitHub Actions (cron `0 3 * * *` + `workflow_dispatch`) | `pm-competitive-research-tracker` |
| Database + auth | Supabase Postgres (free tier, `ap-northeast-1`) | shared by both |
| Email | Resend | crawler only |
| LLM | Anthropic API | both |

The web app triggers an on-demand crawl by calling the GitHub API to dispatch
the crawler workflow. There is no queue and no backend service between them.

---

## 2. Credential inventory

### Web app — stored in Vercel environment variables (production) and `.env.local` (dev)

| Variable | Grants | Blast radius if leaked |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project endpoint | None on its own. Already public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | PostgREST access as the `anon` role | **Already public — ships in the browser bundle.** Severity depends entirely on RLS. See §3.1 |
| `ANTHROPIC_API_KEY` | Inference billed to our account | Uncapped spend. Not currently scoped to a Workspace or spend limit |
| `GITHUB_PAT` | Actions read+write on the crawler repo | Can trigger or cancel crawler runs. Fine-grained, single repo, no code write |
| `GITHUB_REPO` | Config only (`owner/repo`) | None |

Also present in `.env.local` but **not referenced anywhere in the codebase**:
`SUPABASE_SERVICE_KEY`, `NEXT_PUBLIC_APP_NAME`. See §3.2.

### Crawler — stored in GitHub Actions secrets (production) and `.env` (dev)

| Variable | Grants | Blast radius if leaked |
|---|---|---|
| `SUPABASE_URL` | Project endpoint | None on its own |
| `SUPABASE_KEY` | PostgREST access. **Legacy JWT anon key**, not the publishable one — `supabase-py 2.0.2` rejects the new format | Same as the web anon key. See §3.1 |
| `CLAUDE_API_KEY` | Inference billed to our account | Uncapped spend |
| `RESEND_API_KEY` | Send email as our sender | Reputation / phishing risk. Currently a sandbox sender, so delivery is restricted to the account owner's address |
| `SENDER_EMAIL`, `SENDER_NAME` | Config only | None |
| `CRAWL_TIMEOUT_SECONDS`, `CRAWL_DELAY_SECONDS`, `MAX_RETRIES`, `RETENTION_DAYS`, `LOG_LEVEL` | Tuning only | None |

---

## 3. Current risk posture — known findings

### 3.1 Row Level Security is disabled on every table — live, external

Verified against Supabase's own security advisor on 16 Sep 2026. Result:
`rls_disabled_in_public`, level **ERROR**, facing **EXTERNAL**, on all five
tables: `businesses`, `competitors`, `crawl_results`, `crawl_diffs`, `reports`.

Consequence: the publishable key is in the public browser bundle of the live
site, and with RLS off it grants direct read/write to all five tables through
PostgREST. Tenant isolation today is `user_email` filtering in application
code, which only constrains queries our own code makes.

**This is not a one-line fix, and the ordering matters.** The crawler
authenticates with the anon key and runs with no user session. Enabling RLS
before the crawler moves to a service-role key (held in GitHub Actions
secrets) would silently take the nightly crawl offline. Proposed sequence:

1. Move crawler to a service-role key; verify the nightly run.
2. Enable RLS table by table with policies keyed on the authenticated user.
3. Re-run the advisor to confirm clean.

Worth a decision in review: whether this blocks further feature work or runs
alongside it.

### 3.2 An unused service-role key is sitting in a local env file

`SUPABASE_SERVICE_KEY` appears in `.env.local` but is referenced nowhere in
`app`, `lib`, `components` or `middleware.ts`. It is the one credential that
bypasses RLS entirely. Recommendation: remove it now; reintroduce it only in
GitHub Actions secrets as part of step 1 above.

### 3.3 All tenants share one Anthropic account

Every user's requests currently go through a single API key with no
per-account attribution, no spend limit and no Workspace separation. Cost
cannot be traced to a tenant, and one tenant cannot be rate-limited
independently.

Already in the build plan: a `token_usage` table logging `input_tokens`,
`output_tokens`, `model` and computed cost per request, tagged with
`account_id` and operation type, plus per-tier quotas. Not yet built.

### 3.4 Leaked-password protection is off

Supabase Auth can check new passwords against HaveIBeenPwned. Currently
disabled. Low effort, worth switching on.

### 3.5 No secret rotation has occurred

No key in this inventory has been rotated since creation (May 2026). There is
no rotation schedule and no runbook.

---

## 4. Constraints worth knowing before you recommend

- **Supabase free tier**, and intended to stay free for now. Adding reviewers
  as org members is not on the table; assume no dashboard access.
- **No paid infrastructure during build.** GitHub Actions is doing the job of
  a scheduler and a worker pool because it is free, not because it is right.
  Inngest free tier is the planned replacement.
- **Two Supabase key formats are in play by necessity** — new publishable on
  the web, legacy JWT anon in Python. Not a preference; a client-library
  limitation.
- Single-developer project. Anything requiring a rota or an on-call rotation
  is out of scope.

---

## 5. Open questions for review

1. Does RLS block the next build phase, or proceed in parallel?
2. Hard or soft per-tenant quotas? This is a pricing decision as much as a
   technical one.
3. Is GitHub Actions acceptable as the crawler runtime through MVP, or does
   the move to Inngest need to happen sooner?
4. Canonicalising competitor entities beyond domain matching — rebrands,
   acquisitions, multi-domain companies. Currently unsolved.
5. What rotation cadence is proportionate for a project at this stage?

---

*If you ever need to run either service locally, each repo has a
`.env.example` listing the variables with placeholder values. Real values are
issued per-person — never copied from someone else's environment.*
