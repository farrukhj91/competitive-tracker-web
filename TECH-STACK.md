# Tech Stack — What We Used and Why

> Current state of the deployed system (Sessions 1–4). Verified against `package.json`, `requirements.txt` and source on 2026-09-08.
>
> Companion docs: **`BUILD-PLAN.md`** (where this is going) · **`MARKET-RESEARCH.md`** (why it's going there) · **`CLAUDE.md`** (design system + critical decisions).

---

## 1. System shape

Two repositories, two languages, one database.

```
competitive-tracker-web  (Next.js on Vercel)          pm-competitive-research-tracker  (Python)
├─ dashboard UI                                       ├─ crawler (requests / BS4 / Playwright)
├─ auth (Supabase)                                    ├─ diff engine
├─ API routes                                         ├─ report generator (Claude)
└─ crawl trigger ──── GitHub workflow_dispatch ─────► └─ email sender (Resend)
                                                                    │
        └──────────────► Supabase Postgres ◄────────────────────────┘
                         (shared source of truth)
```

**Why two repos rather than one codebase.** The Python crawler is Phase 1 — it was built first, it works, and it runs on GitHub Actions. Porting it to TypeScript would have consumed a session and bought nothing: the crawl workload is long-running and scheduled, which is exactly what Next.js serverless functions are bad at. They share the **database**, not code. The web app never imports Python; it triggers it over the GitHub API and reads the results out of Postgres.

---

## 2. Frontend

| Technology | Version | Why |
|---|---|---|
| **Next.js (App Router)** | 16.2.6 | One deployment covers UI *and* API. No separate backend service to run, pay for, or keep in sync. Server components cut client JS; route handlers give serverless endpoints for free. |
| **React** | 19.2.4 | Ships with Next 16. |
| **TypeScript** | ^5 | Earned its keep immediately — it caught a `Competitor` type divergence between `CompetitorRow.tsx` and `lib/db.ts` that would otherwise have been a runtime bug. `npx tsc --noEmit` is now the standard pre-push check. |
| **Tailwind CSS** | ^4 (via `@tailwindcss/postcss`) | Utility-first keeps styling next to markup, and the design system lives as tokens in `globals.css` rather than a sprawl of CSS files. v4 uses the `@theme inline` directive and a PostCSS plugin — no JS config file. |
| **lucide-react** | ^1.14.0 | Consistent, tree-shakeable icon set. The design system bans emoji in UI chrome, so a real icon library was required. |
| **Geist Sans / Geist Mono** | via `next/font/google` | Self-hosted at build time — no external font request, no FOUT. The design system explicitly forbids Arial/Helvetica fallbacks. |
| **DOMPurify** | ^3.4.3 | The Python crawler produces report HTML that the dashboard renders with `dangerouslySetInnerHTML`. Sanitising is non-negotiable. *Note: it strips the report's own `<style>` block, which is why `.report-content` prose CSS exists in `globals.css`.* |

**No component library.** The original ROADMAP called for shadcn/ui. We hand-rolled the primitives (`Button`, `Input`, `Card`, `Badge`, `EmptyState`, `Logo`) instead, because the design system in `CLAUDE.md` is opinionated enough — fixed indigo accent, zinc neutrals, specific radii and shadows — that adapting a library would have been more work than writing six small components.

**No state management library.** React state plus server components covers everything at this size. Redux or Zustand would be ceremony.

**No animation library.** Design system v2 permits CSS transitions, a `.lift` hover, and `.reveal` — a scroll-driven fade using the native `animation-timeline: view()` with a graceful no-op fallback. Framer Motion would be a dependency serving a rule we've already decided against.

**Design system v2 (Session 4).** The original system leaned on decoration — multi-hue mesh gradients, gradient headline text, angled clip-path seams, dot-grid overlays, gradient icon chips and blurred drifting orbs. That is what made the site read as cheap: ornament signalling that the layout couldn't carry itself. v2 removes all of it and spends the budget on type, spacing, hairlines and one honest shadow scale (`.elev-1/2/ink`). Visual reference: swichnow.io crossed with Stripe. Full rules in `CLAUDE.md`.

---

## 3. API layer

Next.js **route handlers** — serverless functions colocated with the app. Five endpoints exist today:

| Route | Purpose |
|---|---|
| `POST /api/businesses/[id]/crawl` | Triggers the GitHub Actions workflow via `workflow_dispatch` |
| `GET /api/businesses/[id]/crawl-status` | Polls crawl progress by counting `crawl_results` for the business's competitors |
| `POST /api/businesses/[id]/research` | Claude competitor discovery with the `web_search` tool |
| `POST /api/businesses/[id]/competitors/batch` | Bulk-inserts wizard-selected competitors |
| `POST /api/competitors` | Add / edit / pause / remove a single competitor |

**Why route handlers instead of a separate API service.** At this scale a dedicated backend would mean another deployment, another set of env vars, another thing to monitor, and CORS. Route handlers ship with the frontend and inherit its auth context through cookies.

**The Next.js 16 gotcha worth recording:** route handler `params` is now a `Promise` that must be awaited. Two Vercel builds failed on this before it was fixed. `AGENTS.md` exists in the repo specifically to warn future sessions that this Next version diverges from training-data-era conventions.

---

## 4. Database and auth

**Supabase (managed Postgres)** — `@supabase/supabase-js ^2.105.4`

Postgres rather than a document store because the data is genuinely relational: `businesses → competitors → crawl_results → crawl_diffs → reports`. Free tier covers the MVP comfortably (500 MB, 2 GB egress). Critically, it's **shared with the Python crawler** — one source of truth, no sync layer, no eventual consistency to reason about.

**`@supabase/ssr ^0.10.3` — cookie-based sessions**

This is the most consequential library choice in the app, and it was not obvious. Sessions are stored in **cookies, not localStorage**, because:

- `/auth/callback` is a *server* route that exchanges the email-confirmation code for a session
- With localStorage, the server can't set that session and the browser client never sees it — email confirmation silently fails
- With cookies, the server sets it and the browser client picks it up immediately

`middleware.ts` runs on every request to keep that cookie fresh; without it, sessions go stale and server components intermittently bounce logged-in users back to `/login`. Both pieces were needed to make email verification work reliably.

**Two different Supabase keys, deliberately**

| Consumer | Key | Reason |
|---|---|---|
| Web app | `sb_publishable_...` (new publishable) | Safe for the browser; current format |
| Python crawler | Legacy JWT anon key (`eyJhbGc...`) | `supabase-py 2.0.2` only accepts JWT format — it rejects the new key outright |

This is a genuine constraint, not an oversight. It's documented in both repos' `CLAUDE.md` because it has bitten before.

**RLS is currently disabled — and it is a live external exposure, not just tech debt.** Confirmed by Supabase's security advisor (16 Sep 2026): `rls_disabled_in_public` at level **ERROR**, facing **EXTERNAL**, across all five tables. Because the publishable key ships in the public browser bundle, anyone can reach those tables directly through PostgREST; `user_email` scoping only constrains queries our own code makes.

It began as deliberate Phase-1 debt — the crawler's anon key needs unrestricted read/write — and that is exactly what makes the fix non-trivial. The crawler must move to a service-role key **before** policies land, or the nightly run goes dark silently. Sequencing is in `BUILD-PLAN.md`; the credential inventory is in `SECRETS-AND-ACCESS.md`.

---

## 5. LLM layer

**`@anthropic-ai/sdk ^0.100.1`** (web) · **`anthropic 0.25.0`** (Python) · model **`claude-opus-4-7`**

| Where | What it does | Why this model |
|---|---|---|
| `/api/businesses/[id]/research` | Discovers 8–12 competitors with confidence scores and overlap reasoning | Opus, because discovery quality *is* the product. A cheaper model producing mediocre competitor lists would undermine the whole onboarding flow. |
| `report_generator.py` | Initial deep-dive analysis (SWOT, comparison matrix, recommendations) and daily change-tracking reports | Same reasoning — the analysis is what lands in the user's inbox. |

**The `web_search` tool** is enabled on the research call (`web_search_20250305`, max 5 uses). It runs server-side inside Anthropic's API, so Claude performs its own searches and returns conclusions — we never had to build a search integration, manage a search API key, or handle the tool-use loop ourselves.

**Model fallback chain in Python.** `report_generator.py` tries `claude-opus-4-7 → claude-opus-4-5 → claude-sonnet-4-7 → claude-sonnet-4-5 → claude-3-5-sonnet-latest`. The daily crawl runs unattended at 3 AM UTC; a model deprecation shouldn't silently kill the report. The web app doesn't have this yet — worth adding.

---

## 6. Email

**Resend** — `resend 0.7.0` (Python), called over its REST API from `email_sender.py`.

Chosen for a free tier of 100/day and a genuinely simple API. Reports are sent as HTML email with a **PDF attachment rendered by Playwright** (Chromium headless prints the report to PDF).

**Live constraint worth knowing:** the sender is `onboarding@resend.dev`, Resend's sandbox address, which **only delivers to the email used to sign up for Resend**. Sending to real users requires verifying a domain. This blocks multi-user email until a domain is registered — a known gap, not a bug.

---

## 7. Scheduling and orchestration

**GitHub Actions** — `.github/workflows/daily_crawl.yml`

Two trigger paths on the same workflow:

```yaml
on:
  schedule:
    - cron: '0 3 * * *'        # daily 3 AM UTC (8 AM PKT)
  workflow_dispatch:
    inputs:
      business_id:              # optional — dashboard passes this
```

**Why GitHub Actions and not Vercel Cron.** A crawl takes minutes; Vercel's Hobby functions cap at 60 seconds. Actions gives 2,000 free minutes/month (≈200 crawls at 10 min each), a 30-minute job timeout, and — decisively — `workflow_dispatch`, which is what lets the dashboard's "Trigger crawl" button start a real crawl on demand.

**How the dashboard triggers it.** `POST /api/businesses/[id]/crawl` calls GitHub's REST API with a **fine-grained PAT** (`GITHUB_PAT` + `GITHUB_REPO` in Vercel env), passing `business_id` as a workflow input. The workflow branches: with an ID it runs `python -m src.scheduler --business-id <id>`, without one it runs `--all`.

*Setup note that cost real time:* the PAT needs **Actions: read+write** on the crawler repo, scoped to that repository. A "Public repositories" fine-grained token is read-only and silently fails with a 403.

**Progress polling.** `CrawlProgressModal` polls `/api/businesses/[id]/crawl-status`, which counts rows in `crawl_results` for that business's competitors within a 30-minute window. Crude but effective — no websockets, no job-status service, and the crawler needs no awareness of the dashboard.

---

## 8. Hosting and CI

| Layer | Choice | Why |
|---|---|---|
| Web hosting | **Vercel** | Zero-config for Next.js, auto-deploys from `main`, free tier generous for this traffic. Type errors fail the build, which has caught real bugs. |
| Crawler runtime | **GitHub Actions** | See above — it *is* the scheduler and the compute. |
| Secrets | Vercel env vars + GitHub Actions secrets | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GITHUB_PAT`, `GITHUB_REPO`, `ANTHROPIC_API_KEY` on Vercel; `SUPABASE_URL`, `SUPABASE_KEY`, `CLAUDE_API_KEY`, `RESEND_API_KEY`, `SENDER_EMAIL` on GitHub. |
| Linting | ESLint 9 + `eslint-config-next` | Bundled with the Next scaffold. |

---

## 9. The crawler (Python)

| Library | Version | Role |
|---|---|---|
| `requests` | 2.31.0 | Static HTML fetch — the fast path, used first |
| `beautifulsoup4` | 4.12.2 | HTML parsing, nav-link discovery for pricing/features/blog/jobs pages |
| `playwright` | 1.40.0 | **Fallback only.** Chromium headless renders JS-heavy SPAs when a static fetch returns suspiciously thin content (<200 chars body, high script-to-content ratio). Also renders report PDFs. |
| `feedparser` | 6.0.10 | RSS — competitor blogs and Google News search feeds |
| `supabase` | 2.0.2 | Postgres client (legacy JWT key — see §4) |
| `resend` | 0.7.0 | Email delivery |
| `anthropic` | 0.25.0 | Report generation |
| `click` + `rich` | 8.1.7 / 13.7.0 | CLI — *currently unusable locally* |
| `pytest`, `python-dateutil`, `python-dotenv` | — | Testing and config |

**Why Playwright is a fallback rather than the default.** It's an order of magnitude slower than `requests` and needs a browser install in CI. Detection is generic — it triggers on HTML structure heuristics, never on a domain allowlist — so it stays competitor-agnostic per the project's core principles.

**Why the CLI is unusable.** The developer's corporate laptop blocks outbound connections to Supabase, the Claude API, and Resend. Python cannot run locally at all. Every change goes: edit locally → commit → push → trigger the workflow on GitHub. This constraint shaped the whole development loop and is documented in `my-tracker/CLAUDE.md`.

---

## 10. Deliberate omissions

| Not used | Why not |
|---|---|
| Separate backend service | Route handlers cover it; a second deployment is pure overhead at this size |
| ORM (Prisma, Drizzle) | The Supabase client is sufficient. An ORM adds a build step and a migration layer we don't yet need |
| Redis / job queue | GitHub Actions *is* the job runner today. Inngest is planned for the agent pipeline (see `BUILD-PLAN.md`) |
| Component library | Design system is opinionated enough that adapting one costs more than writing the primitives |
| State management library | React state + server components suffice |
| Animation library | Design system permits one transition and nothing more |
| Vector DB / RAG | Deliberately deferred ~6 months — a tenant's data fits in context, so SQL beats vectors on cost, precision and debuggability |

---

## 11. Known tech debt

1. **`@supabase/auth-helpers-nextjs ^0.15.0` is a dead dependency.** Verified: not imported anywhere. It's deprecated upstream and npm warns on every install. Safe to remove.
2. **RLS disabled — ERROR, external-facing, live.** Verified via Supabase's advisor across all five tables. Not merely "fine while single-user": the anon key is already public, so the tables are reachable today. Blocked on migrating the crawler to a service-role key first. This is the highest-severity item on this list.
3. **`middleware.ts` convention is deprecated in Next 16** in favour of `proxy`. The build warns on every deploy. Non-breaking for now.
4. **Node 20 Actions deprecation.** `actions/checkout@v4`, `setup-python@v5`, `upload-artifact@v4` all warn; GitHub forces Node 24 from June 2026.
5. **No token/cost accounting.** Anthropic bills one org-level number with no per-tenant attribution. Planned for Session 5 — see `BUILD-PLAN.md`.
6. **No model fallback in the web app.** The Python side has a five-model chain; `/api/businesses/[id]/research` hard-codes `claude-opus-4-7` and will fail outright if it's deprecated.
7. **Resend sandbox sender.** Email reaches only the Resend signup address until a domain is verified.
8. **An unused service-role key sits in `.env.local`.** `SUPABASE_SERVICE_KEY` is referenced nowhere in `app`, `lib`, `components` or `middleware.ts`. It is the one credential that bypasses RLS entirely. Remove it; reintroduce only in GitHub Actions secrets as part of the RLS migration.
9. **Leaked-password protection is off.** Supabase Auth can check new passwords against HaveIBeenPwned. Low effort, not yet enabled.
10. **No secret rotation.** Nothing in the credential inventory has been rotated since creation (May 2026). No schedule, no runbook.
11. **Opaque GitHub error handling.** `app/api/businesses/[id]/crawl/route.ts:79-93` collapses every `workflow_dispatch` failure into one string. An expired token and a permissions problem are indistinguishable without opening Vercel logs — which is exactly what happened on 18 Sep 2026.
12. **The onboarding wizard swallows a failed first crawl.** `app/(dashboard)/dashboard/businesses/new/page.tsx:157` logs a `console.warn` and continues. The user is told nothing, so new businesses silently never get their first crawl.
13. **No alerting on a red nightly run.** Three consecutive failures went unnoticed because crawl and report rows are still written, so the dashboard looks healthy while the AI half of every report is missing.
14. **Fine-grained PAT expiry is unmonitored.** Nothing warns when `GITHUB_PAT` is about to die, and the failure is asymmetric — the manual trigger breaks while the cron keeps running on Actions secrets.

---

## 12. One-line summary

**Next.js 16 + TypeScript + Tailwind 4 on Vercel** for the dashboard and API · **Supabase Postgres** as the shared source of truth with cookie-based auth via `@supabase/ssr` · **Claude Opus 4.7** for competitor discovery and report generation · **Resend** for email · **GitHub Actions** as both cron scheduler and crawler runtime, triggered on demand through `workflow_dispatch` · **Python + BeautifulSoup + Playwright** for the crawler itself.

The through-line: *use the platform's free tier for as long as it genuinely fits, and don't add a service until something breaks without it.*
