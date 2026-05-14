# Competitive Tracker Web Dashboard

A production-ready Next.js 14 SaaS dashboard for tracking competitor intelligence with AI-powered insights.

## Features

- **User Authentication**: Email + password signup/login via Supabase Auth
- **Landing Page**: Hero section, feature list, and transparent pricing (Free/Pro/Enterprise)
- **Dashboard**: Protected routes, real-time competitor tracking (coming in Session 2)
- **Responsive Design**: Tailwind CSS + mobile-first layout

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS
- **Backend**: Supabase Auth + PostgreSQL
- **Deployment**: Vercel
- **Utilities**: Lucide icons, DOMPurify

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GITHUB_PAT=your-github-personal-access-token
GITHUB_REPO=farrukhj91/pm-competitive-research-tracker
```

### Running Locally

```bash
npm run dev
# Visit http://localhost:3000
```

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git remote add origin https://github.com/your-username/competitive-tracker-web.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub repo
3. Set environment variables
4. Deploy!

## Project Structure

```
app/
├── (auth)/               # Auth pages (signup, login, confirm)
├── (dashboard)/          # Protected dashboard routes
└── page.tsx             # Landing page with pricing

lib/
├── supabase.ts          # Supabase client
└── auth.ts              # Auth helpers
```

## Session Progress

- ✅ Session 1: Auth scaffolding + landing page
- ⏳ Session 2: Dashboard pages + competitor management
- ⏳ Session 3: API routes + GitHub Actions integration
