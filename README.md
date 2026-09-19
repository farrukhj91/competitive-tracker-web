# Competitive Tracker — Web Dashboard

Next.js dashboard for the Competitive Research Tracker. Pairs with the Python
crawler in [`../my-tracker`](../my-tracker) (repo:
`farrukhj91/pm-competitive-research-tracker`), reads from the same Supabase
database, and triggers crawls through GitHub Actions `workflow_dispatch`.

- **Live:** https://competitive-tracker-web.vercel.app
- **Deploys:** Vercel, automatically from `main`

> **Direction of travel.** This app is being evolved from a competitor *tracker*
> into a **Product Discovery agent**. The plan, the market evidence and the
> non-technical overview are in the documents listed below — read
> `BUILD-PLAN.md` before starting new feature work.

## Current status

**`STATUS.md` is the live-state file — read it first.** It records what is
working, what is broken right now, and what is blocked behind what.

As of 18 Sep 2026 there are two blockers worth knowing before you run anything:
the **Anthropic credit balance is exhausted** (nightly crawls have been failing
since at least 15 Sep, and reports are being written without their AI
recommendations), and the **`GITHUB_PAT` in Vercel is being rejected by GitHub**
(the Trigger crawl button is down).

## What works today

- Email + password auth via Supabase, with cookie-based sessions
- Onboarding wizard: describe your business → Claude discovers competitors with
  web search → pick which to track
- Competitor management (add / edit / pause / remove)
- On-demand crawl trigger with live progress polling
- Report history and a stitched report viewer (summary + full report)
- Daily scheduled crawls with emailed reports (run by the Python crawler)

## Stack

Next.js 16.2.6 (App Router) · React 19.2.4 · TypeScript 5 · Tailwind CSS 4 ·
Supabase Postgres + `@supabase/ssr` · Anthropic SDK · lucide-react · DOMPurify ·
Vercel.

`TECH-STACK.md` explains why each of these was chosen, and what was deliberately
left out.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your own values
npm run dev                  # http://localhost:3000
```

Required environment variables are documented with descriptions in
`.env.example`. Provision your own credentials — never copy them from another
person's environment. `SECRETS-AND-ACCESS.md` explains what each one grants.

**Before every push:**

```bash
npx tsc --noEmit
```

Type errors are the single most common cause of failed Vercel builds in this
repo; the build runs TypeScript and will reject the deploy.

## Security status — read before adding tables

**Row Level Security is disabled on all five tables**, confirmed by Supabase's
security advisor at ERROR level, external-facing. The publishable key ships in
the public browser bundle, so those tables are directly reachable through
PostgREST today. Tenant isolation is currently application-level `user_email`
filtering, which only constrains queries this codebase makes.

Enabling RLS is **not** a one-line fix: the Python crawler runs with the anon
key and no user session, so policies must not land before the crawler moves to a
service-role key. Sequencing is in `BUILD-PLAN.md`; the full credential
inventory is in `SECRETS-AND-ACCESS.md`.

## Documentation map

| File | What it's for | Audience |
|---|---|---|
| `CLAUDE.md` | Project notes, critical decisions, **design system v2** | Anyone writing code here |
| `BUILD-PLAN.md` | Technical SSOT for the Product Discovery agent — architecture, costs, quotas, phased build | Engineering |
| `MARKET-RESEARCH.md` | Competitive landscape, teardowns, pricing benchmarks, sources | Strategy |
| `OVERVIEW.md` | The idea, status and plan without the jargon | Investors, partners |
| `TECH-STACK.md` | What we used, why, and the known tech debt | Engineering, reviewers |
| `SECRETS-AND-ACCESS.md` | Credential inventory, blast radius, risk posture. No values | Architecture review |
| `STATUS.md` | **Live state — what works, what's broken, what's blocked** | Start every session here |

## Project structure

```
app/
├── (auth)/                  # signup, login, confirm — split ink/form layout
├── (dashboard)/             # protected routes
│   └── dashboard/
│       ├── businesses/new/  # 4-step onboarding wizard
│       └── businesses/[id]/ # detail, competitors, reports
├── api/                     # route handlers (crawl, crawl-status, research, competitors)
├── auth/callback/           # exchanges the email-confirmation code for a session cookie
└── page.tsx                 # landing

components/
├── ui/                      # Button, Input, Card, Badge, EmptyState, Logo
├── auth/                    # AuthShell, AuthHashHandler
├── dashboard/               # Sidebar, TopBar, BusinessCard, CompetitorRow, ReportViewer
└── modals/

lib/
├── supabase.ts              # browser client (@supabase/ssr)
├── supabase-server.ts       # server client for route handlers
├── auth.ts                  # auth helpers
└── db.ts                    # shared types — import Competitor etc. from here
```

## Progress

- ✅ **Session 1** — auth scaffolding, landing page, design system v1
- ✅ **Session 2** — dashboard pages and components
- ✅ **Session 3** — API routes, crawl trigger, progress polling, onboarding wizard
- ✅ **Session 4** — agent strategy and planning docs; **design system v2**;
  secrets and access review
- ⏳ **Session 5** — live blockers (Anthropic credit, `GITHUB_PAT`), the
  public-repo decision, security pre-work, then rebrand, Inngest, schema
  migration, eval harness v0
