import Link from 'next/link';
import { Check } from 'lucide-react';

export default function Home() {
  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        '1 business',
        'Daily crawls',
        'Email reports',
        'Basic competitor tracking',
        'Community support',
      ],
      cta: 'Get Started Free',
      ctaHref: '/signup',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$29.99',
      period: '/month',
      description: 'For serious competitive analysts',
      features: [
        'Unlimited businesses',
        'Daily crawls',
        'Email & Slack notifications',
        'Webhooks & custom integrations',
        'API access',
        'Priority crawls',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      ctaHref: '/signup',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large teams',
      features: [
        'Unlimited businesses',
        'Everything in Pro',
        'SSO & team management',
        'Dedicated support',
        'SLA guarantee',
        'Custom integrations',
      ],
      cta: 'Contact Sales',
      ctaHref: '/contact',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Competitive Tracker</h1>
        <div className="space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">
            Sign In
          </Link>
          <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Track Your Competitors in Real Time
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Get daily AI-powered insights on competitor pricing, features, hiring, and more. Stay ahead with automated competitive intelligence.
        </p>
        <div className="space-x-4">
          <Link
            href="/signup"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Start Free
          </Link>
          <button className="inline-block border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What You Get
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Automated Crawls', desc: 'Daily monitoring of 8-12 competitors' },
              { title: 'AI Analysis', desc: 'Claude-powered insights on changes & trends' },
              { title: 'Multi-Source', desc: 'Pricing, features, blog, news, LinkedIn, jobs' },
              { title: 'Email Reports', desc: 'Daily summaries delivered to your inbox' },
              { title: 'Real-Time Alerts', desc: 'Slack notifications for important changes' },
              { title: 'Easy Integration', desc: 'Webhooks, API, Zapier compatibility' },
            ].map((feature) => (
              <div key={feature.title} className="bg-white p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Simple, Transparent Pricing
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 ${
                tier.highlighted
                  ? 'border-2 border-blue-600 bg-blue-50 transform md:scale-105'
                  : 'border border-gray-200 bg-white'
              }`}
            >
              {tier.highlighted && (
                <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              )}
              <h4 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h4>
              <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                {tier.period && <span className="text-gray-600 text-sm">{tier.period}</span>}
              </div>
              <Link
                href={tier.ctaHref}
                className={`block w-full py-3 rounded-lg font-semibold text-center mb-8 transition ${
                  tier.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-gray-900 text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tier.cta}
              </Link>
              <div className="space-y-3">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center text-gray-600 text-sm">
          <p>&copy; 2026 Competitive Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
