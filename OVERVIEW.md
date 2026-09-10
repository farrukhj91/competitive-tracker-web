# Winnow — Overview

*Two things worth acting on. Every Monday.*

*Prepared for investors, partners and advisors · September 2026*

> A companion technical document (`BUILD-PLAN.md`) holds the full engineering detail. This document is the business case.

---

## In one sentence

**An AI analyst that watches your market while you sleep, and every Monday morning tells you the two or three things you should actually do about it.**

---

## 1. The problem

Every product manager and founder building software has the same recurring anxiety: *am I missing something?*

A competitor quietly changes their pricing. Customers start complaining about a problem nobody has solved yet. A rival begins hiring aggressively in a department that signals where they're heading next. Any of these could change what you build next quarter — and most of the time, you find out weeks late, from a customer, in a sales call you just lost.

The people most exposed to this are the ones with the least time to prevent it: solo product managers and founders at small software companies. They typically lose **5 to 10 hours a week** to some combination of checking competitor websites, scrolling forums for customer complaints, and trying to decide what any of it means.

The best practice for avoiding this is well established — talk to customers weekly, watch the market continuously. **Fewer than one in five product teams actually manage it.** Not because they don't know they should. Because there isn't time.

---

## 2. Why existing tools don't solve it

The market has split into two groups, and neither serves this customer.

**Enterprise tools are priced out of reach.** Competitive intelligence platforms like Crayon and Klue run $15,000 to $100,000 a year. Customer-feedback platforms like Enterpret and Unwrap start around $24,000 to $50,000. These are good products sold to companies with a budget owner and a dedicated analyst. A solo founder cannot buy them.

**Cheap tools send alerts, not answers.** A dozen or more products now offer AI-powered competitor monitoring for $20 to $149 a month. They all do roughly the same thing: watch a list of sources, and email you when something changes.

The problem is that this doesn't solve the actual problem. The industry's own practitioners describe it bluntly: teams are *"swimming in data"* and *"more data and better decisions aren't the same thing."* Every one of these tools produces a stream of notifications, and **someone still has to sit down and work out which ones matter.** That someone is the customer, and their time was the scarce resource in the first place.

### Two companies died proving this

**Unkover** was backed by Y Combinator and sold competitor monitoring at $79/month. Its website today says the platform *"is being reimagined."* The product is gone. A well-funded team could not make monitoring-as-a-business work.

**GummySearch** helped founders find customer pain points by mining online communities. It shut down in **November 2025** while doing **$35,000 a month in revenue and profitably**. It didn't fail commercially — it was killed by a platform it depended on changing its licensing terms.

These are two different lessons and both shaped this product. The first: **alerts are a commodity; judgment is the product.** The second: **demand for this is proven, and depending on someone else's platform can kill you overnight.**

---

## 3. Our insight

The valuable question isn't *"what did my competitors do?"* It's *"what does the market want that nobody is delivering?"*

Answering that requires two kinds of information at once — what competitors are doing, and what customers are complaining about — multiplied together. Existing tools collect both and never connect them. Competitor tools treat customer reviews as brand monitoring. Customer-feedback tools ignore competitors entirely.

We call the output of that connection an **Opportunity Gap**:

> *"Three of your competitors have users complaining about onboarding complexity. None of them has shipped a fix in six months. This gap is open — here's the evidence, and here's what shipping against it would look like."*

That is not a competitive-intelligence output. That is a product-strategy recommendation, and it's the thing a product manager is actually paid to produce.

Our positioning follows from it: **the discovery analyst for teams too small to have one.** Not "we watch more sources." Rather: *the two things worth acting on this week, with the evidence behind them — and silence when nothing matters.*

That last part is a deliberate product decision. When there's genuinely no news, the system says so. Every competitor is structurally incapable of this, because for them volume *is* the value proposition. We think restraint is what earns long-term trust, and trust is what stops customers cancelling.

---

## 4. How it works

Four steps, running continuously in the background.

**It watches.** Every day, the system checks a set of public sources for each competitor — their website and pricing pages, their job postings, their product announcements, and the places their customers talk about them publicly.

**It filters.** The overwhelming majority of days, nothing meaningful has changed. The system detects this cheaply and stops there. Only a small fraction of what it sees is worth a closer look — roughly two to three percent.

**It investigates.** When something *does* look significant, a dedicated AI agent digs in. It searches the web, reads the relevant pages, checks the competitor's history, and decides for itself when it has enough to draw a conclusion. If it confirms something important, you get an alert the same day.

**It synthesises.** Once a week, a second agent reads everything collected — including the quiet, individually-unremarkable signals — and looks for patterns across them. That's where Opportunity Gaps come from: connections no single alert would have revealed. The result is a short weekly brief with recommendations, each one linked to the specific evidence behind it.

Every recommendation shows its work. You can click through to the underlying sources and see exactly what the system read and why it reached that conclusion. In a category where trust is the main problem, we think that matters more than any feature.

---

## 5. Where we are today

This is not a concept. A working system is deployed and running.

**Already built and live:**
- Web application with user accounts, deployed and in production
- Automated daily crawling of competitor websites, pricing pages, job listings, news and community discussion
- Change detection that identifies what's different since the last check
- AI-generated analysis reports, delivered by email and viewable in a dashboard
- On-demand crawling triggered from the dashboard, with live progress tracking
- AI-powered competitor discovery — enter your business, and the system researches and proposes competitors to track

**What that de-risks:** the hard integration work is done. The crawling pipeline, the database, the authentication, the email delivery, the AI integration and the deployment infrastructure all exist and function. What remains is building the intelligence layer on top of a foundation that already works.

---

## 6. What's next — the MVP

Scope has been deliberately constrained, in consultation with a solutions architect.

**Each account tracks one business and up to five competitors.** Single tier, everything included, no paid plans until the product is validated.

The reasoning is discipline rather than limitation. Five competitors is enough to prove the product works and produces genuinely useful weekly briefs. It also caps our costs, removes an entire layer of interface complexity, and keeps the focus on the only thing that matters at this stage: **is the weekly brief good enough that someone would pay for it?**

**Timeline:** roughly one to two months of focused development, structured in four phases — foundation, data sources, the two AI agents, then the dashboard and polish.

**How we'll know it worked.** Within four weeks of the first weekly brief:
1. The system produces a recommendation that changes a real product decision
2. Measured output quality improves as we refine it, with the trend documented
3. Three to five external product managers test it and can explain, unprompted, what it does that a competitor-alert tool doesn't
4. Quiet weeks are reported honestly, and no tester describes the output as noise

Notably absent from that list: revenue, signup counts and source coverage. Those are the wrong things to optimise before the core product is proven.

---

## 7. After the MVP

Each stage is triggered by evidence, not by a date on a plan.

| Stage | What triggers it | What it adds |
|---|---|---|
| **Paid plans** | Testers ask to pay | Three-tier pricing. The system is already built to support this as a settings change, not a rebuild |
| **Connect your own feedback** | Customers ask "can it read my support inbox?" | The system reads the customer's own support conversations and reviews. This is the strategic move — it's the highest-quality information available, it can't be taken away by a third party, and it makes the product much harder to leave |
| **Roadmap prediction** | Competitive pressure or customer demand | Predicting where competitors are heading, from hiring patterns, product announcements and conference talks |
| **Ask questions of your history** | Around six months of accumulated data | Conversational access — *"what has this competitor done on pricing over the past year?"* |
| **Team accounts** | A customer asks for a second seat | Shared workspaces. Moves into a higher price band without changing the underlying system |
| **Adjacent customers** | Inbound interest | Agencies monitoring client markets, investors monitoring portfolios. Same system, different positioning |

**Deliberately not on this list:** sales-enablement features like battle cards and win/loss tracking. That's a different buyer, and it's the area incumbents already own.

---

## 8. The market

Competitive intelligence software is roughly a **$3 billion market growing 10–12% annually**, with adjacent customer-intelligence tooling adding several billion more. Analyst estimates in this category vary widely, so treat that as directional.

More useful than the total number: **almost all of that revenue sits in enterprise contracts.** Our opportunity is not to take share from Crayon and Klue. It's that a large population of small software companies has this problem and currently has nothing credible to buy.

**Who pays:** solo product managers and founders at small B2B software companies. Technical enough to appreciate a well-built product, time-poor enough to value the hours it saves, and — critically — able to make a $30–100/month purchase decision without approval.

**The competitive landscape, honestly.** The low-cost segment is crowded, with a dozen or more entrants. Our nearest competitor is a $49/month product with thirty data sources. On paper it looks close. In practice it differs in three ways that matter:

- It reports on each competitor separately. Nobody connects patterns across the market — the customer still does that work themselves.
- It has no way to identify unmet customer needs. It tells you what to copy; it cannot tell you what to invent.
- It gates the single most valuable signal — pricing changes — behind a plan costing three times its entry price. **We include pricing monitoring at every tier, including free.**

---

## 9. Business model

**Pricing hypothesis** (to be validated with testers, not assumed):

| | Free | $29/month | $99/month |
|---|---|---|---|
| Businesses tracked | 1 | 1 | 3 |
| Competitors | 3 | 8 | 20 |
| Daily monitoring | ✓ | ✓ | ✓ |
| Weekly brief | ✓ | ✓ | ✓ |
| **Pricing-change alerts** | **✓** | **✓** | **✓** |
| Deep investigations | 1/day | 5/day | 25/day |
| Connect your own feedback | — | — | ✓ |

The pricing principle: **charge for capacity, limit the expensive work.** Tracking one more competitor that another customer already tracks costs us almost nothing — we watch each company once and share what we learn across everyone tracking them. That makes capacity a generous thing to sell. Deep AI investigations are genuinely expensive per use, so those are capped.

This produces a marketing advantage as a side effect: our competitor rations deep analysis to three per day even on its entry plan. **We ration only what the customer triggers by hand; the automatic intelligence runs unrestricted.**

### Unit economics

This is the strongest number in the business.

| | |
|---|---|
| Cost to operate today (MVP) | **$5–10/month total** |
| Projected cost at 1,000 customers | ~$6,000–9,000/month |
| Projected revenue at 1,000 customers | ~$49,000/month |
| **Gross margin** | **~85%** |

Two things drive this. First, we watch each competitor once and share the result across every customer tracking them, so costs grow far more slowly than the customer base. Second, expensive AI analysis runs only on the small fraction of activity that turns out to matter — a cheap first pass discards the rest. Without that filtering, costs would be roughly a hundred times higher.

The infrastructure runs on free tiers that are genuinely sufficient at this stage, which is why current operating cost is under ten dollars a month.

---

## 10. How we keep it safe, cheap and reliable

Three categories of control, all designed in rather than bolted on.

### Cost control
- **Per-customer limits** on the expensive operations, enforced before the work runs.
- **A platform-wide spending ceiling.** If total daily AI spend crosses a threshold, the system automatically scales back rather than continuing to spend. Individual customer limits don't protect against a software bug affecting everyone at once — this does.
- **Signup protection.** New-account analysis costs about $1.50 and runs immediately. If a launch post performs unexpectedly well, 500 signups is $750 we didn't plan for. Email verification plus a daily platform cap with a waitlist prevents that.
- **Per-customer cost tracking.** We record the cost of every AI operation against the account that caused it. Our AI provider bills a single monthly figure with no breakdown, so without this we couldn't tell whether any given customer is profitable. It's being built in the first development session, not retrofitted later.

### Quality control
Traditional software either works or throws an error. AI features can fail quietly — producing output that looks reasonable but isn't useful. So we measure it.

We maintain a set of hand-labelled test cases with known correct answers, and score the system against them every time we change how it works. Output quality is tracked as a trend line, the same way a normal business tracks any other metric. When an investor or customer asks *"how do you know the AI is any good?"* — we have an answer with data behind it.

### Operational and legal safety
- **We don't build on borrowed land.** Every data source we use is either an official free interface or genuinely public information. We deliberately excluded the sources that killed GummySearch, even though a competitor still uses them. We accept slightly less coverage in exchange for not having a business that a third party can end with a policy change.
- **Sources are modular.** If any single source becomes unavailable, quality degrades slightly instead of the product breaking.
- **We don't probe competitor infrastructure.** Our nearest competitor scans competitors' cloud storage, searches for exposed credentials, and checks breach databases for their employees' passwords. We don't, and we say so publicly. It tells a customer nothing useful about what to build, and we'd rather be the product that's comfortable explaining exactly what it does.
- **Data minimisation.** We track companies, not individuals. Data is retained on a limited window and deleted when an account closes.

---

## 11. Why this is defensible

Not because it's technically difficult to copy a feature — it isn't. Because our nearest competitor's **business model resists the move.**

Their entire system is organised around individual competitors, so producing genuine market-level synthesis would mean rebuilding their foundations. Their customers are buying sales ammunition, not product strategy, so they're not asking for it. And their pricing rewards adding more data sources rather than producing better conclusions from the ones they have.

Meanwhile, the "connect your own feedback" step — where we read a customer's actual support conversations — requires a trust relationship their self-serve model doesn't support, and it's the feature that makes a customer least likely to leave.

The durable advantage is **judgment quality**, measured and improved deliberately over time, in a category where everyone else competes on volume.

---

## 12. Risks, stated plainly

| Risk | How we're handling it |
|---|---|
| **A competitor moves faster** | We're not racing on data sources — that's the commodity axis. We compete on synthesis quality, which their model resists, and we measure ours rather than asserting it |
| **The weekly brief isn't good enough** | This is the real risk, and we treat it as such. The hardest component gets the most development time and the most measurement. If briefs aren't genuinely useful, the product doesn't deserve to exist |
| **Small-business customers churn** | Industry average is around 8% monthly — the honest headline risk. Our answers: fixed weekly delivery to build a habit, honest "quiet week" reporting to preserve trust, and the feedback-connection feature that makes leaving costly |
| **A data source disappears** | Modular sources, graceful degradation, and the highest-risk sources excluded from the start |
| **AI costs run away** | Layered limits, automatic spending ceilings, per-customer cost tracking |
| **Scope creep** | MVP scope is fixed and written down. Additional capabilities have explicit evidence triggers rather than dates |

---

## 13. Current status

| | |
|---|---|
| **Stage** | Working system deployed; intelligence layer in development |
| **Built** | Crawling, change detection, AI analysis, email delivery, dashboard, accounts |
| **Next** | MVP — 1 business, 5 competitors, weekly briefs with Opportunity Gaps |
| **Timeline** | 1–2 months to testable MVP |
| **Operating cost** | Under $10/month |
| **Validation plan** | Dogfooding on our own market, then 3–5 external product managers |
| **Team** | Solo builder (product management background), with solutions-architecture advice |

---

*Technical detail — architecture, data model, delivery plan, and full competitive analysis — is available in `BUILD-PLAN.md` and `MARKET-RESEARCH.md`.*
