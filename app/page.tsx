import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Search,
  Filter,
  Microscope,
  Layers,
  TrendingUp,
  Users,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

/* ---------------- content ---------------- */

const navLinks: [string, string][] = [
  ['How it works', '#how'],
  ["What's built", '#status'],
  ['Pricing', '#pricing'],
];

const watching = [
  'Websites',
  'Changelogs',
  'Pricing pages',
  'Job boards',
  'Announcements',
  'Public forums',
];

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
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
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
    dot: 'bg-indigo-600',
    text: 'text-indigo-700',
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
    dot: 'bg-zinc-300',
    text: 'text-zinc-500',
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
  {
    name: 'Free',
    price: '$0',
    features: ['1 business', '3 competitors', 'Weekly brief', 'Pricing alerts'],
  },
  {
    name: 'Starter',
    price: '$29',
    features: [
      '1 business',
      '8 competitors',
      'Weekly brief',
      'Pricing alerts',
      '5 investigations / day',
    ],
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$99',
    features: ['3 businesses', '20 competitors', 'Your own feedback', '25 investigations / day'],
  },
];

/* ---------------- small parts ---------------- */

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={'mono-label mb-5 ' + (light ? 'text-indigo-300' : 'text-indigo-600')}>
      {children}
    </p>
  );
}

/* ---------------- the gap diagram ---------------- */

function GapCard({
  title,
  source,
  items,
}: {
  title: string;
  source: string;
  items: { text: string; hot?: boolean }[];
}) {
  return (
    <div className="rounded-2xl bg-white p-6 elev-1">
      <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">{title}</h3>
      <p className="text-xs text-zinc-400 mt-1 mb-5">{source}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span
            key={it.text}
            className={
              'text-xs px-2.5 py-1 rounded-lg ' +
              (it.hot ? 'bg-indigo-600 text-white font-medium' : 'bg-zinc-100 text-zinc-600')
            }
          >
            {it.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function Operator({ symbol }: { symbol: string }) {
  return (
    <div className="hidden lg:flex items-center justify-center">
      <span className="text-lg text-zinc-300 font-light select-none">{symbol}</span>
    </div>
  );
}

function GapDiagram() {
  return (
    <div className="mt-14 grid lg:grid-cols-[1fr_auto_1fr_auto_1.2fr] gap-5 lg:gap-4 items-stretch">
      <GapCard
        title="What people keep asking for"
        source="Public forums, reviews, community threads"
        items={[
          { text: 'Simpler onboarding', hot: true },
          { text: 'Better CSV exports' },
          { text: 'Faster search' },
          { text: 'Bulk import' },
        ]}
      />

      <Operator symbol="+" />

      <GapCard
        title="What rivals actually shipped"
        source="Changelogs, pricing pages, announcements"
        items={[
          { text: 'AI summaries' },
          { text: 'New pricing tier' },
          { text: 'Mobile app' },
          { text: 'Dark mode' },
        ]}
      />

      <Operator symbol="=" />

      <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-6">
        <p className="mono-label text-indigo-600 mb-5">The gap</p>
        <p className="text-[17px] leading-snug text-zinc-900 mb-5 balance">
          Simpler onboarding is the one thing people keep asking for — and the one thing nobody has
          shipped.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {['asked 4×', 'shipped by 0 of 5', 'open 6 months'].map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] leading-none px-2 py-1 rounded-md bg-white text-indigo-700"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- the product illustration ---------------- */

function BriefMockup() {
  return (
    <div className="rounded-2xl bg-white border border-zinc-200/70 elev-ink overflow-hidden">
      {/* window chrome */}
      <div className="flex items-center justify-between px-5 h-12 border-b border-zinc-200/70">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
        </div>
        <span className="font-mono text-[11px] text-zinc-400">Monday brief · 9 Sep</span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
          Live
        </span>
      </div>

      <div className="p-5 md:p-6 space-y-3">
        {/* Opportunity Gap */}
        <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-5">
          <p className="mono-label text-indigo-600 mb-3">Opportunity Gap</p>
          <p className="text-[15px] leading-relaxed text-zinc-900 mb-4">
            Three competitors have users complaining about onboarding complexity. None has shipped a
            fix in six months. This gap is open.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {['4 threads', '3 changelogs', '2 pricing pages', 'high confidence'].map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] leading-none px-2 py-1 rounded-md bg-white text-indigo-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* signal rows */}
        <div className="space-y-2">
          {[
            {
              Icon: TrendingUp,
              text: 'Entry price raised 20%, no announcement',
              tag: 'high',
              tone: 'text-red-600 bg-red-50',
            },
            {
              Icon: Users,
              text: 'Six ML engineering roles opened this week',
              tag: 'medium',
              tone: 'text-amber-700 bg-amber-50',
            },
          ].map((row) => (
            <div
              key={row.text}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl border border-zinc-200/70"
            >
              <row.Icon className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
              <span className="text-[13px] text-zinc-700 flex-1 truncate">{row.text}</span>
              <span
                className={'text-[10px] font-medium px-2 py-1 rounded-md leading-none ' + row.tone}
              >
                {row.tag}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-3 px-3.5 py-3">
            <Minus className="h-3.5 w-3.5 text-zinc-300 flex-shrink-0" />
            <span className="text-[13px] text-zinc-400">
              14 other signals — nothing worth your time
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- page ---------------- */

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 overflow-x-clip">
      {/* Floating pill nav */}
      <header className="fixed top-4 inset-x-0 z-50 px-4">
        <nav
          className="max-w-5xl mx-auto flex items-center justify-between gap-6 h-14 pl-5 pr-2
                     rounded-full bg-zinc-950/85 backdrop-blur-xl border border-white/10
                     shadow-[0_8px_32px_rgba(9,9,11,0.24)]"
        >
          <Logo light size="sm" compact />

          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-[13px] text-zinc-400 hover:text-white transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/login"
              className="inline-flex text-[13px] font-medium text-zinc-300 hover:text-white
                         px-3 h-10 items-center rounded-full transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="inverse" className="h-10 px-4">
                Get started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="surface-ink-wash pt-36 md:pt-44 pb-44 md:pb-56">
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                       bg-white/5 border border-white/10 text-zinc-300 text-xs font-medium mb-9"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            Early access — building in the open
          </div>

          <h1 className="display text-[3rem] md:text-[5rem] leading-[1.02] font-semibold text-white mb-7 balance">
            Know what to build next.
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed balance">
            An AI analyst watches your competitors and your customers all week, then sends you the
            two or three things actually worth acting on — with the evidence behind each one.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" variant="inverse" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start free
              </Button>
            </Link>
            <Link href="#how">
              <Button size="lg" variant="inverseOutline">
                See how it works
              </Button>
            </Link>
          </div>

          <p className="text-xs text-zinc-400 mt-7">Free during early access · No credit card</p>
        </div>
      </section>

      {/* Product mockup, breaking the seam */}
      <div className="relative z-10 -mt-32 md:-mt-40">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <BriefMockup />
        </div>
      </div>

      {/* What it watches */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-14 md:py-16">
        <p className="mono-label text-zinc-400 text-center mb-6">What it watches</p>
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {watching.map((w) => (
            <span key={w} className="text-sm text-zinc-500">
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* Problem */}
      <section className="border-t border-zinc-200/70">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-24 md:py-32">
          <Eyebrow>The problem</Eyebrow>
          <h2 className="display text-[2rem] md:text-[3rem] leading-[1.08] font-semibold text-zinc-900 mb-7 balance">
            You find out too late, from a customer.
          </h2>
          <div className="space-y-5 text-base md:text-lg text-zinc-600 leading-relaxed">
            <p>
              A competitor quietly changes their pricing. Customers start complaining about a problem
              nobody has solved. A rival begins hiring hard in a department that tells you exactly
              where they&rsquo;re heading.
            </p>
            <p>
              Any of these could change what you build next quarter. Most of the time you hear about
              it weeks late, in a sales call you just lost.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-200/70 flex items-baseline gap-5">
            <span className="display text-4xl md:text-5xl font-semibold text-zinc-900">5–10</span>
            <span className="text-sm text-zinc-500 leading-relaxed">
              hours a week to keep up properly.
              <br />
              Almost nobody has them.
            </span>
          </div>
        </div>
      </section>

      {/* Opportunity Gap */}
      <section className="panel-muted border-t border-zinc-200/70">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <Eyebrow>What makes it different</Eyebrow>
            <h2 className="display text-[2rem] md:text-[3rem] leading-[1.08] font-semibold text-zinc-900 mb-7">
              Most tools tell you what competitors did.
              <br />
              <span className="text-zinc-500">We tell you what nobody is doing.</span>
            </h2>
            <p className="text-base md:text-lg text-zinc-600 leading-relaxed">
              Watching competitors alone only ever makes you a fast follower. The valuable answer
              sits where an unmet customer need meets a gap none of your competitors has filled.
              Finding it needs both halves of the picture at once — which is why nobody else produces
              it.
            </p>
          </div>

          <GapDiagram />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-zinc-200/70 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-24 md:py-32">
          <div className="max-w-2xl mb-16">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="display text-[2rem] md:text-[3rem] leading-[1.08] font-semibold text-zinc-900">
              Four steps, running quietly in the background.
            </h2>
          </div>

          <div className="divide-y divide-zinc-200/70 border-y border-zinc-200/70">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="grid md:grid-cols-[auto_1fr_1.4fr] gap-x-8 gap-y-3 py-9 reveal"
                >
                  <div className="flex items-start gap-5">
                    <span className="font-mono text-xs text-zinc-300 pt-3 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-zinc-100">
                      <Icon className="h-[18px] w-[18px] text-zinc-600" />
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-900 pt-2">
                    {step.title}
                  </h3>
                  <p className="text-base text-zinc-600 leading-relaxed pt-2">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Status */}
      <section id="status" className="panel-muted border-t border-zinc-200/70 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-24 md:py-32">
          <div className="max-w-2xl mb-16">
            <Eyebrow>Where we are</Eyebrow>
            <h2 className="display text-[2rem] md:text-[3rem] leading-[1.08] font-semibold text-zinc-900 mb-6">
              Built in the open, honestly labelled.
            </h2>
            <p className="text-base md:text-lg text-zinc-600 leading-relaxed">
              Plenty of products advertise features that don&rsquo;t exist yet. Here&rsquo;s exactly
              what works today, what we&rsquo;re building now, and what comes after.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {statusGroups.map((group) => (
              <div key={group.label} className="rounded-2xl bg-white p-7 elev-1 reveal">
                <div className="flex items-center gap-2 mb-7">
                  <span className={'h-1.5 w-1.5 rounded-full ' + group.dot} />
                  <span className={'mono-label ' + group.text}>{group.label}</span>
                </div>
                <ul className="space-y-3.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className={'h-1 w-1 rounded-full flex-shrink-0 mt-2.5 ' + group.dot}
                        aria-hidden="true"
                      />
                      <span className="text-sm text-zinc-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-t border-zinc-200/70">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-24 md:py-32">
          <div className="max-w-2xl mb-16">
            <Eyebrow>How we work</Eyebrow>
            <h2 className="display text-[2rem] md:text-[3rem] leading-[1.08] font-semibold text-zinc-900">
              Things we deliberately don&rsquo;t do.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-14 gap-y-12">
            {principles.map((pr) => (
              <div key={pr.title} className="reveal">
                <div className="h-px w-8 bg-zinc-900 mb-5" />
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900 mb-3">
                  {pr.title}
                </h3>
                <p className="text-base text-zinc-600 leading-relaxed">{pr.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="panel-muted border-t border-zinc-200/70 scroll-mt-24">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-24 md:py-32">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Eyebrow>Pricing</Eyebrow>
            <h2 className="display text-[2rem] md:text-[3rem] leading-[1.08] font-semibold text-zinc-900 mb-6">
              Free while we&rsquo;re in early access.
            </h2>
            <p className="text-base md:text-lg text-zinc-600 leading-relaxed">
              Everything that works today is free, no card required. When paid plans arrive, early
              users keep free access to what they already have.
            </p>
          </div>

          <div className="max-w-md mx-auto mb-20">
            <div className="rounded-2xl bg-white p-10 text-center elev-2">
              <p className="mono-label text-indigo-600 mb-6">Early access</p>
              <p className="display text-6xl font-semibold text-zinc-900 mb-3">Free</p>
              <p className="text-sm text-zinc-500 mb-9">1 business · up to 5 competitors</p>
              <Link href="/signup" className="block">
                <Button size="lg" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start free
                </Button>
              </Link>
            </div>
          </div>

          <p className="mono-label text-zinc-400 text-center mb-8">Planned pricing — not live yet</p>

          <div className="grid md:grid-cols-3 gap-5">
            {plannedTiers.map((tier) => (
              <div
                key={tier.name}
                className={
                  'rounded-2xl bg-white p-7 elev-1 ' +
                  (tier.highlighted ? 'ring-1 ring-indigo-600/25' : '')
                }
              >
                <div className="flex items-baseline justify-between mb-6">
                  <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">
                    {tier.name}
                  </h3>
                  <span className="display text-2xl font-semibold text-zinc-900">
                    {tier.price}
                    {tier.price !== '$0' && (
                      <span className="text-xs font-normal text-zinc-400 tracking-normal">/mo</span>
                    )}
                  </span>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-indigo-600" />
                      <span className="text-sm text-zinc-600 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-zinc-500 mt-10 max-w-lg mx-auto leading-relaxed">
            Pricing-change alerts are included on every plan, including free — most tools charge
            three times their entry price for that one signal.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="surface-ink-wash">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-28 md:py-36 text-center">
          <h2 className="display text-[2rem] md:text-[3.25rem] leading-[1.06] font-semibold text-white mb-6 balance">
            Set it up once.
            <br />
            Read it on Monday.
          </h2>
          <p className="text-base md:text-lg text-zinc-400 mb-10 leading-relaxed max-w-xl mx-auto">
            Tell us about your business and we&rsquo;ll find your competitors for you. Takes about a
            minute.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="inverse" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div
          className="max-w-6xl mx-auto px-6 md:px-8 py-12 flex flex-col md:flex-row
                     items-center justify-between gap-6"
        >
          <Logo size="sm" />
          <div className="flex items-center gap-7">
            {navLinks.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="font-mono text-[11px] text-zinc-400">© 2026 · Built in the open</p>
        </div>
      </footer>
    </div>
  );
}
