# Product Discovery Agent — Build Plan (v5)

> Companion doc **`MARKET-RESEARCH.md`** (written as first action of S5) holds the full landscape analysis, Argus Intel teardown, source-by-source evaluation, pricing benchmarks and citations. This file is execution only.

## Context

Evolving the Competitive Tracker (S1–S4: Python crawler + Supabase + Next.js/Vercel, deployed and working) into a **Product Discovery agent** for solo B2B SaaS PMs and founders — portfolio-grade and subscription-ready. Secondary goal: Farrukh learns the agentic-product build process firsthand; decisions get explained, not offloaded. A solutions architect is now advising.

**Hypothesis:** Solo B2B SaaS PMs waste 5–10 hrs/week tracking competitors, sifting feedback and deciding what to build. An agent that watches both sides and surfaces only the 2–3 things worth acting on weekly is worth $30–100/mo.

**Positioning:** ❌ "affordable competitive intelligence" (crowded — 12+ players, one YC casualty) → ✅ **the discovery analyst for teams too small to have one.** Not more sources — *"the two things worth acting on this week, with evidence, and silence when nothing matters."*

**Hero feature — the Opportunity Gap** (unmet need × competitor blind spot; nearest competitor structurally can't produce it):
> *"Three competitors have users complaining about onboarding complexity. None has shipped a fix in six months. This gap is open — here's the evidence and what shipping against it looks like."*

---

## Locked decisions

| | |
|---|---|
| ICP | Solo PMs / founders, B2B SaaS |
| **MVP scope (agreed w/ architect)** | **1 business per account · max 5 competitors.** Single tier for MVP — no paid ladder until the product is validated. Removes business-switcher UI, simplifies quotas, and caps per-tenant cost hard |
| Scale horizon | **MVP-first (~10–100 tenants)**; make only the cheap structural calls now — global/tenant split + pluggable adapters |
| LLM access | **Single shared Anthropic org key.** API requests are stateless — no shared context, no cross-tenant leakage. What *is* shared: rate limits (per-org), billing, and abuse-flag fate. **Self-hosting rejected** — ~100× cost at MVP scale, worse synthesis quality, and GPU ops a solo builder can't absorb |
| Token accounting | **Build in S5.** Log tokens + cost per request tagged by `account_id` and operation. Anthropic bills one number with no per-tenant attribution — without this, unit economics and honest quotas are impossible |
| RAG / analyst chat | **Deferred ~6 months.** A tenant's week fits in context; SQL beats vectors on cost, precision, debuggability. Later = one pgvector table with `tenant_id`, not new infra |
| Cross-tenant global layer | **Deferred past ~100 tenants** — no patterns to learn yet, zero privacy exposure |
| Synthesis cadence | **Fixed weekly default** + user setting (bi-weekly/monthly) + **on-demand as paid lever** |
| Collection cadence | **Adaptive backoff** per competitor/source — invisible to user, biggest crawl-cost lever |
| Architecture | 2 real agents + cheap pipeline steps + deterministic Inngest cron. **No LLM orchestrator** |
| Alerts | Email (Resend, existing) + dashboard flag cards |
| Dogfood | **Tenant 1 (truth):** this product tracking its own market. **Tenant 2 (demo):** Asana |
| Branding | Rebrand before build; must not anchor to "tracking/monitoring" |
| Pricing hypothesis | Free / **$29 Starter** / **$99 Pro** / Team later. **Pricing-watch at every tier** (competitor paywalls it at $149). Price on capacity, cap on tenant-triggered work |
| Quota model | Single `checkQuota()` gate; limits in DB config not code; **global spend circuit breakers** on top of per-tenant quotas |
| Budget | ~$5–10/mo during build |
| Competitive stance | **No feature parity.** Fewer sources, deeper synthesis, demand side they lack |

---

## Architecture

### Global / tenant split — the key structural decision
A competitor's pricing change is **one fact about the world**, not N facts about N customers. Crawl once, investigate once, personalize cheaply.

```
GLOBAL — keyed by competitor entity        TENANT — keyed by account
crawl → signals → triage → flags           personalization + weekly synthesis
shared by all tracking that entity          their context + first-party data
```

### Pipeline
```
Inngest cron (deterministic — no LLM)
│
├─ ON SIGNUP: Instant Teardown (Opus + web_search) → value before monitoring accrues
│
├─ COLLECT (adaptive daily): adapters → deterministic diff (free; kills 80–90%)
│     └─► signals                                        [global]
│
├─ TRIAGE: Haiku severity 1–5, BATCHED via Batch API (50% off) ~$0.001/signal
│     └─ top ~2–3% ──► INVESTIGATOR agent                [global]
│          Opus; tools: web_search, fetch_url, get_entity_history
│          HARD ~8-step budget in code · per-tenant daily quota by tier
│          pulls sibling signals as context (3 medium events > 1 alone)
│          └─► flags + investigations → INSTANT alert (email + dashboard)
│
└─ WEEKLY: SYNTHESIST agent                              [tenant]
     Opus + fetch-evidence tool. All signals + flags for this tenant's
     entities, both sides, including quiet ones.
     └─► insights + OPPORTUNITY GAPS → dashboard + brief
         May return "quiet week" — restraint is a feature
```

**Why only two agents.** *Monitor* answers "did anything change?" — fixed scope, daily, must be cheap and boringly reliable → pipeline + one Haiku call, **not an agent**. *Investigator* answers "what does this mean?" — dynamic scope, rare, allowed to be expensive → **real agent**. *Synthesist* goes wide across both data sides → **real agent**, and the only component that can produce Opportunity Gaps. Scheduling is cron + if-statements. The restraint is part of the portfolio story.

**Cost model.** At **MVP scope** (1 business × 5 competitors × 8 sources = 40 collection events/day/tenant; ~15% survive the deterministic diff): a few dollars a month total across all tenants. At **1,000 tenants** on the post-MVP ladder: triage ~$1–2/day · investigations ~$50–150/day · synthesis ~$150/day ≈ **$6–9k/mo on ~$49k revenue (~15% COGS)**. Without the funnel, ~100×.

### Shared-key architecture (single Anthropic org key)

API requests are **stateless** — no context accumulates across calls, so one key serving all tenants creates no leakage. Cross-tenant isolation is an application concern (scope every query by `business_id`), not an API one. Three things genuinely are shared:

| Shared | Consequence | Mitigation |
|---|---|---|
| **Rate limits** (per-org RPM / TPM) | All tenants draw one pool | Inngest per-function throttle · Batch API (separate pool, 50% cheaper) · daily/weekly cadence spreads load · usage tiers raise limits automatically as spend grows |
| **Billing** (one number, no attribution) | Can't see per-tenant cost | `token_usage` table — build in S5, not later |
| **Abuse-flag fate** | One tenant's input can flag the org | Inputs are crawled public content, not free-text user prompts; sanitise anything user-supplied |

**Prompt caching is an architectural win here:** cache is org-scoped and keyed on exact prefix content, so tenants tracking the same competitor **share cache hits on that entity's context**. The global/tenant split makes the shared key cheaper, not riskier.

**Self-hosting: rejected.** A single always-on A100/H100 is ~$1,100–2,200/mo rented — roughly **100× MVP API spend** — and doesn't approach break-even until far beyond projected volume. Open weights also trail frontier models precisely at synthesis, which *is* the product. Revisit only under high predictable volume, hard data-residency requirements, or extreme cost pressure on simple tasks. The only plausible future candidate is triage (high volume, low quality bar), and batched Haiku already costs ~$0.001/signal.

**BYOK** (customer supplies their own key) is a known lever if one heavy customer ever distorts costs — shifts both spend and rate limits to them. Wrong for this ICP today (most PMs have no API key; adds onboarding friction), noted for later.

### Tenant-level cost attribution

Anthropic bills one organisation-level number with **no per-tenant breakdown**. Without our own ledger we cannot compute unit economics, enforce quotas honestly, or tell whether a given tenant is profitable. Every SDK call goes through a thin wrapper that writes one row:

```sql
token_usage
  id              uuid
  account_id      uuid NULL      -- NULL = shared/global work, amortised across tenants
  entity_id       uuid NULL      -- which competitor entity, when applicable
  operation       text           -- 'triage'|'investigate'|'synthesize'|'teardown'
  model           text           -- e.g. claude-opus-4-7, claude-haiku-*
  input_tokens    int
  output_tokens   int
  cache_read_tokens  int         -- prompt-cache hits (shared layer benefits most)
  cost_usd        numeric(10,6)  -- computed at write time from current price table
  request_id      text           -- Anthropic response id, for support tickets
  created_at      timestamptz
```

**Why `account_id` is nullable.** Triage and investigations run on *global* competitor entities and are genuinely shared — if ten tenants track the same competitor, that cost is amortised across them. Logging it against one tenant would overstate their cost and understate everyone else's. Shared rows carry `account_id = NULL` and `entity_id` set; per-tenant work (synthesis, teardown) carries `account_id` set. True per-tenant margin = direct rows + a fair share of the shared rows for entities they track.

**Cost is computed at write time**, not derived later, so a price change doesn't retroactively rewrite history.

**What this unlocks:** unit economics per tenant, quota enforcement, cost-anomaly alerting (feeds the circuit breaker in §Quotas), and the COGS number in any future investor or portfolio write-up.

### Rate limits (ordered by impact)
1. **Entity dedup** — per-entity load, not per-tenant
2. **Adaptive backoff** — quiet competitors polled less
3. **Token bucket per upstream source** — Inngest per-function concurrency/throttle; GitHub throttling never stalls the HN queue
4. **Batch API** for all non-urgent LLM work
5. **Prompt caching** — tenant context identical across calls
6. **Per-tenant quotas by tier** — bounds worst case, doubles as pricing lever
7. **Graceful degradation** — throttled source marks itself stale and is skipped; the run never fails

### Rate limiting — the MVP configuration

MVP is one tier: **1 business · 5 competitors · 8 sources**. Concrete limits to implement:

**Per-tenant (enforced by `checkQuota`)**

| Metric | MVP limit | Rationale |
|---|---|---|
| Businesses | 1 | Agreed scope; removes the business-switcher entirely |
| Competitors | 5 | Caps collection at 40 fetches/day/tenant before dedup and backoff |
| New competitor changes | 3 / week | Swapping competitors forces first-time crawls of new entities — the costliest collection path |
| Manual crawl refresh | 3 / day | Prevents button-mashing; scheduled collection is unaffected |
| Manual investigations | 3 / day | The expensive Opus path; auto-investigations remain unrationed |
| On-demand synthesis | 2 / month | Weekly scheduled synthesis is always included |
| Instant Teardown | 1 at signup + 2 / month | ~$1.50 each; the main abuse surface |
| Signal history | 90 days | Also serves data minimisation (§Policy) |

**Per upstream source (token bucket, one Inngest worker pool each)**

| Source | Ceiling we set | Upstream reality |
|---|---|---|
| Hacker News (Firebase) | 1 req/sec | No published hard limit — politeness, not compliance |
| GitHub | 2,000 req/hr | 5,000/hr authenticated; leave headroom |
| Stack Overflow | 5,000 req/day | 10,000/day with a key; 300/day without |
| ATS boards (Ashby, Greenhouse, Lever, Workable) | 1 req per competitor per day | Unofficial JSON endpoints — be conservative or get blocked |
| Feature-request boards (Canny, Nolt, …) | 1 req per competitor per day | Public HTML; politeness matters more than volume |
| Product Hunt | 1 req per competitor per day | Documented GraphQL rate limits |
| Web/pricing crawl | 2 sec delay between requests, 3 retries w/ exponential backoff | Existing crawler behaviour — already implemented |

**Anthropic (org-level, shared across all tenants)**

- Route **all triage through the Batch API** — separate pool from standard rate limits, and 50% cheaper.
- Cap **concurrent Opus calls at 2** via Inngest function concurrency, so a synthesis burst can't starve an urgent investigation.
- On `429`, exponential backoff with jitter; Inngest retries the step rather than failing the run.
- Usage-tier limits rise automatically with spend — monitor headroom rather than pre-optimising.

**Platform-wide circuit breakers** — see §Quotas. These are the backstop that per-tenant limits cannot provide.

### Quotas & tiering

**Design principle: price on value dimensions, cap on cost dimensions.**

Because of the global/tenant split, tracking one more competitor that someone else already tracks costs us almost nothing — but feels valuable to the buyer. That makes **capacity** the pricing lever and **tenant-initiated expensive work** the thing to cap.

| Category | Dimensions | Treatment |
|---|---|---|
| **Capacity** *(value — low marginal cost)* | businesses tracked · competitors per business · signal-history retention · first-party connectors · seats | **Price on these** |
| **Consumption** *(cost — tenant-initiated)* | manual investigations/day · on-demand synthesis/mo · Instant Teardowns/mo · manual refreshes/day | **Hard-cap these** |
| **Automatic** *(architecture makes it cheap)* | daily collection · triage · auto-investigations on flags · weekly synthesis | **Included, not rationed** |

That third row is a marketing advantage worth stating: *competitors ration deep analysis (3/day on their entry tier); we ration only what you trigger by hand.* Auto-investigations are implicitly bounded by competitor count — cap the competitors and the investigations cap themselves — with a generous per-tenant safety ceiling that shouldn't bind in normal use (guards against a site redesign spraying 50 signals).

**MVP ships as a single tier: 1 business · 5 competitors · everything included.** No paid ladder until the product is validated — a tier table with nobody on it is speculation. The ladder below is the *post-validation* hypothesis, kept here because the quota system is built to make it a config change rather than a rewrite.

**Post-MVP tiers** *(hypothesis — validate with testers)*

| | Free / Trial | Starter $29 | Pro $99 | Team *(later)* |
|---|---|---|---|---|
| Businesses | 1 | 1 | 3 | Unlimited |
| Competitors per business | 3 | 8 | 20 | 25 |
| Daily collection | ✓ | ✓ | ✓ | ✓ |
| Auto-investigations + alerts | ✓ | ✓ | ✓ | ✓ |
| Weekly synthesis | ✓ | ✓ | ✓ | ✓ |
| **Pricing watch** | **✓** | **✓** | **✓** | **✓** |
| Manual investigations | 1/day | 5/day | 25/day | 50/day |
| On-demand synthesis | ✗ | 1/mo | 8/mo | Unlimited |
| Instant Teardowns | 1 total | 3/mo | 15/mo | Unlimited |
| Signal history | 14 days | 90 days | 1 year | Unlimited |
| First-party connectors | ✗ | ✗ | ✓ | ✓ |
| Slack delivery | ✗ | ✓ | ✓ | ✓ |
| Seats | 1 | 1 | 1 | 5+ |

**Pricing watch is included at every tier including Free** — the direct attack on the competitor's $149 paywall for the single highest-value PM signal.

**Enforcement — one gate, not scattered checks**
```sql
plan_limits      -- tier → metric → limit  (config in DB, so tier changes need no deploy)
usage_counters   -- account_id, metric, period_start, count  (atomic check-and-increment)
```
A single `checkQuota(account, metric)` call guards every metered operation. Limits live in data, not code.

**Global circuit breakers (not per-tenant — platform protection)**
1. **Daily spend ceiling.** If platform LLM spend crosses a threshold, degrade: pause auto-investigations, queue teardowns. A bug in the Investigator loop could otherwise burn hundreds overnight.
2. **Free-tier teardown cap, platform-wide.** The write-up could go viral; 500 signups × ~$1.50 teardown = $750 unplanned. Gate teardown behind email verification and cap global free-tier teardowns per day, with a waitlist beyond it.
3. **New-entity introduction rate.** Adding a competitor nobody tracks triggers a first-time crawl across all sources — costlier than joining an existing entity. Rate-limit new entity creation per account per day.

### Data model (backwards-compatible)
```sql
-- GLOBAL
competitor_entities   -- canonical, deduped by domain
signals               -- entity_id, source_type, side ('supply'|'demand'),
                      -- raw_content JSONB, extracted JSONB (summary, themes, severity), created_at
flags                 -- entity_id, insight, evidence signal_id[], severity, created_at
investigations        -- flag_id, steps JSONB (powers "show your work"), findings, status

-- TENANT
businesses            -- existing
competitors           -- existing; ADD entity_id FK → becomes tenant↔entity mapping
insights              -- business_id, week_ending, type ('insight'|'opportunity_gap'),
                      -- theme, evidence signal_id[]/flag_id[], recommendation, confidence

-- QUOTAS & COST
accounts              -- ADD tier ('free'|'starter'|'pro'|'team')
plan_limits           -- tier, metric, limit_value, period ('day'|'month'|'total')
usage_counters        -- account_id, metric, period_start, count  (atomic increment)
token_usage           -- account_id, operation ('triage'|'investigate'|'synthesize'|'teardown'),
                      -- model, input_tokens, output_tokens, cache_read_tokens,
                      -- cost_usd, entity_id NULL, created_at
```
`token_usage` is the only way to attribute spend — Anthropic bills one org-level number. Every SDK call goes through a thin wrapper that writes this row. Shared-layer work (triage, investigations on a global entity) logs `account_id` NULL and is amortised across tenants tracking that entity.
`crawl_results` / `crawl_diffs` / `reports` remain raw stores. **`side` on signals is what makes Opportunity Gaps computable.**

### Evals (from session one)
- **Golden sets** — Farrukh hand-labels: ~20 community posts → pain themes; ~20 historical diffs → severity
- **Structural assertions** — valid JSON · every insight cites ≥2 real signal IDs · **Opportunity Gaps must cite ≥1 demand-side AND ≥1 supply-side signal** (differentiator can't silently rot) · Investigator respects step budget
- **Synthesis rubric** — relevant / actionable / evidence-grounded / non-obvious. Human-scored first, LLM-as-judge later calibrated to those scores
- Artifact: JSON cases + runner + score-trend table — the answer to *"how do you know your agent is good?"*

---

## Sources (~8 core — constraint is adapter hours, not API cost)

**Supply (5)** — website + changelog diffs ✅*built* · **pricing watch** *(~80% built; add SHA fingerprinting — competitor paywalls this at $149, we include it)* · job postings *(Ashby/Greenhouse/Lever/Workable — one adapter shape ×4; best roadmap-leak signal)* · news & funding *(DDG)* · Product Hunt

**Demand (3)** — Hacker News *(Firebase API, free, permissive, zero platform risk)* · ⭐ **public feature-request boards** *(Canny/Nolt/Featurebase/UserVoice/GitHub Discussions — competitor lacks this; literally customers asking for unshipped things. High precision, low recall: ~30–40% of competitors)* · Stack Overflow *(free official API)*

**Stretch if ahead** — GitHub activity/issues *(dev-tool competitors only)* · app-store reviews *(many B2B competitors have no app)*

**Skipped, publicly** — security OSINT *(Shodan, S3/secret scanners, paste sites, breach monitors, cert transparency, BGP/ASN, dorking)*: doesn't inform a roadmap, and scanning a competitor's buckets, secrets and employee credentials is probing their infrastructure — **declining is a positioning asset with a PM audience**. Also skipped: SEC/patents/trademarks *(competitors are private startups)* · HuggingFace *(AI-only niche)* · LinkedIn *(ToS + blocking)* · court records · battlecards/win-loss/CRM *(different ICP)*

**Platform-risk exclusions** — **Reddit** *(commercial API ~$12k/mo min; free tier non-commercial only; 403s since May 2026 — killed GummySearch at $35K MRR while profitable)* · **G2/Capterra** scraping. → *"We don't build on borrowed land."*

**Pro-tier answer to platform risk** — user-connected **first-party feedback** (their support inbox / Intercom / review feeds). Zero platform risk, highest signal, raises switching cost, structurally unavailable to a self-serve OSINT competitor.

Every source is a **pluggable adapter** — any single source dying degrades quality gracefully.

---

## Policy, compliance and safety

Five distinct exposures. Most are addressed by design choices already made; the rest need explicit implementation.

### 1. LLM provider policy (shared org key)
One tenant's input can flag the whole organisation account. Mitigations:

- **Crawled content is data, never instruction.** Competitor pages are attacker-controllable — a page could contain "ignore previous instructions." All crawled text is wrapped in explicit delimiters and prompts state that content inside them is untrusted data. **The Investigator's tool use must never be steerable by fetched content**; its tool list and step budget are fixed in code, not negotiable by the model.
- **User-supplied text is sanitised.** Business name, description and industry are the only free-text fields reaching a prompt. Length-cap them, strip control characters, and reject obvious injection patterns before use.
- **Monitor refusals.** A spike in refusals or policy errors is an early signal something upstream is feeding us bad content. Log them alongside `token_usage`.

### 2. Source terms of service
- **Respect `robots.txt`** on every crawl. Non-negotiable, and cheap to implement.
- **Honest User-Agent** identifying the product with a contact URL — the difference between a good citizen and a scraper.
- **Back off on 429/503** rather than retrying hard.
- **Excluded by policy, not by capability:** Reddit at scale (licensing), G2/Capterra (ToS-gray), LinkedIn (ToS + blocking). Documented publicly — *"we don't build on borrowed land"* is positioning, not just caution.
- **No infrastructure probing.** No bucket scanning, secret scanning, breach-database lookups or port scanning. Beyond being useless for a roadmap, this keeps us clear of CFAA-adjacent territory. The nearest competitor does all of it.

### 3. Data protection
- **Minimise personal data.** We track companies, not people. Job postings and community posts can carry names; store the minimum needed and never build person-level profiles. LinkedIn and employee-signal sources are excluded partly for this reason.
- **Retention is a feature and a control.** The 90-day signal history on MVP doubles as data minimisation; raw `crawl_results` older than the window are purged on a schedule.
- **Deletion cascades.** Account deletion removes tenant rows and their `businesses → competitors → insights` chain. Global entity signals persist — they are facts about public companies, not tenant data — but the tenant↔entity mapping goes.
- **Export on request** — a simple JSON dump of a tenant's businesses, competitors and insights.

### 4. Email compliance
- **Unsubscribe link in every brief**, honoured immediately, stored per account.
- **Only mail people who signed up**, confirmed via the existing email-verification step.
- **Verified sender domain** before any real user receives mail. *Current blocker: the Resend sandbox sender only delivers to the Resend signup address.*

### 5. Content and attribution
Reports quote competitor material. Keep excerpts short, always link to the source, and never republish a page wholesale. The evidence-linking that powers "show your work" also happens to be the correct attribution behaviour.

---

## Operations

### Observability
- **Inngest dashboard** is the primary view — per-step traces, retries, failures, and durations for free.
- **Alert on silence, not just errors.** A crawl that returns zero signals for three consecutive days is more likely a broken adapter than a quiet market. Silent failure is the dangerous kind in a monitoring product.
- **Cost anomaly alerting** off `token_usage` — daily spend more than 2× trailing 7-day average pages the operator before the circuit breaker trips.
- **Per-source health table** — last success, last failure, consecutive failures, current backoff. Surfaces a dying adapter before quality degrades.

### Failure modes and degradation
| Failure | Behaviour |
|---|---|
| One source rate-limited or down | Mark stale, skip, continue. The run never fails because one adapter is throttled |
| Anthropic API unavailable | Inngest retries with backoff; triage is idempotent, so replays are safe |
| Investigator exceeds step budget | Hard stop in code, partial findings written, flag marked `incomplete` |
| Synthesis produces nothing usable | Emit an explicit "quiet week" brief rather than nothing — silence looks like a broken product |
| Crawl job times out | Partial results already written to `signals`; next run resumes from adaptive backoff state |

### Security
- **Service-role keys never reach the browser.** Only `NEXT_PUBLIC_*` values are client-visible; all privileged calls happen in route handlers.
- **Secrets live in Vercel and GitHub Actions**, never in the repo. Rotate the GitHub PAT on a schedule — it can dispatch workflows.
- **RLS must land before real multi-tenancy.** Today isolation is application-level (`user_email` filtering). Acceptable for a single dogfood user; not acceptable with paying tenants.
- **Supabase free tier has limited backup guarantees** — for MVP, accept it; before paid users, either upgrade or run a scheduled logical dump.

### Legal pre-requisites before public users
Terms of Service · Privacy Policy (naming sub-processors: Anthropic, Supabase, Vercel, Resend, GitHub) · a public sources-and-methods page. The last one is unusual and worth doing — publishing what we collect and what we deliberately refuse to collect is a differentiator with a PM audience.

---

## Phased build (~12 sessions; next = Session 5)

**Phase A — Identity & foundation (S5–S7)**
- **S5:** ~~write `MARKET-RESEARCH.md`~~ ✅ done; rebrand *(timeboxed)*; Inngest setup; schema migration incl. global/tenant split **+ quota and `token_usage` tables**; **SDK wrapper that logs tokens/cost per call**; eval harness v0
- **S6:** **Instant Teardown** — extend the existing S3 research route; make it the signup experience *(solves cold start)*. **First metered operation → build `checkQuota()` gate here**, plus email-verification gate and platform-wide free-tier teardown cap
- **S7:** Crawler emits entity-keyed signals; deterministic diff layer; Haiku batch triage; severity golden-set eval. **Global daily-spend circuit breaker must land before anything expensive runs unattended**

**Phase B — Sources (S8–S10)** — build the adapter interface once, then fill it
- **S8:** Adapter interface + HN + theme extraction + extraction evals
- **S9:** Public feature-request boards + Stack Overflow — the demand side competitors lack
- **S10:** Job postings (4 ATS) + news/funding + Product Hunt + pricing fingerprinting; adaptive backoff; both tenants collecting

**Phase C — Agents (S11–S13)**
- **S11:** Investigator (tool loop, step budget, per-tenant quota, investigation log) + flags + instant alerts
- **S12–S13:** Synthesist + **Opportunity Gap generation** + rubric evals *(the hard part — 2 sessions)*; first real weekly briefs

**Phase D — Dashboard & polish (S14–S16)**
- **S14:** Insights-first dashboard; Opportunity Gap as hero card *(design system in `competitive-tracker-web/CLAUDE.md` applies)*
- **S15:** "Show your work" panel; flag cards; Slack delivery; **quota UI — usage meters, limit-reached states, upgrade prompts**
- **S16:** Premium polish; eval score-trend docs; write-up and demo prep

---

## Future stages (post-MVP, deliberately not scoped yet)

Each is triggered by evidence, not by a date.

| Stage | Trigger | What it adds |
|---|---|---|
| **Tier ladder + billing** | MVP validated by testers who ask to pay | Free / $29 / $99 as config in `plan_limits`; Stripe. The quota system is already built for this — a config change, not a rewrite |
| **First-party feedback connectors** | Users ask "can it read my support inbox?" | Support inbox / Intercom / review feeds. **The strategic answer to platform risk** — zero ToS exposure, highest-signal input available, raises switching cost |
| **Roadmap inference** | Competitive pressure or user demand | Job posts + changelogs + conference talks → where competitors are heading. The deferred third input; a paid-tier upgrade, never MVP |
| **Analyst chat over history (RAG)** | ~6 months of accumulated signal | One `pgvector` table with `tenant_id` in the existing Supabase. Deferred because a tenant's week fits in context today and SQL beats vectors on cost, precision and debuggability |
| **Team seats + shared workspace** | A tenant asks for a second seat | Moves into the $300–1,000/mo band without changing the engine |
| **Cross-tenant pattern layer** | Past ~100 tenants | Derived, anonymised market patterns only — never raw signals, never tenant attribution. Below that count there are no patterns to learn |
| **Adjacent ICPs** | Inbound from agencies or VCs | Agencies (client markets), VCs (portfolio monitoring). Same engine, repositioned — multi-tenancy already exists |

**Explicitly not on this list:** battlecards, win/loss tracking and CRM integration. Those serve sales enablement, which is a different buyer and the axis the incumbent already owns.

---

## Pre-work (carry into S5 — from `TECH-STACK.md`)

1. **Remove `@supabase/auth-helpers-nextjs`** — verified dead, not imported anywhere, deprecated upstream, warns on every install.
2. **Add a model fallback chain to `/api/businesses/[id]/research`** — the Python side tries five models; the web route hard-codes `claude-opus-4-7` and fails outright if it is retired.
3. **Unblock the Phase 3 wizard** — `ANTHROPIC_API_KEY` in Vercel and the competitors/businesses column migration in Supabase. The Instant Teardown in S6 builds directly on that route.
4. Note the `middleware` → `proxy` deprecation and the Node 20 Actions warning; neither is breaking yet.

---

## Success criteria

The MVP has worked if, within four weeks of the first weekly brief:

1. **The agent changes a real decision** — a brief (ideally an Opportunity Gap) causes a change to this product's own roadmap. This is the primary test, and it is dogfood-verifiable without any external users.
2. **Evals trend upward** — the synthesis rubric score improves across prompt iterations and the trend is documented. This is the credibility artifact for the write-up.
3. **Three to five external PMs test it** and can articulate, unprompted, what it does that a competitor-alert tool doesn't.
4. **Quiet weeks are reported honestly** and no tester describes the output as noise.
5. **Unit economics are known**, not estimated — real numbers from `token_usage`, not the model in §Architecture.

Explicitly *not* success criteria for MVP: revenue, signup count, or source coverage.

---

## Risks

| Risk | Mitigation |
|---|---|
| **Platform risk on community data** *(killed GummySearch while profitable)* | Reddit/G2 excluded; pluggable adapters; first-party connectors as strategic answer |
| **Nearest competitor is close and moving** | Don't race on sources. Win on demand-side synthesis + Opportunity Gap, which their model resists. Prove via evals, not copy |
| **Synthesist quality *is* the product** | 2 sessions budgeted; rubric evals as steering; quiet-week honesty over manufactured insight |
| **Cold start** — worth nothing day 1 | Instant Teardown (Phase A) |
| **SMB churn ~8.2%/mo** | Fixed weekly habit; brief must be genuinely good; first-party data raises switching cost |
| Investigator cost blowout | Deterministic diff + batched triage + top 2–3% only + per-tenant quotas + **global daily-spend circuit breaker** |
| **Viral signup spike on free tier** | Teardown is ~$1.50 and runs at signup; 500 signups = $750 unplanned. Email-verification gate + platform-wide daily free-tier teardown cap + waitlist overflow |
| Scope creep | MVP inputs frozen; Claude pushes back on cannon-for-a-bullet |

**Resolved with the architect:** MVP scope fixed at 1 business / 5 competitors, single tier · shared Anthropic org key retained (stateless requests — no context concern) · self-hosting rejected on cost, quality and ops grounds.

**Still for the architect:** Inngest free tier under the fan-out pattern · `competitor_entities` canonicalization beyond domain *(rebrands, acquisitions, multi-domain)* · hard vs soft per-tenant quotas *(pricing decision as much as technical)* · atomic check-and-increment under concurrency *(two simultaneous requests must not both pass a quota check at the limit)* · whether tier limits belong in Postgres or a cache layer once read volume grows · **at what tenant count the org-level TPM ceiling starts to bind, and whether Batch API headroom covers it.**

**Still open (Phase D):** portfolio artifact set beyond the live product — write-up / talk / open-source.

**Verification:** each phase runnable end-to-end on both dogfood tenants; evals on every prompt change with score trend recorded. **Working = a weekly brief (ideally an Opportunity Gap) changes this product's own roadmap.**
