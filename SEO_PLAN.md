# SEO_PLAN.md — Shikhi Digital

**Owner:** Growth / Content
**Created:** 2026-09-09
**Model:** the ieltsbiz playbook (`d:/projects/ielts-reading/SEO_GROWTH_PLAN.md`), adapted. Same six engines, same gates, same keyword-map discipline. What differs is the market and the data asset.
**Scope:** global English, parents and children aged 8–13. Not the Bangladesh/Bengali market — that is [Shikhi AI](https://shikhiai.com), a separate brand and a separate property.

---

## 0. Read this first: what is and is not measured here

ieltsbiz's plan was written **against a live GSC export**. Shikhi Digital has no site, no impressions and no Search Console history, so nothing in this document may be presented as measured demand.

| Claim type | Status here |
| --- | --- |
| Who currently ranks, and what their pages look like | **Verified** — SERPs read 2026-09-09, sources cited in §2 |
| Query *shapes* that exist in this niche | **Verified** — from live SERP titles, PAA and competitor H2s |
| Monthly search volume, KD, CPC | **Not available.** No number in this document is a volume estimate, because an invented one is worse than none |
| Which hub will win | **Hypothesis**, ranked by argument in §4, to be settled by data |

**Before wave 1 ships, someone must pull real volumes.** Cheapest honest path: Google Keyword Planner (free with any Ads account) for the §8 seed list, plus Google Trends for direction. Ahrefs/Semrush free tiers give KD for a handful of terms per day. Until that exists, §4 priority is an argument, not a measurement — and it is labelled as such throughout.

---

## 1. Positioning and the wedge

The product's claim is already unusual: **we grade the thinking, not the answer.** A child can be right for a poor reason and wrong for a good one, and Shikhi Digital is built to tell the difference (`src/lib/reasoning/`).

That claim is also the SEO wedge, because of what it produces: **`reasoning_attempts` is a corpus of real children's reasoning, graded against a named vocabulary of thinking moves.** Nobody else in this niche has one. Everyone else publishes advice; we can publish evidence.

This matters more than usual right now. §2.4 shows the fastest-rising parent anxiety in the category — *is AI destroying my child's ability to think?* — is being answered almost entirely by opinion pieces and tutoring-company blogs with no data behind them. We are the product that both answers that question and can measure it.

**Every page decision follows from one test:** does this page say something only a company that reads children's reasoning could say? If yes, it is a moat page. If no, it is a commodity page and must earn its place on structure and freshness instead.

---

## 2. The landscape, as actually observed (2026-09-09)

### 2.1 Current events for kids — **contested, do not attack head-on**

Incumbents: [TIME for Kids](https://www.timeforkids.com/), [DOGO News](https://www.dogonews.com/), [Newsela](https://newsela.com), News-O-Matic, CNN 10, [PBS NewsHour Classroom](https://www.pbs.org/newshour/classroom/), [Newsreel](https://newsreel.co/blog/best-current-events-websites-for-students/), [Currents4Kids](https://www.currents4kids.com/), and [Common Sense Media's roundup](https://www.commonsensemedia.org/lists/best-news-sources-for-kids) which ranks *them*.

These are strong brands with a decade of authority, and they are **teacher/classroom-shaped**: leveled readers, quizzes, LMS dashboards. Fighting for "current events for kids" is fighting TIME.

**The gap:** they publish *the news*. Almost nobody publishes *how to reason about the news with your child*. That is a parent-shaped query space and it is adjacent to, not inside, their moat.

### 2.2 Critical thinking activities — **soft, and the primary target**

The credible incumbent is [Reboot Foundation](https://reboot-foundation.org/parent-guide/ages-10-to-12/) — a non-profit, research-backed, genuinely good, and structurally static: age-banded guide pages, little freshness, no tooling, no data.

Everything else on page one is listicle inventory: [Brighterly](https://brighterly.com/blog/debate-topics-for-kids/), [MomJunction](https://www.momjunction.com/articles/debate-topics-for-kids_00484027/), [Kubrio](https://kubrio.com/blog/critical-thinking-activities-for-kids), [21K School](https://www.21kschool.com/us/blog/critical-thinking-activities-for-kids/), [Reading Eggs](https://readingeggs.com/articles/critical-thinking-activities-for-kids/), [Think Academy](https://www.thethinkacademy.com/blog/how-to-teach-kids-critical-thinking-daily-examples-age-group-guide/), [Begin Learning](https://www.beginlearning.com/parent-resources/5-critical-thinking-activities-for-kids-in-15-minutes-or-less/).

These pages share a defect worth naming, because it is exactly what we beat: **they list activities and never say what improvement looks like.** "Play chess", "ask open questions", "try logic puzzles" — no observable outcome, no way for a parent to know it worked. We have a named vocabulary of thinking moves and real examples of children performing them.

### 2.3 Media literacy — **authority-heavy, win the long tail only**

[Common Sense Media](https://www.commonsensemedia.org/articles/how-to-help-kids-spot-misinformation-and-disinformation), [Nat Geo Kids](https://www.natgeokids.com/uk/parents/how-to-spot-fake-news/), [Internet Matters](https://www.internetmatters.org/wp-content/uploads/2025/10/FakeNews-Guide-Digital.pdf), [NEA](https://www.nea.org/nea-today/all-news-articles/helping-students-spot-misinformation-online).

Head terms ("how to spot fake news") are unwinnable for years. But the incumbents stay general — SIFT, "check the source", "notice strong emotions". **Named individual techniques are wide open**: the truncated y-axis, "linked to" in a headline, the loaded survey question, grey-on-grey `#ad`. Each is its own URL, each is a *Spot the Trick* puzzle in-product, and each is the kind of specific, self-contained claim AI engines quote.

### 2.4 "Is AI ruining my child's thinking?" — **wide open, rising, and ours**

Currently answered by [Psychology Today](https://www.psychologytoday.com/us/blog/the-human-algorithm/202504/is-ai-ruining-your-kids-critical-thinking) (twice), Medium posts, and tutoring-company blogs ([IMACS](https://www.imacs.org/ai-and-critical-thinking-in-gifted-children-what-parents-need-to-know/), UCMAS, BestBrains). All opinion. No corpus.

The nuance the good sources land on — *using AI is not the harm; repeatedly outsourcing your reasoning to it is* — is **precisely the product thesis**, and *Ask Anything (that asks back)* is the shipped answer to it.

**This is hub A and the first thing we publish.** It is the only space where we start with more evidence than the incumbents.

### 2.5 Debate topics for kids — **soft, and structurally lazy**

Pure listicle territory (Brighterly, MomJunction, [WeAreTeachers](https://www.weareteachers.com/middle-school-debate-topics/), EverythingMom). Every page is "150 topics" with no method attached. *Change My Mind* — where the win condition is naming the strongest point **against** yourself — is a genuinely different take, and the topic lists are trivially generated from it.

---

## 3. Strategy: six engines, one architecture

Inherited wholesale from the ieltsbiz plan; only the content differs.

1. **Editorial clusters** along the §4 hubs, answer-first formatted.
2. **Programmatic pages, gated** — only where a real data asset exists (thinking-move pages, manipulation-technique pages, debate-question pages). Never templated filler.
3. **AEO** (§5) — snippet-shaped answers so Google can lift them.
4. **GEO** (§6) — be the most *citable* source; original data is the moat.
5. **Authority** — digital PR on the reasoning corpus, plus honest competitor comparisons.
6. **Freshness** — the weekly *world* content the product already generates gives us recurring crawl demand, which the static guide sites do not have.

---

## 4. The hub map (priority is argued, not measured — see §0)

| # | Hub | Why it ranks for us | Difficulty | Moat page? |
| --- | --- | --- | --- | --- |
| **A** | **AI & children's thinking** | §2.4 — rising, opinion-only incumbents, we hold the data | Low | ✅ |
| **B** | **Thinking moves** (one page per move in `moves.ts`) | Nobody has named this vocabulary; each page is a definition AI engines can quote | Low | ✅ |
| **C** | **Spot the trick** (one page per manipulation technique) | §2.3 long tail; head terms conceded | Medium | ✅ |
| **D** | **Reasoning about the news with your child** | §2.1 gap — parent-shaped, not classroom-shaped | Medium | partial |
| **E** | **Change my mind** (debate + steelmanning) | §2.5 — listicles with no method | Low | partial |
| **F** | **Predict first** (science, prediction before explanation) | Curiosity-gap explainers; crowded but evergreen | High | ✖ |
| **G** | **Parent guides by age** (8, 9, 10, 11, 12, 13) | Reboot owns bands; we go per-year and add observable outcomes | Medium | partial |
| **H** | **Comparisons / alternatives** | Brand capture, as ieltsbiz proved with `*-alternative` | Low | ✖ |
| **I** | **Data studies** (§6.2) | The link and citation engine | — | ✅✅ |

**Wave 1 = A + B.** Both are moat hubs, both are low difficulty, and B is semi-programmatic from a vocabulary that already exists in code — ten pages that no competitor can write.

---

## 5. AEO playbook

Ported from the ieltsbiz plan, which has GSC proof that conversational long-tails reach a new site at positions 7–11.

### 5.1 Answer-first block — mandatory, every page

Directly under the H1, before any prose: a **40–55 word** self-contained answer to the title query, containing the key number or fact. That length is the featured-snippet paragraph sweet spot. Page summaries go *below* it — the answer block answers the query, the summary describes the page.

### 5.2 Snippet format by query shape

| Query shape | Build |
| --- | --- |
| "what is / can my child" | 40–55w paragraph |
| "how do I / steps" | `<ol>`, 5–8 steps, ≤2 lines each, + HowTo schema |
| "X vs Y" | 3–6 row `<table>` immediately after the answer block |
| "at what age / by year" | `<table>`, units in the `<th>` |
| "topics / examples / list" | `<ul>` of 8–12, bolded lead words |

### 5.3 Non-negotiables

Real `<table>` elements (never divs) in an `overflow-x-auto` wrapper · one idea per row · H2s phrased **verbatim** as the question a parent would type · every page carries a visible "Updated {month year}" · FAQ blocks worded as people ask chatbots, not as SEO headings.

### 5.4 PAA mining loop — weekly, 30 minutes

Once GSC has data: take the top-20 queries, harvest People-Also-Ask two levels deep, and for each either add a verbatim H2 + 40–55w answer to the owning page, or open a backlog row. Until then, seed from competitor H2s in §2.

---

## 6. GEO playbook

### 6.1 Citability rules — every page

1. **Claims carry numbers.** "In 1,200 graded explanations, 31% contained no reason at all" — not "many children struggle to explain themselves". Engines quote sentences that stand alone.
2. **Named definitions.** Bold term, one-sentence definition, first use. This is the entire premise of hub B.
3. **Attribution bait.** Write the attribution into the sentence — "According to Shikhi Digital's analysis of N graded explanations…" — because engines copy the sentence whole.
4. **Freshness stamps**, visible and in `lastmod`.
5. **One brand claim everywhere.** ieltsbiz hit a real bug here: a model assembling "what is IELTSbiz" from the crawl found four different product descriptions across the title, OG card, manifest, footer and schema. **Standing rule: a change to the brand claim lands on all of them or none.**

### 6.2 The original-data flywheel — the most important thing in this document

ieltsbiz's single original-data page became **their best-positioned blog URL** (pos 7.6). We have a better asset, because ours renews itself every time a child writes.

| Quarter | Study | Reference page |
| --- | --- | --- |
| Q4 2026 | **How Children Actually Reason** — distribution of thinking moves across N graded explanations, by age | "The ten thinking moves, defined" (hub B index) |
| Q1 2027 | **Right for the wrong reason** — how often a correct answer carries no reasoning | "Critical thinking benchmarks by age, 8–13" |
| Q2 2027 | **What changes after N explanations** — cohort movement | Refresh both |

Rules, inherited: real methodology section · **n disclosed** · aggregate only, never a single child's data · `Dataset` schema · every chart a branded image (feeds the image sitemap) · a downloadable summary.

The Q4 study is the launch asset. It is also the honest answer to §2.4, which is why it goes first.

### 6.3 Distribution

Bing Webmaster Tools before anything else — ChatGPT and Copilot retrieval leans on Bing's index · IndexNow ping on deploy · `llms.txt` with a Key Facts block near the top (**shipped**, see §7) · Reddit and Quora participation, because those corpora are retrieved heavily · Wikipedia/Wikidata only once the studies are genuinely citable, never as spam.

### 6.4 Measurement: the AEO panel

Port `docs/ai-seo/AEO_PANEL.md`. Ten fixed prompts, signed-out, monthly, run through ChatGPT-with-search, Perplexity and Google AI Overviews. Score two independent columns — **Mentioned** in the body, **Cited** in sources — and **record the answer text, not just the verdict**. ieltsbiz's most actionable single result was a *negative* mention that a yes/no scoreboard would have hidden.

Baseline run must happen before wave 1 ships, so there is a before.

---

## 7. Technical foundation

Shipped 2026-09-09 (`src/lib/seo/`, `src/app/robots.ts`, `sitemap.ts`, `llms.txt`):

- `metadataBase`, canonicals, and **`hreflang` across all six locales** with `x-default` — the largest pre-existing gap, since six locales were serving with no alternates at all
- Organization / WebSite / Breadcrumb / FAQPage / HowTo / Dataset / ItemList schema builders
- `robots.ts` — crawlable, with `/admin`, `/report`, `/children` and `/auth` disallowed. A child's writing must never be indexed
- `sitemap.ts` — locale alternates per entry
- `llms.txt` — Key Facts block first, as §6.3 requires
- One brand claim, sourced from a single constant (§6.1 rule 5)

Still open: OG image generation · image sitemap · IndexNow · `docs/ai-seo/AEO_PANEL.md` · the blog route itself.

---

## 8. The keyword map

`content/keyword-map.csv`, same columns as ieltsbiz. **Rule: no new URL without a row, and no two rows sharing a primary query.** This is the cannibalization firewall and it is cheap now and expensive later.

Seeded with the §4 wave-1 and wave-2 targets, with `volume` deliberately left empty until §0 is done.

---

## 9. Do this week, in order

1. **Pull real volumes** for the seed list (§0). Everything below is provisional until this exists.
2. **Run the AEO panel baseline** (§6.4) — you cannot show movement without a before.
3. Bing Webmaster Tools + Google Search Console, both verified.
4. Publish **hub A page 1**: *Is AI making my child stop thinking for themselves?* — answer-first, with whatever n the corpus holds by then.
5. Ship **hub B**: ten thinking-move definition pages from `moves.ts`. Semi-programmatic, moat content, and the reference page the Q4 study will point at.
6. Decide the blog's URL shape before the first post exists — `/blog/[slug]` under the locale tree, one canonical per language.

---

## 10. Risks

- **Publishing before the study.** Commodity pages first means competing with listicle mills on their terms. The corpus is the only unfair advantage; lead with it.
- **Writing for teachers by accident.** §2.1's incumbents own classroom intent. Every hub-D page must read as parent-shaped or it loses to TIME.
- **Children's data.** Every quoted example is aggregate or consented, never a single identifiable child. This is a legal line, not an editorial preference — and it also happens to be the thing that makes the study credible.
- **Brand collision.** "Shikhi" also belongs to [Shikhi AI](https://shikhiai.com). Keep entity descriptions distinct in schema, or both properties blur in AI answers.
