@AGENTS.md

# Competitive Tracker Web — Project Notes

> Auto-loaded at the start of every Claude Code session. Read top-to-bottom before writing any UI code.

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

---

# Design System

> The whole app must follow these rules. If a design choice isn't covered here, ask before inventing one.

## Vibe

Modern, clean, alive — Linear / Stripe / Vercel / Anthropic. Premium without being austere. Restrained color, generous whitespace, intentional motion. Never busy, never boring.

## Typography

**Family:** **Geist Sans** (UI + body) and **Geist Mono** (numbers, code, IDs). Already loaded via `next/font/google` in `app/layout.tsx` as CSS variables `--font-geist-sans` and `--font-geist-mono`. Use these via Tailwind's default `font-sans` / `font-mono`.

**Fallback stack** (defined in tailwind config / globals.css):
```
font-sans: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", monospace
```

**NEVER use Arial, Helvetica, or default web fonts.** No `font-family: Arial` anywhere — including emails generated server-side, if practical.

**Type scale** (Tailwind classes, all in Geist Sans):

| Use | Classes |
|-----|---------|
| Hero / Display | `text-5xl md:text-6xl font-semibold tracking-tight` |
| Page H1 | `text-3xl md:text-4xl font-semibold tracking-tight` |
| Section H2 | `text-2xl font-semibold tracking-tight` |
| Subsection H3 | `text-xl font-medium` |
| Body | `text-base leading-relaxed text-zinc-700` |
| Small / meta | `text-sm text-zinc-600` |
| Caption / hint | `text-xs text-zinc-500` |
| Numbers / IDs | `font-mono text-sm` |

Tracking: always `tracking-tight` on display/heading sizes (>= text-2xl). Body stays at default tracking.

## Color System

**Single accent: Indigo.** Most surfaces are neutral; color is reserved for primary action, focus, and active states.

### Accent (Indigo)
| Token | Hex | Tailwind | Use |
|-------|-----|----------|-----|
| Primary | `#4f46e5` | `indigo-600` | Primary buttons, links, focus rings |
| Hover | `#4338ca` | `indigo-700` | Primary button hover |
| Subtle bg | `#eef2ff` | `indigo-50` | Selected states, info banners |
| Subtle border | `#c7d2fe` | `indigo-200` | Focus borders |
| On-dark accent | `#a5b4fc` | `indigo-300` | Accent text on dark surfaces |

### Neutrals (zinc — NOT slate, NOT gray)
| Token | Tailwind | Use |
|-------|----------|-----|
| Background | `white` | Page background (light mode) |
| Surface raised | `white` + `border-zinc-200 shadow-sm` | Cards, modals |
| Subtle bg | `zinc-50` | Section backgrounds, hover states on rows |
| Text primary | `zinc-900` | Headings, body |
| Text secondary | `zinc-700` | Body text |
| Text tertiary | `zinc-500` | Captions, metadata |
| Border | `zinc-200` | Default border |
| Border strong | `zinc-300` | Inputs, dividers |

### Functional (use sparingly)
| Intent | Color | Tailwind |
|--------|-------|----------|
| Success | Emerald | `emerald-600` text, `emerald-50` bg |
| Destructive | Red | `red-600` text, `red-50` bg |
| Warning | Amber | `amber-600` text, `amber-50` bg |

**Color rules:**
- Never more than 2 hues on screen (indigo + 1 functional max).
- Backgrounds are 95% neutral. Color is for action and state, not decoration.
- No colored gradients in body content. Hero gradients allowed but only `white → zinc-50`.

## Components

### Border radius
- Small (chips, badges): `rounded-md` (6px)
- Inputs, buttons, smaller cards: `rounded-lg` (8px)
- Cards, panels: `rounded-xl` (12px)
- Modals, hero callouts: `rounded-2xl` (16px)

Never use `rounded-full` except on avatars and pill badges.

### Shadows
- Cards: `shadow-sm` (subtle)
- Hover lift on interactive cards: `hover:shadow-md`
- Modals / popovers: `shadow-xl`
- No `shadow-2xl` — too heavy.

### Buttons
```tsx
// Primary
className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
           bg-indigo-600 text-white font-medium text-sm
           hover:bg-indigo-700 active:bg-indigo-800
           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"

// Secondary
className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
           bg-white border border-zinc-300 text-zinc-900 font-medium text-sm
           hover:bg-zinc-50 active:bg-zinc-100
           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
           transition-all duration-200"

// Destructive
className="... bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 ..."

// Ghost (tertiary)
className="... bg-transparent text-zinc-700 hover:bg-zinc-100 ..."
```

Min touch target: **44px height** (`py-2.5` on text-sm gets you there with line-height).

### Inputs
```tsx
className="block w-full px-3.5 py-2.5 rounded-lg
           border border-zinc-300 bg-white text-zinc-900 text-sm
           placeholder:text-zinc-400
           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
           transition-all duration-200"
```

Labels: `text-sm font-medium text-zinc-700 mb-1.5`

### Cards
```tsx
className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm
           hover:shadow-md hover:border-zinc-300
           transition-all duration-200"
```

### Tables
- Headers: `text-xs font-semibold uppercase tracking-wide text-zinc-500`
- Cell padding: `px-4 py-3`
- Row hover: `hover:bg-zinc-50`
- Borders: only between rows (`divide-y divide-zinc-200`), no vertical lines

### Modals
- Backdrop: `bg-zinc-900/50 backdrop-blur-sm`
- Container: `bg-white rounded-2xl shadow-xl max-w-lg`
- Padding: `p-6`
- Use Radix Dialog primitive for a11y

## Effects & Polish

### Grain texture (hero sections)
Subtle SVG noise overlay on hero/landing sections for tactile premium feel. Implementation: utility class `.grain` defined in `globals.css`:
```css
.grain {
  position: relative;
}
.grain::after {
  content: '';
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
  opacity: 0.04;
  pointer-events: none;
  mix-blend-mode: multiply;
}
```
Use only on hero / large feature sections. NOT on cards or dense UI.

### Gradients
Only `white → zinc-50` (very subtle). Never colorful.

### Focus rings
Always visible, accent color, with offset:
`focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`

### Transitions
**All interactive elements get `transition-all duration-200`.** Only that. No spring physics, no scroll-driven animation, no Framer Motion (yet).

Allowed micro-interactions:
- Hover scale on cards/buttons: NONE (use shadow + border-color shift instead — cleaner)
- Hover translate on cards: optional `hover:-translate-y-0.5` for emphasis
- Active state: `active:scale-[0.98]` on buttons (very subtle press feedback)

### Loading states
- Skeleton loaders preferred over spinners for content
- Spinners only for button-internal loading
- Skeletons: `bg-zinc-200 animate-pulse rounded-lg`

### Empty states
Centered card with:
- Lucide icon (zinc-400, h-12 w-12)
- Heading (text-lg font-semibold text-zinc-900)
- Subtext (text-sm text-zinc-600)
- Primary CTA button

## Layout

- Max content width: `max-w-7xl` (1280px)
- Page horizontal padding: `px-6 md:px-8`
- Section vertical spacing: `py-16 md:py-24`
- Component gap: `gap-6` to `gap-8`
- Form field spacing: `space-y-4`

## Iconography

- **Library:** `lucide-react` (already installed). NEVER use emoji as icons in UI chrome — only in user-generated content or marketing.
- Default size: `h-5 w-5` for inline, `h-4 w-4` for dense UI
- Color: `text-zinc-500` for decorative, `text-current` to inherit

## Accessibility

- Color contrast: WCAG AA minimum (zinc-700 on white = 11.5:1, fine; never use zinc-400 for body text)
- Focus rings: always visible, never `focus:outline-none` without a `focus:ring-*` replacement
- All interactive elements: keyboard accessible, proper `aria-*` attrs
- Form inputs: always have `<label>` (visible or sr-only)
- Modals: trap focus, ESC to close (Radix handles this)

## Don'ts

- ❌ No Arial, Helvetica, Times, system default fonts in CSS
- ❌ No emoji in UI chrome (buttons, headers, nav)
- ❌ No more than 2 hues on screen at once
- ❌ No `rounded-none` or sharp corners on interactive elements
- ❌ No `box-shadow` heavier than `shadow-xl`
- ❌ No animated gradients, parallax scroll, or hero video
- ❌ No `font-bold` (use `font-semibold` — heavier weights look amateur in Geist)
- ❌ No purple, teal, or accent color other than indigo without explicit design approval
- ❌ No hardcoded hex colors — always Tailwind tokens

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

- ✅ Session 1: Auth scaffolding + landing + design system
- ⏳ Session 2: Dashboard pages, components, design-system migration of existing pages
- ⏳ Session 3: API routes + GitHub Actions crawl trigger + live progress polling

---

**Last updated:** 2026-05-15 (Session 1 complete; design system codified)
