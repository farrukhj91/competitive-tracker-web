# Market Research & Competitive Analysis

> Companion to the build plan. This document holds the evidence behind the product decisions: landscape, competitor teardown, source evaluation, pricing benchmarks, and platform-risk analysis. The build plan itself stays execution-only.
>
> **Research date:** July 2026 · **Analyst numbers are directional** — published market sizes vary wildly by scope definition.

---

## 1. Market size

Competitive-intelligence software: **~$2.6B (2025) → ~$3.2B (2026)**, CAGR **10–12%**. Adjacent customer-intelligence / VoC tooling adds several billion more.

Published estimates range from $29M to $18B depending on whether the analyst counts "software," "tools," or the broader intelligence stack. Treat the ~$3B figure as directional only.

**Honest read: TAM is not the constraint.** Nearly all of that revenue sits in enterprise contracts. The reason to build is the *structural gap* in §4, not market size.

---

## 2. The landscape, in three tiers

### Tier 1 — Enterprise CI ($15k–100k/yr)
Crayon (~$25–60k/yr, entry ~$15–16k) · Klue (~$30–100k/yr) · Kompyte (Semrush-owned, quote-only, positioned below Crayon/Klue) · Contify · AlphaSense.

Sales-enablement led: battlecards, win/loss, deal support. Quote-based with heavy negotiation. **Structurally cannot serve a solo PM** — the pricing and onboarding model forbids it.

### Tier 2 — Enterprise product / customer intelligence ($24k–50k+/yr)
Enterpret (~$36k median ACV, $50k+ typical; unifies 50+ feedback sources, five-level adaptive taxonomy) · Unwrap.ai (~$24k entry; strong on app-store and consumer channels) · Chattermill · Productboard · Cycle (feedback-to-roadmap latency) · **Dovetail ($30/user/mo — the price exception)**.

These do the *synthesis* job well, but are priced for teams with budget owners.

### Tier 3 — Low-end AI CI ($20–149/mo) — **CROWDED**
Argus Intel ($49/$149) · IndustryLens (€59) · IntelCue · Sai (free + $20 Pro) · Competely · RivalOut · Watchful.ai · Parano.ai · Linkeddit · PainOnSocial · Octolens · SubredditSignals.

⚠️ **This is the "another project management tool" trap.** If the product were "affordable competitor monitoring for small teams," the correct decision would be *don't build it*.

---

## 3. Two casualties — and the different lessons they teach

### Unkover (YC S23)
$79/mo competitive intelligence for lean GTM teams, 5 competitors, ~6 signal sources. Battlecards, win/loss and AI scoring were on the roadmap but never shipped.

**Status:** the live product is gone. The site now reads *"The Unkover competitive intelligence platform is being reimagined. Stay tuned for something new,"* and functions as an ungated CI content/SEO hub.

> **Lesson: monitoring alone isn't a business.** A YC-backed team in precisely this niche could not make pure-play alerting work. The alerts are commoditized; the judgment is the product.

### GummySearch
Reddit pain-point discovery for indie hackers and founders. Shut down **30 November 2025**.

**The numbers at shutdown: $35K MRR, profitable, thousands of paying customers.** It died because it could not reach a commercial licensing agreement with Reddit. Reddit's commercial API (~$0.24/1k calls) made continuously scanning thousands of subreddits economically impossible for a solo operation. The founder noted that operating without a license "under the constant threat of a cease-and-desist" was not a sustainable way to run a business.

> **Lesson: demand for this job-to-be-done is proven and currently unserved — and platform dependency is lethal.** Killed by platform risk, not by lack of demand.

---

## 4. The validated pain (the wedge)

Practitioner complaints across the category converge on one thing, and it is **not** coverage:

> Competitor monitoring tools create alert overload — a flood of low-value alerts that drown out the signals that matter. "Organizations are spending more than ever on intelligence tools and getting less confident in their ability to compete… they're swimming in data. More data and better decisions aren't the same thing." **"Someone still has to decide what matters and what's noise."**

On the discovery side, continuous discovery is the accepted best practice, yet **fewer than 1 in 5 product teams manage weekly customer touchpoints.** The episodic quarterly study is being abandoned because insight arrives too late to inform the decision it was meant to serve.

And on what PMs actually need — the framing that produced our hero feature:

> "Identifying what your customers need is only half the picture. The other half is understanding where competitors are — and aren't — meeting those needs. **That intersection is where the most valuable product gaps live.**"
>
> "The most common mistake PMs make with competitive intelligence is treating it as a feature gap analysis."

**Unserved job:** *decide what matters and tell me what to do about it, weekly, without me doing the research.* Tier 3 sells alerts. Tier 2 sells synthesis at $24k+. **Nobody sells judgment at solo-PM prices.**

---

## 5. Argus Intel teardown (nearest competitor)

**Positioning:** *"Know what your competitors are building before they announce it."*

**Stack:** 30 sources, AI signal scoring (1–5), weekly narrative brief **per competitor**, AI battlecards, win/loss tracker, Slack bot. Runs Claude Haiku + Sonnet. Self-serve, "live in 5 minutes, no sales call."

### Plans and real limits

Three source tiers: **Standard** (13, all plans) · **Advanced** (12, Pro+) · **Dark** (5, Enterprise only).

| | Starter $49 *(beta; list $99)* | Pro $149 *(beta; list $299)* | Enterprise |
|---|---|---|---|
| Companies | 5 | 20 | Custom |
| **Sources** | **13 (Standard only)** | 25 (+Advanced) | 30 (+Dark) |
| Scan interval | 2 hr | 60 min | 30 min |
| Signal history | 90 days | 1 yr | Unlimited |
| Deep analyses/day | **3** | 10 | Unlimited |
| Battlecards/day | **3** | 15 | Unlimited |
| Slack bot / API | **✗** | ✓ | ✓ |
| Signal calibration | **✗** | ✓ | ✓ |
| CRM integration | **✗** | ✓ | ✓ |

Trial: 14 days, 3 companies, no credit card. "Beta pricing locks in permanently" — reads as anchoring.

### Badge semantics (verified on /sources)

The first badge is the **plan tier** (Standard/Advanced/Dark). The second is the **underlying provider's access requirement**, not packaging:

- `Free` — the API itself is free
- `Free tier` — freemium service (Shodan InternetDB, LeakIX)
- `Token needed` — Facebook Ad Library
- `API keys needed` — DeHashed / IntelligenceX
- `Brave key recommended` — Brave Search API
- `No Tor needed` — Ransomwatch is a clearnet aggregator *(decisive: this cannot mean "included in your package")*

Provider lines confirm it: *"Shodan InternetDB (free tier)"*, *"CourtListener free API"*, *"BGPView.io free API"*.

> **Implication: their data providers really are near-free. The moat is engineering time — ~30 adapters built and maintained — not capital.**

### The nine gaps

**① They collect demand data but never synthesize opportunity from it.**

Argus *does* have demand-side sources — Reddit & HN, Customer Reviews (Reddit/G2/Capterra), App Store updates. The gap is not collection; it is what they do with it. Those sources are wired as **brand monitoring** — *"what are people saying about competitor X?"* — feeding a per-competitor signal feed. Their own comparison pages contain **no voice-of-customer synthesis and no opportunity identification from customer input.** Nothing asks *"what unmet need exists across this market that nobody is serving?"*

→ Argus can make you a fast follower, not an inventor. It has both raw inputs on the table and never multiplies them.

→ **This is a better moat than a missing source.** A source is a weekend's work to add; a synthesis layer means rebuilding their per-competitor data model for buyers who are asking for battlecards.

**② Per-competitor briefs, not market synthesis.** Briefs are generated per competitor. Five competitors = five briefs. Nothing connects patterns across them — the PM still does the synthesis, which is the actual job.

**③ Sales-enablement centre of gravity.** Battlecards, win/loss, CRM integrations, Slack bot for reps. Their ICP list leads with founders/CEOs and includes "security-focused product marketers." A PM is a secondary user; outputs are deal ammo, not roadmap decisions.

**④ Breadth over relevance — OSINT theater.** Shodan, S3 bucket detection, cert transparency, BGP/ASN mapping, dark web credentials, ransomware leak sites, paste sites, Google dorking. Impressive on a landing page; for a solo PM planning next quarter, a competitor's subdomain structure is noise. **"30+ sources" is tier-gated: $49 buys 13.**

**⑤ No recommendations relative to *your* product.** "Roadmap predictions" predict the *competitor's* roadmap — not what you should do given your positioning and constraints. Observations, not decisions.

**⑥ The entry tier paywalls the best PM signal.** **Pricing Watch is Advanced (Pro $149+)** — as are Wayback diffs, Hiring Velocity, and Ad Library. Pricing change is arguably the single highest-value competitive signal for a PM.

Of the 13 Standard sources a $49 customer receives, roughly five are near-useless to a solo B2B SaaS PM:

| Standard source | Value to our ICP |
|---|---|
| Website Changes | ✅ High |
| Job Postings | ✅ High (roadmap leak) |
| News & Press | ✅ High |
| Customer Reviews | ✅ High |
| Reddit & Hacker News | ✅ High *(but platform risk)* |
| Product Hunt | ✅ Moderate |
| GitHub Activity | ⚠️ Conditional — dev tools only |
| App Store Updates | ⚠️ Conditional — many B2B have no app |
| SEC Filings | ❌ Competitors are private startups |
| Patent Filings | ❌ Rare; 12–24 month lag |
| USPTO Trademarks | ❌ Marginal |
| HuggingFace Models | ❌ AI/ML competitors only |
| Certificate Transparency | ❌ Infrastructure noise |

→ **Attack surface: our entry tier includes pricing monitoring, which theirs gates behind 3× the price.**

**⑦ "Free" is fragile at their refresh rates.**

- News & Press polls **every 15 min** via Brave/DDG. **Brave killed its free tier in Feb 2026** (~$5/1k queries; existing subscribers grandfathered). At 15-min × 20 competitors ≈ 57.6k queries/mo ≈ **~$288/mo on a $149 plan.** They are almost certainly leaning on DuckDuckGo scraping — free but blockable.
- Reddit at 60-min refresh + Customer Reviews (Reddit/G2/Capterra) at 4 hr = **the exact exposure that killed GummySearch**, plus ToS-gray scraping.
- LinkedIn Monitor / Employee Signals depend on scraping with a paid-search fallback.

**⑧ No evidence transparency.** A model assigns 1–5; you trust it or you don't. No show-your-work.

**⑨ No first-party data, and no "quiet week" possible.** Structurally locked out of the user's own customer feedback. And a continuous scored feed cannot report "nothing mattered this week" — volume *is* the value proposition.

### Why they can't easily copy us

Not "we'd have more features" — **their business model resists the move.** Their data model is competitor-entity-centric; their battlecard and win-loss buyers want ammo rather than roadmap advice; their pricing ladder rewards source count over synthesis quality; and first-party connectors require a trust and onboarding motion that their self-serve OSINT positioning doesn't support.

---

## 6. Positioning conclusion

**Reject:** "affordable competitive intelligence" — commoditized, 12+ competitors, price race toward $20, one YC casualty.

**Adopt:** **the discovery analyst for teams too small to have one.** Not "we watch more sources" — *"we tell you the two things worth acting on this week, with evidence, and we stay quiet when nothing matters."*

### Hero feature — the Opportunity Gap

The one artifact Argus structurally cannot produce, because it requires both sides of the data multiplied together:

> *"Three of your competitors have users complaining about onboarding complexity in reviews and forums. None has shipped a fix in six months. This gap is open — here's the evidence, and here's what shipping against it would look like."*

That is *unmet customer need × competitor blind spot* — the intersection practitioners name as where the most valuable product gaps live. A **product-discovery output**, not a competitive-intelligence output.

### Differentiator matrix

| Differentiator | Why Tier 3 doesn't have it |
|---|---|
| **Opportunity Gap** (demand × supply) | They collect both sides but never multiply them |
| **Cross-competitor market synthesis** | Briefs are per-competitor by design |
| **Recommendations for *your* product** | Their outputs describe competitors |
| **"Quiet week" honesty** | Volume is their value prop |
| **Evidence-linked show-your-work** | Opaque 1–5 scores |
| **Pricing watch at entry tier** | Theirs is paywalled at $149 |
| **First-party feedback connectors** (Pro) | Locked out by self-serve OSINT positioning |
| **No infrastructure probing** | Half their catalog is security OSINT |

### Saturation verdict

| Segment | Saturated? | Verdict |
|---|---|---|
| Enterprise CI | Yes, entrenched | Don't touch |
| Enterprise VoC / discovery | Yes, well-funded | Don't touch |
| Low-end competitor alerts | **Yes — dangerously** | **Don't compete here** |
| Reddit / community pain mining | Vacated by GummySearch, contested by successors | Opportunity, but platform-risky |
| **Cross-domain weekly synthesis for small teams** | **No** | **Build here** |

---

## 7. Source evaluation

**The constraint is adapter build + maintenance hours, not API cost.** At ~2–4 hrs each, 30 adapters is 60–120 evening hours spent on **collection** — the copyable layer — leaving nothing for **synthesis**, the layer that can't be copied.

### Build — 8 core

**Supply side (5)**

| Source | Effort | Rationale |
|---|---|---|
| Website + changelog/blog diffs | ✅ built | Core product signal |
| Pricing watch (SHA fingerprint) | ~80% built | Highest-severity signal type; competitor paywalls it |
| Job postings — Ashby/Greenhouse/Lever/Workable | 1 shape × 4, free JSON | Best roadmap-leak signal available |
| News & funding — DuckDuckGo | Low | Funding, M&A, launches |
| Product Hunt | Free API, low volume | First public signal of a launch or pivot |

**Demand side (3)**

| Source | Effort | Rationale |
|---|---|---|
| Hacker News — Firebase API | Low | Free, permissive, **zero platform risk** |
| ⭐ **Public feature-request boards** — Canny · Nolt · Featurebase · UserVoice · GitHub Discussions | Medium | **Argus lacks this.** Literally *customers asking competitors for things they haven't shipped* — the Opportunity Gap in raw form. **Caveat:** exists for ~30–40% of competitors, and only ~1 in 10 enterprise users ever posts to one → high precision, low recall |
| Stack Overflow — free official API | Low | Real friction signal for dev-adjacent products |

### Stretch (only if Phase B runs ahead)

- **GitHub activity + issues** — free API; valuable *only* if competitors are dev tools
- **App-store reviews** — iTunes RSS free, Play needs scraping; *many B2B SaaS competitors have no mobile app*

### Deliberately skipped — and stated publicly

**Security OSINT** — Shodan, S3 bucket scanner, GitHub secret scanner, paste sites, breach monitor, cert transparency, subdomain enumeration, LeakIX, BGP/ASN, ransomware leak sites, DeHashed, Google dorking.

Two reasons. First, none of it informs a roadmap. Second — a **values line** worth stating publicly: scanning a competitor's storage buckets, secret-scanning their repositories, and searching breach databases for their employees' credentials is probing their infrastructure. Declining to do that is a positioning asset with a PM audience.

Also skipped: **SEC filings, patents, USPTO trademarks** (only meaningful for public/large firms; a solo PM's competitors are private startups) · **HuggingFace** (AI/ML niche) · **LinkedIn monitoring** (ToS violation, aggressive blocking, needs paid search) · **court records** (low signal-to-effort) · **battlecards, win/loss, CRM** (sales enablement — different ICP).

### Platform-risk exclusions

**Reddit.** Commercial API requires approval plus a paid agreement at ~$0.24/1k calls with a **~$12,000/month commercial minimum** — no smaller paid plan exists. The free tier is **non-commercial only**; Reddit's terms state that even a side project that might eventually monetize does not qualify. Since **May 2026** Reddit returns 403 on the unauthenticated endpoints many free tools relied on. **This is what killed GummySearch while it was profitable.**

*Argus crawls Reddit anyway — that is a live liability in their stack, not an advantage to copy.*

**G2 / Capterra.** ToS-gray scraping, brittle, same category of risk.

→ Positioning line: **"We don't build on borrowed land."**

### Pro-tier answer to platform risk

User-connected **first-party feedback** — their own support inbox, Intercom, review feeds. Zero platform risk, highest-signal discovery input that exists, raises switching cost, and structurally unavailable to a self-serve OSINT competitor.

### Cadence discipline as cost control

Argus refreshes news and jobs every **15 minutes**. We refresh **daily with adaptive backoff**. For a product whose promise is weekly synthesis, 15-minute freshness buys nothing — and it is precisely what turns a tool into a firehose. Our cadence is simultaneously cheaper, more durable against rate limits, and more consistent with the positioning.

---

## 8. Pricing benchmarks

| Reference point | Figure |
|---|---|
| Enterprise CI | $15k–100k/yr |
| Enterprise VoC | $24k–50k/yr |
| Tier 3 AI CI | $20–149/mo |
| Solo-founder SaaS sustainable range | $29–199/mo |
| Willingness to pay by geography | US ~$99 · EU ~$49 · Asia ~$29 |
| **SMB monthly churn** | **~8.2%** (vs ~1% enterprise) |
| Developer-tool churn | 2–5%/mo, 80–90% margins |

**Our hypothesis:** $29–49 entry **including pricing-watch** (attacking the competitor's paywall) · $99+ Pro with first-party connectors.

⚠️ **The 8.2% SMB churn benchmark is the sobering number.** Retention depends entirely on the weekly brief being genuinely good — which is what the eval framework exists to guarantee, and why "quiet week" honesty matters more than volume.

---

## 9. Expansion paths

1. **First-party feedback connectors** → Pro tier; eliminates platform risk; deepens the moat
2. **Team seats + shared insight workspace** → moves into the $300–1000/mo band without changing the engine
3. **Adjacent ICPs on the same engine** — agencies (client markets), VCs (portfolio monitoring), consultants. Multi-tenant already exists; this is repositioning, not rebuilding
4. **Roadmap inference** (job posts, changelogs, conference talks → where competitors are heading) — the deferred third input, as a paid-tier upgrade rather than MVP scope

---

## 10. Sources

- [Argus Intel](https://www.argusintel.net/) · [/sources](https://www.argusintel.net/sources) · [/limits](https://www.argusintel.net/limits) · [vs Kompyte](https://www.argusintel.net/compare/kompyte) · [vs Unkover](https://www.argusintel.net/compare/unkover)
- [Unkover — current status](https://unkover.com/)
- [GummySearch — The Final Chapter](https://gummysearch.com/final-chapter/)
- [Reddit API pricing & limits 2026](https://www.socialcrawl.dev/blog/reddit-data-api-2026)
- [Brave Search API free tier discontinued](https://www.implicator.ai/brave-drops-free-search-api-tier-puts-all-developers-on-metered-billing/)
- [CI software market size](https://www.openpr.com/news/4232959/competitive-intelligence-software-market-size-by-type)
- [Klue vs Crayon pricing](https://parano.ai/blog/klue-vs-crayon) · [Kompyte pricing](https://parano.ai/blog/kompyte-pricing)
- [Enterprise VoC platform pricing](https://www.enterpret.com/guides/customer-intelligence-ai-for-product-managers-5-platforms-evaluated-for-2026)
- [Competitor update noise / alert fatigue](https://meertrack.com/blog/competitor-update-noise-doing-more-harm-than-good)
- [Unmet needs × competitor gaps](https://www.competitiveintelligencealliance.io/unmet-needs/)
- [Competitive intelligence for PMs](https://www.userintuition.ai/reference-guides/competitive-intelligence-for-product-managers/)
- [2026 product discovery trends](https://getperspective.ai/blog/2026-product-discovery-trends-what-300-teams-changed)
- [Solo founder pricing playbook](https://www.promptstoproduct.com/solo-founder-pricing-playbook)
