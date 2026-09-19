@AGENTS.md

# Competitive Tracker Web — Project Notes

> Auto-loaded at the start of every Claude Code session. Read top-to-bottom before writing any UI code.
>
> **Current live state — including what is broken right now — is in `STATUS.md`.
> Read that before touching anything operational.** This file holds decisions and
> the design system; `STATUS.md` holds reality.

## Project Overview

Next.js 14 (App Router) SaaS dashboard for the Competitive Research Tracker. Pairs with the Python crawler in `../my-tracker`. Reads from the same Supabase DB; triggers crawls via GitHub Actions `workflow_dispatch`.

- **Live URL:** https://competitive-tracker-web.vercel.app
- **Hosting:** Vercel (auto-deploys from `main` on every push)
- **Repo:** github.com/farrukhj91/competitive-tracker-web

## Architecture

```
Next.js 14 (App Router) on Vercel
  ├─ (auth)   group → signup, login, confirm pages (public)
  ├─ (dashboard) group → /dashboard, /businesses/[id]/* (auth-required)
  ├─ /auth/callback → exchanges Supabase email-confirmation code for session cookie
  └─ /api/* → server routes (Session 3: businesses, competitors, reports, crawl trigger)

Supabase (shared with Python crawler)
  └─ Tables: businesses, competitors, crawl_results, crawl_diffs, reports

GitHub Actions (Python crawler in farrukhj91/pm-competitive-research-tracker)
  └─ Triggered by /api/businesses/[id]/crawl via workflow_dispatch
```

## Critical Decisions (DO NOT FORGET)

1. **Cookie-based session storage.** Both browser and server use `@supabase/ssr` so the session cookie set by `/auth/callback` is immediately visible to client components. Never import `createClient` from `@supabase/supabase-js` directly — always go through `lib/supabase.ts` or `lib/auth.ts`.

2. **Use the publishable key on the client.** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the new `sb_publishable_...` key (safe for browser). The legacy JWT anon key is what the Python crawler uses; do NOT use it here.

3. **Suspense for `useSearchParams()`.** Next.js 16 requires any client component using `useSearchParams()` to be wrapped in `<Suspense>` — otherwise the build fails on prerender. Pattern: split into inner component + outer wrapper with Suspense fallback.

4. **AGENTS.md applies.** Next.js 16 has breaking changes from earlier versions. Heed deprecation notices; if a familiar API errors, check `node_modules/next/dist/docs/`.

5. **No hardcoded competitors / businesses.** This is a multi-tenant app — every page must scope queries by the logged-in user. There is no canonical business or competitor list. (See `../my-tracker/CLAUDE.md` for the parent project's same principle.)

6. **RLS is OFF on all five tables — treat the anon key as a live exposure.** Verified against Supabase's security advisor (16 Sep 2026): `rls_disabled_in_public`, level **ERROR**, facing **EXTERNAL**, on `businesses`, `competitors`, `crawl_results`, `crawl_diffs`, `reports`. The publishable key ships in the public browser bundle, so with RLS off anyone can read and write those tables directly through PostgREST. Application-level `user_email` filtering only constrains queries *our* code makes.

   **Do not "just turn RLS on".** The Python crawler authenticates with the anon key and runs with no user session — enabling RLS first takes the nightly crawl offline silently. Correct order: (a) move the crawler to a service-role key held in GitHub Actions secrets and verify a nightly run, (b) enable RLS table by table with policies keyed on the authenticated user, (c) re-run the advisor. Full inventory and blast radius in `SECRETS-AND-ACCESS.md`.

7. **This repo is PUBLIC.** `github.com/farrukhj91/competitive-tracker-web`. Anything committed is world-readable, including documentation. The security docs describing the RLS exposure are deliberately **uncommitted** for that reason — publishing them while the hole is open hands over an exploit guide for a live database. See `STATUS.md` → "Uncommitted, deliberately". Decide this before running `git add` on the markdown files.

8. **Vercel environment variable changes require a redeploy.** They do not reach existing deployments; the running function keeps the old value until a new build ships. This is the step that gets missed when rotating `GITHUB_PAT` or adding `ANTHROPIC_API_KEY`.

9. **Fine-grained GitHub PATs expire, and the failure is asymmetric.** When `GITHUB_PAT` dies, the **Trigger crawl** button breaks but the nightly cron keeps running — because Actions uses repo secrets, a completely different credential. If the button fails while the schedule works, suspect the token first. Set a calendar reminder for the expiry date; nothing in this stack warns you.

---

# Design System

> **v2 — rewritten 2026-09-16.** The whole app follows these rules. If a design
> choice isn't covered here, ask before inventing one.
>
> **What changed from v1 and why.** v1 leaned on decoration — five-colour mesh
> gradients, gradient headline text, angled clip-path seams, dot-grid overlays,
> gradient-filled icon chips, gradient borders, drifting blurred orbs. Eight-plus
> hues could appear on one screen. Decoration is precisely what stops a page
> reading as premium: it signals that the layout can't carry itself. v2 removes
> all of it and spends the budget on type, spacing, hairlines and one honest
> shadow scale instead.

## Vibe

Reference points: **swichnow.io** (ink hero, huge tight display type, floating
pill nav, borderless soft-tinted panels, near-total absence of borders) crossed
with **Stripe** (precise hierarchy, mono eyebrows, hairline rules, product
mockups with believable depth).

Quiet, confident, expensive. Restraint over ornament. If a section looks plain,
the fix is better type and more space — not another gradient.

## Typography

**Family:** **Geist Sans** (UI + body) and **Geist Mono** (numbers, code, IDs,
eyebrows). Loaded via `next/font/google` in `app/layout.tsx` as `--font-geist-sans`
and `--font-geist-mono`. Use through Tailwind's `font-sans` / `font-mono`.

**NEVER use Arial, Helvetica, or default web fonts** — including server-side
email templates where practical.

**Type scale:**

| Use | Classes |
|-----|---------|
| Hero display | `display text-[3rem] md:text-[5rem] leading-[1.02] font-semibold` |
| Section H2 | `display text-[2rem] md:text-[3rem] leading-[1.08] font-semibold` |
| Page H1 (app) | `text-[28px] font-semibold tracking-tight` |
| Card / H3 | `text-[17px] font-semibold tracking-tight` |
| Body (marketing) | `text-base md:text-lg text-zinc-600 leading-relaxed` |
| Body (app) | `text-sm text-zinc-600 leading-relaxed` |
| Meta | `text-xs text-zinc-400` |
| Eyebrow | `.mono-label` (Geist Mono, 11px, uppercase, 0.14em tracking) |
| Numbers / IDs | `font-mono text-sm tabular-nums` |

`.display` applies `letter-spacing: -0.035em`. **Use it on anything ≥ 2rem** —
Geist looks loose and cheap at display sizes with Tailwind's `tracking-tight`
alone. Body text stays at default tracking.

`.balance` (`text-wrap: balance`) on short centred headings and hero paragraphs.

## Color System

**Two families only: ink/zinc neutrals + indigo accent.** Functional colors are
allowed but rationed.

### Ink & neutrals (zinc — NOT slate, NOT gray)
| Token | Value | Use |
|-------|-------|-----|
| Ink | `#09090b` (`zinc-950`) | Hero + CTA bands, primary mark, avatars |
| Page bg | `white` | Default |
| Section bg | `.panel-muted` (`#f7f7f8`) | Alternating sections, app shell |
| Text primary | `zinc-900` | Headings |
| Text body | `zinc-600` | Body copy |
| Text meta | `zinc-400` / `zinc-500` | Captions, metadata |
| Hairline | `zinc-200/70` | Every border. Full-strength `zinc-200` is too loud |

On ink surfaces: body text `zinc-400`, meta `zinc-500`. **Never `zinc-600` on
ink** — 2.6:1, fails contrast.

### Accent (indigo)
`indigo-600` for primary buttons, links, active icons and the Opportunity Gap
treatment. `indigo-50/70` + `border-indigo-100` for tinted callouts.
`indigo-400` for accent dots on ink.

### Functional (sparingly)
Success `emerald-600/50` · Destructive `red-600/50` · Warning `amber-700/50`.
Tinted fills, no borders.

**Color rules:**
- Never more than two hues on screen (indigo + at most one functional).
- No gradient text, ever.
- No multi-hue gradients. The only gradients permitted are the single-hue ink
  wash (`.surface-ink-wash`) and the soft neutral panel (`.panel-soft`).

## Surfaces & utilities (`app/globals.css`)

| Class | What it does |
|-------|--------------|
| `.surface-ink` | Flat `#09090b` block |
| `.surface-ink-wash` | Ink + one faint indigo radial. Hero and CTA bands only |
| `.panel-muted` | `#f7f7f8` section background |
| `.panel-soft` | Borderless neutral-tinted panel, used as a visual slot |
| `.elev-1` | Cards. Two-layer, ~8px blur |
| `.elev-2` | Modals, focal cards. Three-layer |
| `.elev-ink` | Elements floating over an ink surface (e.g. the hero mockup) |
| `.lift` | Hover: `translateY(-2px)` + shadow + border shift. **No scale** |
| `.reveal` | Scroll-driven fade-up where `animation-timeline` is supported |
| `.pulse-dot` | Live indicators |
| `.mono-label` `.display` `.balance` | See Typography |

Tailwind's `shadow-*` scale is **not** used for app chrome — use `.elev-*` so
depth stays consistent. Never exceed `.elev-2`.

## Components

### Border radius
- Chips, badges, buttons, avatars: `rounded-full`
- Inputs, small tiles, icon squares: `rounded-xl` (12px)
- Cards, panels, modals: `rounded-2xl` (16px)

Buttons and badges are **pills**. This is a change from v1.

### Buttons — `components/ui/Button.tsx`
Variants: `primary` (indigo), `secondary` (white + hairline), `ghost`,
`inverse` (white — for ink surfaces), `inverseOutline` (hairline on ink),
`destructive`. Sizes `sm` (h-8) / `md` (h-10) / `lg` (h-12).

**Never override a variant's colors via `className`.** Tailwind classes have
equal specificity, so `text-white` does not reliably beat the variant's
`text-zinc-700` — stylesheet order decides. Add a variant instead.

### Inputs — `components/ui/Input.tsx`
`h-11 rounded-xl`, `border-zinc-200`, focus = `ring-4 ring-indigo-600/15` plus
`border-indigo-600`. Wide, soft focus ring — not a hard 2px outline.

### Cards / Badges / EmptyState
`Card`: `rounded-2xl border-zinc-200/70 elev-1`, `hoverable` adds `.lift`.
`Badge`: pill, tinted fill, **no border**.
`EmptyState`: `zinc-50` fill + hairline, white icon tile.

### Tables
Headers `.mono-label text-zinc-400` · cells `px-4 py-3` · `divide-y
divide-zinc-200/70` · row hover `hover:bg-zinc-50` · no vertical rules.

### Modals
Backdrop `bg-zinc-950/40 backdrop-blur-md`. Container `bg-white rounded-2xl
elev-2 border-zinc-200/70 p-7`.

## Layout

- Marketing sections: `py-24 md:py-32`, separated by `border-t border-zinc-200/70`
- Section rhythm: alternate `white` / `.panel-muted`; open on ink, close on ink
- Content widths: `max-w-3xl` (prose), `max-w-5xl` (feature grids), `max-w-6xl` (wide)
- Page padding: `px-6 md:px-8`; 16px minimum side gutter on phones
- Marketing headings are **left-aligned** except hero, pricing and CTA

## Motion

`transition-colors` / `transition-[…] duration-200` on interactive elements.
`.lift` on cards. `.reveal` on repeated blocks. `active:scale-[0.985]` on buttons.

No Framer Motion, no parallax, no animated gradients, no hover scale on cards.
Everything respects `prefers-reduced-motion`.

## Iconography

`lucide-react`. `h-5 w-5` inline, `h-4 w-4` dense, `h-[18px] w-[18px]` in tiles.
Monochrome `zinc-400`–`zinc-600` — **icons are not where color goes**. Never
emoji in UI chrome.

## Accessibility

- WCAG AA minimum. `zinc-400` is fine for meta on white; never for body.
- On ink: `zinc-400` body / `zinc-500` meta are the floor.
- Focus rings always visible — `focus-visible:ring-2 ring-offset-2`, `ring-zinc-900`
  on neutral controls, `ring-indigo-600` on indigo ones, `ring-white` on ink.
- Labels on every input; modals trap focus and close on ESC.

## Don'ts

- ❌ Gradient text, mesh gradients, multi-hue gradients of any kind
- ❌ Angled/clip-path section seams, dot-grid overlays, blurred decorative orbs
- ❌ More than two hues on screen at once
- ❌ Arial, Helvetica, Times, or system-default fonts
- ❌ Emoji in UI chrome
- ❌ `shadow-lg` / `shadow-xl` / `shadow-2xl` — use `.elev-*`
- ❌ `font-bold` — `font-semibold` is the heaviest weight (Geist)
- ❌ Overriding Button variant colors through `className`
- ❌ Hover `scale` on cards or type
- ❌ Hardcoded hex outside `globals.css`

---

## File Structure

```
app/
├── (auth)/                  # Public auth pages
│   ├── signup/page.tsx
│   ├── login/page.tsx
│   └── confirm/page.tsx
├── (dashboard)/             # Protected dashboard routes (Session 2)
│   └── dashboard/
│       ├── page.tsx
│       ├── businesses/
│       │   ├── new/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       ├── competitors/page.tsx
│       │       └── reports/[reportId]/page.tsx
│       └── settings/page.tsx
├── auth/callback/route.ts   # Email confirmation handler
├── api/                     # Server routes (Session 3)
├── page.tsx                 # Landing
└── layout.tsx               # Root layout

components/                  # Reusable UI (Session 2)
├── ui/                      # Atomic primitives (Button, Input, Card)
├── dashboard/               # Dashboard-specific composites
└── modals/                  # Dialogs

lib/
├── supabase.ts              # Browser client singleton (@supabase/ssr)
└── auth.ts                  # Auth helpers (re-exports supabase)
```

## Common Tasks

### Add a new protected page
1. Create under `app/(dashboard)/...` — middleware will enforce auth
2. Use `supabase.auth.getSession()` server-side OR import `supabase` from `lib/auth` for client components
3. Wrap in Suspense if using `useSearchParams`

### Add a new component
1. Atomic UI primitives → `components/ui/`
2. Composed widgets → `components/dashboard/` or `components/modals/`
3. Use design system tokens from this file. Don't invent new colors/sizes.

### Trigger a Vercel deploy
```powershell
git add <files>
git commit -m "feat: ..."
git push
# Vercel auto-deploys from main in ~1 min
```

## Roadmap Position

This repo implements **Phase 2 #2 (Web Dashboard)** from `../my-tracker/ROADMAP.md`.

- ✅ Session 1: Auth scaffolding + landing + design system v1
- ✅ Session 2: Dashboard pages, components, design-system migration of existing pages
- ✅ Session 3: API routes + GitHub Actions crawl trigger + live progress polling + onboarding wizard
- ✅ Session 4: Strategic pivot planned (`BUILD-PLAN.md`, `MARKET-RESEARCH.md`, `OVERVIEW.md`, `TECH-STACK.md`); **design system v2** shipped across landing, auth and dashboard chrome; secrets/access review (`SECRETS-AND-ACCESS.md`, `.env.example`)
- ⏳ Session 5: Live blockers first (Anthropic credit, `GITHUB_PAT`, public-repo decision), then security pre-work, then rebrand · Inngest · schema migration (global/tenant split, quotas, `token_usage`) · eval harness v0 — see `STATUS.md` then `BUILD-PLAN.md`

**Session 4 code is live.** Design system v2 shipped as commit `787da21`,
deployed and verified at https://competitive-tracker-web.vercel.app on 18 Sep.
The *documentation* from that session is still uncommitted on purpose — see
decision 7 above and `STATUS.md`.

---

**Last updated:** 2026-09-18 (Session 4 — design system v2 shipped and live;
RLS exposure confirmed; secrets inventory added; live incidents triaged into
`STATUS.md`)
