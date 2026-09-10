import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Search,
  Filter,
  Microscope,
  Layers,
  Sparkles,
  TrendingUp,
  Users,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

/* ---------------- content ---------------- */

const steps = [
  {
    icon: Search,
    title: 'It watches',
    body:
      'Every day it checks your competitors — websites, pricing pages, job posts, product announcements, and the places their customers talk publicly.',
  },
  {
    icon: Filter,
    title: 'It filters',
    body:
      'Most days nothing meaningful changed. It works that out cheaply and stops there. Only two or three percent is worth a closer look.',
  },
  {
    icon: Microscope,
    title: 'It investigates',
    body:
      'When something does look significant, it digs in — searches the web, reads the pages, checks the history, and decides when it has enough.',
  },
  {
    icon: Layers,
    title: 'It connects',
    body:
      'Once a week it reads everything together, including the quiet signals, and finds patterns no single alert would reveal.',
  },
];

const statusGroups = [
  {
    label: 'Available now',
    bar: 'from-emerald-400 to-teal-500',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    items: [
      'Daily monitoring of sites, pricing and changelogs',
      'Change detection since the last check',
      'AI-written analysis reports',
      'Email delivery with PDF',
      'Dashboard with report history',
      'AI competitor discovery at signup',
      'On-demand crawl with live progress',
    ],
  },
  {
    label: 'In progress',
    bar: 'from-indigo-400 to-violet-500',
    chip: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    items: [
      'Opportunity Gaps — the unmet-need analysis',
      'The Monday brief',
      'Deep investigation agent',
      'Same-day alerts for material changes',
      'Customer-voice sources',
      'Evidence links on every recommendation',
    ],
  },
  {
    label: 'Coming later',
    bar: 'from-zinc-300 to-zinc-400',
    chip: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    dot: 'bg-zinc-400',
    items: [
      'Connect your own support inbox',
      'Roadmap prediction from hiring signals',
      'Ask questions of your history',
      'Team accounts',
      'Slack delivery',
    ],
  },
];

const principles = [
  {
    title: 'We stay quiet when nothing happened',
    body:
      'A brief that says “nothing strategic this week” is a feature. Tools that justify themselves with volume train you to stop reading them.',
  },
  {
    title: 'We don’t probe anyone’s infrastructure',
    body:
      'Some tools here scan competitors’ cloud storage and search breach databases for their employees’ passwords. We don’t, and we won’t.',
  },
  {
    title: 'We don’t build on borrowed land',
    body:
      'Every source is an official interface or genuinely public. We left out the ones that can be switched off by someone else.',
  },
  {
    title: 'Every claim shows its evidence',
    body:
      'Each recommendation links back to what it was based on. Check the reasoning instead of trusting a score.',
  },
];

const plannedTiers = [
  { name: 'Free', price: '$0', features: ['1 business', '3 competitors', 'Weekly brief', 'Pricing alerts'] },
  {
    name: 'Starter',
    price: '$29',
    features: ['1 business', '8 competitors', 'Weekly brief', 'Pricing alerts', '5 investigations / day'],
    highlighted: true,
  },
  { name: 'Pro', price: '$99', features: ['3 businesses', '20 competitors', 'Your own feedback', '25 investigations / day'] },
];

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className={
        'text-xs font-semibold uppercase tracking-[0.16em] mb-4 ' +
        (light ? 'text-indigo-300' : 'text-indigo-600')
      }
    >
      {children}
    </p>
  );
}

/* ---------------- the gap diagram ---------------- */

function GapDiagram() {
  const asked = [
    { text: 'Simpler onboarding', hot: true },
    { text: 'Better CSV exports', hot: false },
    { text: 'Faster search', hot: false },
    { text: 'Bulk import', hot: false },
  ];
  const shipped = ['AI summaries', 'New pricing tier', 'Mobile app', 'Dark mode'];

  return (
    <div className="mt-14 grid lg:grid-cols-[1fr_auto_1fr_auto_1.15fr] gap-4 lg:gap-3 items-stretch">
      {/* asked for */}
      <div className="rounded-xl bg-white border border-zinc-200/80 p-5 float-card-sm lift">
        <div className="h-1 w-10 rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 mb-4" />
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">What people keep asking for</h3>
        <p className="text-xs text-zinc-500 mb-4">Public forums, reviews, community threads</p>
        <div className="flex flex-wrap gap-1.5">
          {asked.map((a) => (
            <span
              key={a.text}
              className={
                'text-xs px-2.5 py-1 rounded-md border ' +
                (a.hot
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium'
                  : 'bg-zinc-50 text-zinc-600 border-zinc-200')
              }
            >
              {a.text}
            </span>
          ))}
        </div>
      </div>

      {/* operator */}
      <div className="hidden lg:flex items-center justify-center">
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full
                         bg-white border border-zinc-200 text-zinc-400 text-sm font-medium shadow-sm">
          +
        </span>
      </div>

      {/* shipped */}
      <div className="rounded-xl bg-white border border-zinc-200/80 p-5 float-card-sm lift">
        <div className="h-1 w-10 rounded-full bg-gradient-to-r from-violet-400 to-indigo-500 mb-4" />
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">What rivals actually shipped</h3>
        <p className="text-xs text-zinc-500 mb-4">Changelogs, pricing pages, announcements</p>
        <div className="flex flex-wrap gap-1.5">
          {shipped.map((s) => (
            <span
              key={s}
              className="text-xs px-2.5 py-1 rounded-md bg-zinc-50 text-zinc-600 border border-zinc-200"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* operator */}
      <div className="hidden lg:flex items-center justify-center">
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full
                         bg-white border border-zinc-200 text-zinc-400 text-sm font-medium shadow-sm">
          =
        </span>
      </div>

      {/* the gap */}
      <div className="relative gradient-ring rounded-xl p-5 float-card lift
                      bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/70">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center justify-center h-5 w-5 rounded-md chip-gradient">
            <Sparkles className="h-3 w-3" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-indigo-700">
            The gap
          </span>
        </div>
        <p className="text-base font-medium text-zinc-900 leading-snug mb-3">
          Simpler onboarding is the one thing people keep asking for — and the one thing nobody
          has shipped.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/80 border border-zinc-200 text-zinc-600">
            asked 4×
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/80 border border-zinc-200 text-zinc-600">
            shipped by 0 of 5
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/80 border border-zinc-200 text-zinc-600">
            open 6 months
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- the product illustration ---------------- */

function BriefMockup() {
  return (
    <div className="relative">
      <div className="rounded-2xl bg-white border border-zinc-200/80 float-card overflow-hidden">
        {/* window chrome */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200/80 bg-zinc-50/60">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          </div>
          <span className="font-mono text-[11px] text-zinc-500">Monday brief · 9 Sep</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5
                           rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1 w-1 rounded-full bg-emerald-500 pulse-dot" />
            Live
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Opportunity Gap */}
          <div className="gradient-ring rounded-xl bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/60 p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-md chip-gradient">
                <Sparkles className="h-3 w-3" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-indigo-700">
                Opportunity Gap
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-zinc-900 mb-3">
              Three competitors have users complaining about onboarding complexity.
              None has shipped a fix in six months. This gap is open.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['4 threads', '3 changelogs', '2 pricing pages', 'high confidence'].map((t) => (
                <span
                  key={t}
                  className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/80 border border-zinc-200 text-zinc-600"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* signal rows */}
          <div className="space-y-2">
            {[
              { Icon: TrendingUp, text: 'Entry price raised 20%, no announcement', tag: 'high', tone: 'text-rose-600 bg-rose-50 border-rose-200' },
              { Icon: Users, text: 'Six ML engineering roles opened this week', tag: 'medium', tone: 'text-amber-600 bg-amber-50 border-amber-200' },
            ].map((row) => (
              <div
                key={row.text}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-200/80 bg-white"
              >
                <row.Icon className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                <span className="text-[13px] text-zinc-700 flex-1 truncate">{row.text}</span>
                <span className={'text-[10px] font-medium px-1.5 py-0.5 rounded border ' + row.tone}>
                  {row.tag}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-50/70">
              <Minus className="h-3.5 w-3.5 text-zinc-300 flex-shrink-0" />
              <span className="text-[13px] text-zinc-400 italic">
                14 other signals — nothing worth your time
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* floating accent card */}
      <div className="hidden lg:block absolute -right-8 -bottom-8 w-52 rounded-xl bg-white
                      border border-zinc-200/80 float-card-sm p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 mb-2">
          This week
        </p>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-3xl font-semibold tracking-tight gradient-text">2</span>
          <span className="text-xs text-zinc-500">worth acting on</span>
        </div>
        <p className="font-mono text-[10px] text-zinc-400">from 19 signals</p>
      </div>
    </div>
  );
}

/* ---------------- page ---------------- */

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 overflow-x-clip">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-8 h-16">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            {[['How it works', '#how'], ["What's built", '#status'], ['Pricing', '#pricing']].map(
              ([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  {label}
                </Link>
              ),
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 px-3 py-2 rounded-lg
                         hover:bg-zinc-100 transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Get started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mesh angled-b pb-40 md:pb-56">
        <div className="absolute inset-0 dot-grid opacity-[0.35] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 md:px-8 pt-24 md:pt-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80
                          border border-zinc-200/80 text-zinc-600 text-xs font-medium mb-8
                          backdrop-blur-sm shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
            Early access — building in the open
          </div>

          <h1 className="text-5xl md:text-[4.5rem] font-semibold tracking-tight text-zinc-900 mb-7
                         leading-[1.02]">
            Know what to{' '}
            <span className="gradient-text">build next.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            An AI analyst watches your competitors and your customers all week, then sends you the
            two or three things actually worth acting on — with the evidence behind each one.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start free
              </Button>
            </Link>
            <Link href="#how">
              <Button size="lg" variant="secondary">
                See how it works
              </Button>
            </Link>
          </div>

          <p className="text-xs text-zinc-500 mt-6">Free during early access · No credit card</p>
        </div>
      </section>

      {/* Floating product mockup, breaking the seam */}
      <div className="relative z-10 -mt-32 md:-mt-44 mb-24 md:mb-32">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <BriefMockup />
        </div>
      </div>

      {/* Problem */}
      <section className="border-t border-zinc-200/70">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-24 md:py-28">
          <Eyebrow>The problem</Eyebrow>
          <h2 className="text-3xl md:text-[2.75rem] font-semibold tracking-tight text-zinc-900 mb-6 leading-[1.12]">
            You find out too late, from a customer.
          </h2>
          <div className="space-y-5 text-base md:text-lg text-zinc-600 leading-relaxed">
            <p>
              A competitor quietly changes their pricing. Customers start complaining about a problem
              nobody has solved. A rival begins hiring hard in a department that tells you exactly
              where they&apos;re heading.
            </p>
            <p>
              Any of these could change what you build next quarter. Most of the time you hear about
              it weeks late, in a sales call you just lost.
            </p>
          </div>
          <div className="mt-8 inline-flex items-baseline gap-3 px-5 py-4 rounded-xl
                          bg-gradient-to-r from-indigo-50 to-sky-50 border border-indigo-100">
            <span className="text-3xl font-semibold tracking-tight gradient-text">5–10 hrs</span>
            <span className="text-sm text-zinc-600">a week to keep up. Almost nobody has them.</span>
          </div>
        </div>
      </section>

      {/* Opportunity Gap */}
      <section className="relative border-t border-zinc-200/70 bg-zinc-50/50 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full
                        bg-gradient-to-br from-indigo-200/40 to-sky-200/30 blur-3xl pointer-events-none drift" />
        <div className="relative max-w-5xl mx-auto px-6 md:px-8 py-24 md:py-28">
          <div className="max-w-2xl">
            <Eyebrow>What makes it different</Eyebrow>
            <h2 className="text-3xl md:text-[2.75rem] font-semibold tracking-tight text-zinc-900 mb-6 leading-[1.12]">
              Most tools tell you what competitors did.
              <br />
              <span className="gradient-text">We tell you what nobody is doing.</span>
            </h2>
            <p className="text-base md:text-lg text-zinc-600 leading-relaxed">
              Watching competitors alone only ever makes you a fast follower. The valuable answer sits
              where an unmet customer need meets a gap none of your competitors has filled. Finding it
              needs both halves of the picture at once — which is why nobody else produces it.
            </p>
          </div>

          <GapDiagram />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-zinc-200/70 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-24 md:py-28">
          <div className="max-w-2xl mb-14">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="text-3xl md:text-[2.75rem] font-semibold tracking-tight text-zinc-900 leading-[1.12]">
              Four steps, running quietly in the background.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-14 gap-y-11">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="flex gap-5 reveal">
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl
                                    chip-gradient shadow-lg shadow-indigo-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="min-w-0 pt-1">
                    <div className="flex items-baseline gap-2.5 mb-2">
                      <span className="font-mono text-xs text-zinc-400">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-base text-zinc-600 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Status */}
      <section id="status" className="border-t border-zinc-200/70 bg-zinc-50/50 scroll-mt-16">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-24 md:py-28">
          <div className="max-w-2xl mb-14">
            <Eyebrow>Where we are</Eyebrow>
            <h2 className="text-3xl md:text-[2.75rem] font-semibold tracking-tight text-zinc-900 mb-5 leading-[1.12]">
              Built in the open, honestly labelled.
            </h2>
            <p className="text-base md:text-lg text-zinc-600 leading-relaxed">
              Plenty of products advertise features that don&apos;t exist yet. Here&apos;s exactly what
              works today, what we&apos;re building now, and what comes after.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {statusGroups.map((group) => (
              <div
                key={group.label}
                className="relative rounded-2xl border border-zinc-200/80 bg-white overflow-hidden float-card-sm lift reveal"
              >
                <div className={'h-1 w-full bg-gradient-to-r ' + group.bar} />
                <div className="p-6 md:p-7">
                  <span
                    className={
                      'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border mb-6 ' +
                      group.chip
                    }
                  >
                    <span className={'h-1.5 w-1.5 rounded-full ' + group.dot} />
                    {group.label}
                  </span>
                  <ul className="space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className={'h-1.5 w-1.5 rounded-full flex-shrink-0 mt-2 ' + group.dot} />
                        <span className="text-sm text-zinc-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles — dark band */}
      <section className="relative mesh-dark overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-[0.06] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 md:px-8 py-24 md:py-32">
          <div className="max-w-2xl mb-14">
            <Eyebrow light>How we work</Eyebrow>
            <h2 className="text-3xl md:text-[2.75rem] font-semibold tracking-tight text-white leading-[1.12]">
              Things we deliberately don&apos;t do.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-14 gap-y-10">
            {principles.map((pr) => (
              <div key={pr.title} className="reveal">
                <div className="h-1 w-10 rounded-full bg-gradient-to-r from-indigo-400 to-sky-400 mb-4" />
                <h3 className="text-lg font-semibold tracking-tight text-white mb-2.5">{pr.title}</h3>
                <p className="text-base text-zinc-400 leading-relaxed">{pr.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-zinc-200/70 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-24 md:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="text-3xl md:text-[2.75rem] font-semibold tracking-tight text-zinc-900 mb-5 leading-[1.12]">
              Free while we&apos;re in early access.
            </h2>
            <p className="text-base md:text-lg text-zinc-600 leading-relaxed">
              Everything that works today is free, no card required. When paid plans arrive, early
              users keep free access to what they already have.
            </p>
          </div>

          <div className="relative max-w-xl mx-auto mb-16 glow">
            <div className="relative rounded-2xl mesh-dark text-white p-9 md:p-11 text-center overflow-hidden float-card">
              <div className="absolute inset-0 dot-grid opacity-[0.07]" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300 mb-4">
                  Early access
                </p>
                <p className="text-6xl font-semibold tracking-tight mb-3">Free</p>
                <p className="text-sm text-zinc-400 mb-8">1 business · up to 5 competitors</p>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="w-full bg-white text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Start free
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400 mb-8">
            Planned pricing — not live yet
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {plannedTiers.map((tier) => (
              <div
                key={tier.name}
                className={
                  'relative rounded-xl p-6 bg-white lift ' +
                  (tier.highlighted
                    ? 'gradient-ring border border-transparent float-card-sm'
                    : 'border border-zinc-200/80')
                }
              >
                <div className="flex items-baseline justify-between mb-5">
                  <h3 className="text-base font-semibold tracking-tight text-zinc-900">{tier.name}</h3>
                  <span className="text-2xl font-semibold tracking-tight text-zinc-900">
                    {tier.price}
                    {tier.price !== '$0' && (
                      <span className="text-xs font-normal text-zinc-500">/mo</span>
                    )}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-indigo-600" />
                      <span className="text-sm text-zinc-700 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-zinc-500 mt-8 max-w-lg mx-auto leading-relaxed">
            Pricing-change alerts are included on every plan, including free — most tools charge
            three times their entry price for that one signal.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mesh angled-t overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-[0.35] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 md:px-8 pt-32 md:pt-40 pb-24 md:pb-28 text-center">
          <h2 className="text-3xl md:text-[2.75rem] font-semibold tracking-tight text-zinc-900 mb-5 leading-[1.12]">
            Set it up once.
            <br />
            <span className="gradient-text">Read it on Monday.</span>
          </h2>
          <p className="text-base md:text-lg text-zinc-600 mb-9 leading-relaxed max-w-xl mx-auto">
            Tell us about your business and we&apos;ll find your competitors for you. Takes about a
            minute.
          </p>
          <Link href="/signup">
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200/70">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 flex flex-col md:flex-row
                        items-center justify-between gap-5">
          <Logo size="sm" />
          <div className="flex items-center gap-7">
            {[['How it works', '#how'], ["What's built", '#status'], ['Pricing', '#pricing']].map(
              ([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  {label}
                </Link>
              ),
            )}
          </div>
          <p className="text-xs text-zinc-500">© 2026 · Built in the open</p>
        </div>
      </footer>
    </div>
  );
}

