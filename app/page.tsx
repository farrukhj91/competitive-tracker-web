import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Eye,
  Sparkles,
  Layers,
  Mail,
  Bell,
  Plug,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Track one business, get the full daily flow.',
    features: [
      '1 business',
      'Daily AI-powered crawls',
      'Email reports + PDF',
      'Up to 8 competitors',
      'Community support',
    ],
    cta: 'Get started free',
    ctaHref: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: 'per month',
    description: 'For analysts and small teams who need it all.',
    features: [
      'Unlimited businesses',
      'Daily crawls + on-demand',
      'Slack & email notifications',
      'Webhooks + API access',
      'Priority crawl queue',
      'Email support',
    ],
    cta: 'Start free trial',
    ctaHref: '/signup',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'tailored',
    description: 'For larger orgs and agencies.',
    features: [
      'Everything in Pro',
      'SSO + team seats',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
      'Whitelabel option',
    ],
    cta: 'Contact sales',
    ctaHref: 'mailto:hello@competitive-tracker.app',
    highlighted: false,
  },
];

const features = [
  {
    icon: Eye,
    title: 'Automated daily crawls',
    body: 'Pricing, features, blog, jobs, news, LinkedIn — captured every day without you lifting a finger.',
  },
  {
    icon: Sparkles,
    title: 'AI-powered insights',
    body: 'Claude analyzes every change and surfaces what matters: positioning shifts, hiring trends, pricing moves.',
  },
  {
    icon: Layers,
    title: 'Multi-source monitoring',
    body: 'Six data sources per competitor. SWOT, comparison matrices, and strategic recommendations included.',
  },
  {
    icon: Mail,
    title: 'Email reports + PDF',
    body: 'A polished briefing in your inbox each morning, plus a PDF you can forward, archive, or share.',
  },
  {
    icon: Bell,
    title: 'Real-time alerts',
    body: 'Slack notifications for material changes — pricing updates, leadership moves, funding news.',
  },
  {
    icon: Plug,
    title: 'Built to plug in',
    body: 'Webhooks, API access, and integrations with the tools your team already lives in.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 h-16">
          <Logo />
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
      <section className="grain hero-bg border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50
                          border border-indigo-200 text-indigo-700 text-xs font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Claude
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-zinc-900 mb-6
                         max-w-3xl mx-auto leading-[1.05]">
            Competitive intelligence,{' '}
            <span className="text-indigo-600">on autopilot.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track your competitors&apos; pricing, features, hiring, and news every day.
            Get a polished AI briefing in your inbox each morning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Start tracking — free
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="secondary">
                See pricing
              </Button>
            </Link>
          </div>
          <p className="text-xs text-zinc-500 mt-6">
            No credit card required · 1 business free, forever
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-24">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 mb-4">
              Everything you need to stay ahead
            </h2>
            <p className="text-base text-zinc-600 leading-relaxed">
              Six data sources, daily analysis, and the alerts you need — without hiring an analyst.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl border border-zinc-200 bg-white
                             hover:border-zinc-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg
                                  bg-indigo-50 text-indigo-600 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-900 mb-2 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{feature.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-24">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-base text-zinc-600 leading-relaxed">
              Start free. Upgrade when you need more businesses or richer alerts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={
                  'relative rounded-2xl p-8 transition-all duration-200 ' +
                  (tier.highlighted
                    ? 'bg-zinc-900 text-white border border-zinc-900 shadow-xl md:scale-105'
                    : 'bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm')
                }
              >
                {tier.highlighted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2
                                  bg-indigo-500 text-white px-3 py-1 rounded-full
                                  text-xs font-semibold tracking-wide">
                    Most popular
                  </div>
                )}

                <h3 className={`text-lg font-semibold tracking-tight mb-1 ${tier.highlighted ? 'text-white' : 'text-zinc-900'}`}>
                  {tier.name}
                </h3>
                <p className={`text-sm mb-6 ${tier.highlighted ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  {tier.description}
                </p>

                <div className="mb-6 flex items-baseline gap-1">
                  <span className={`text-4xl font-semibold tracking-tight ${tier.highlighted ? 'text-white' : 'text-zinc-900'}`}>
                    {tier.price}
                  </span>
                  <span className={`text-sm ${tier.highlighted ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    /{tier.period}
                  </span>
                </div>

                <Link href={tier.ctaHref}>
                  <Button
                    variant={tier.highlighted ? 'primary' : 'secondary'}
                    className={
                      'w-full mb-8 ' +
                      (tier.highlighted ? 'bg-white text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200' : '')
                    }
                  >
                    {tier.cta}
                  </Button>
                </Link>

                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className={`h-4 w-4 flex-shrink-0 mt-0.5 ${tier.highlighted ? 'text-indigo-400' : 'text-indigo-600'}`}
                      />
                      <span className={`text-sm ${tier.highlighted ? 'text-zinc-200' : 'text-zinc-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 mb-4">
            Ready to stop checking competitor sites manually?
          </h2>
          <p className="text-base text-zinc-600 mb-8 leading-relaxed">
            Set it up once. Get a polished briefing every morning.
          </p>
          <Link href="/signup">
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start tracking — free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-zinc-500">
            © 2026 Competitive Tracker. Built with care.
          </p>
        </div>
      </footer>
    </div>
  );
}
