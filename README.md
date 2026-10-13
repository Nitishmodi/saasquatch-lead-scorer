# SaaSquatch Lead Scorer

**Find, verify, and rank acquisition leads.** Pick an industry and a city to discover independent businesses, or bring your own lead list. Every company's website is crawled, its contact data verified, and the company ranked by how likely it is to be a good acquisition target. Each score comes with the reasons behind it.

Built as a 5-hour extension to [SaaSquatch Leads](https://www.saasquatchleads.com/) for the Caprae Capital Full Stack Developer challenge. Approach: **quality first**. Fewer leads, each one verified, explained, and ready to act on.

## Why this feature

SaaSquatch already solves **data reach**. It pulls companies from Apollo, LinkedIn, Crunchbase, Google Maps, and more. Its own "AI revenue estimate" exists to help users decide which leads to spend credits on. Once a user has a large list, the bottleneck becomes **deciding which leads to act on**.

For an acquisition entrepreneur, a good lead is not just a company with an email address. It is an owner who has run the business for decades, may be thinking about succession, can be reached directly, and runs a business with room for operational and digital improvement. This tool turns those signals into a ranked list with clear reasons, so a searcher spends the first hour of the day on the 5 best owners instead of the 500 noisiest rows.

| Problem with raw lead lists | What SaaSquatch Lead Scorer does |
| --- | --- |
| Generic results full of franchises | Discovery skips branded and multi-location businesses, leaving the independent, owner-run companies acquirers want |
| Duplicates and URL variants (`www.`, `https://`, `/about`) | Normalizes and deduplicates every entry to one root domain |
| Stale or fake contact info | Extracts emails and phones from the live site, validates phone numbers, and checks the email domain's MX record |
| Missing company age | Combines the founding year from the site with the domain registration date from RDAP, a second public source |
| No sense of priority | 0–100 acquisition-fit score with Hot / Warm / Cold tiers |
| "Why is this lead ranked here?" | Every point in the score is listed with its reason |
| "What do I do with this lead?" | A next-best action per lead: email the owner, call, reach out on LinkedIn, research, or skip |
| Blank-page outreach | A personalized opening line, written by AI or from a template, with a one-click email draft |
| Re-keying data into a CRM | One-click CSV export with HubSpot-compatible column names |

## UX design choices

- **One screen, one flow.** Source, progress, insights, and results stack vertically in the order a searcher works: build the list, score it, triage it, export it. No navigation to learn.
- **Two ways in.** *Discover companies* (industry + city, with one-click suggested cities) for searchers starting from scratch; *Import a list* for users who already have a SaaSquatch or CRM export. Discovery feeds straight into scoring, so there is no copy-paste step between them.
- **Meet users where their data is.** Paste URLs in any format, upload a CSV, or drag one onto the input. The website column is detected automatically. A sample list removes the blank-page problem on first visit.
- **Feedback before and during work.** Discovery reports how many companies were found and how many chains were excluded. The import tab shows unique companies and removed duplicates *before* you run. Results stream in batch by batch behind a progress bar, so the first leads are usable within seconds.
- **Triage first, detail on demand.** The table shows only what decides priority: fit score, company age, best contact, ownership signals, and the next step. Clicking a row expands the score breakdown, every contact, and the outreach opener.
- **Explainable by default.** Every score is broken down point by point, so users trust the ranking and can override it with judgment.
- **Visual language with meaning.** Color is used only for state: emerald = hot / verified, amber = warm, slate = cold, rose = skip. Score rings, tier dots, and icons let users scan 100 rows without reading them.
- **Keyboard and workflow shortcuts.** `⌘/Ctrl + Enter` to score, one-click copy of the opener, "Open email draft" with the opener pre-filled, and filtered CSV export (you export exactly what you're looking at).
- **Honest states.** Sites that disallow crawling, sit behind a CAPTCHA, or are offline are labeled as such, with a suggested next step, instead of silently disappearing.

## Lead discovery

`POST /api/discover` turns an industry and a city into a list of company websites using open data:

1. **Geocode** the city with OpenStreetMap **Nominatim**.
2. **Query Overpass** for businesses in the chosen industry within 40 km that list a website.
3. **Exclude chains:** anything tagged with a `brand`, or whose domain appears at more than one location, is dropped. Directory and social links (Facebook, Yelp, etc.) are filtered out.
4. Up to 30 companies are passed straight into the scoring pipeline.

Industries (`src/lib/industries.ts`) are tuned to classic acquisition targets: HVAC & plumbing, electrical, construction, machine shops, auto repair, landscaping, accounting & insurance, clinics, printing, and food producers.

## Scoring model

Scoring is a transparent rules engine (`src/server/enrichment/lead-score.ts`). It is computed on every read and never stored, so the weights can change without re-crawling anything.

| Signal | Points | Why it matters for acquisitions |
| --- | --- | --- |
| Founded 25+ years ago (10+ years: 15) | 25 | Owner likely near retirement, so a succession window may be open |
| No founding year, but domain registered 15+ years ago | 10 | Fallback age signal from RDAP |
| Family-owned, owner-operated, or multi-generation | 20 | Direct line to the decision-maker; succession is a live question |
| Email found and its domain accepts mail (email only: 10) | 25 | You can actually reach the owner |
| Direct phone number | 10 | Cold-call workflows (a core SaaSquatch use case) |
| LinkedIn company page | 10 | Lets you research the owner before outreach |
| Website untouched for 2+ years | 10 | Digital upside after acquisition, which matches Caprae's AI-driven value creation |

Tiers: **Hot** ≥ 65, **Warm** ≥ 40, **Cold** below that.

**Next best action:** a Warm or Hot lead with a deliverable email → *Email the owner*; with a phone only → *Call the main line*; with LinkedIn only → *Reach out on LinkedIn*. Cold, blocked, or CAPTCHA-protected leads → *Research manually*. Offline sites → *Skip*.

## Architecture

```
Browser (React client)
  │  Discover: POST /api/discover { industry, location }
  │     Nominatim geocode ─► Overpass query (40 km) ─► chain + directory filter ─► domains
  │
  │  batches of 5 domains → POST /api/enrich
  ▼
Next.js Route Handler (Vercel serverless function, Node runtime)
  │  zod validation → dedupe → p-limit (4 concurrent)
  ├─► Cache lookup (Turso / libSQL, 7-day TTL) ──hit──► score → response
  └─► miss (sources fetched in parallel):
        ├─ Company website: robots.txt check ─► CAPTCHA/WAF detection
        │    ─► homepage + about/contact pages (cheerio, retry with backoff)
        │    ─► extract emails, phones, socials, founded year, ownership, platform
        ├─ RDAP registry: domain registration year
        └─ DNS: MX record for the email domain
        ─► outreach opener (OpenAI, template fallback)
        ─► upsert cache ─► score + next action → response
```

| Layer | Choice | Reason |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router) + **React 19** + **TypeScript** | One codebase for UI and API, typed end to end |
| Styling | **Tailwind CSS v4** | Consistent design tokens, no custom CSS sprawl |
| API | Next.js **Route Handlers** (`/api/discover`, `/api/enrich`) | Run as serverless functions with explicit `maxDuration` |
| Validation | **zod** | Rejects malformed requests at the boundary |
| Discovery | **OpenStreetMap** Nominatim + Overpass | Free, keyless business data with industry tags and websites |
| Crawling | `fetch` + **cheerio** + **robots-parser** | Fast static HTML parsing; respects `robots.txt` |
| Parsing | **libphonenumber-js**, regex, `node:dns` MX lookup | Real phone validation and email-domain checks |
| Second source | **RDAP** (`rdap.org`, the public successor to WHOIS) | Domain registration year with no API key |
| UI kit | **lucide-react** icons, **clsx** | Consistent iconography and conditional styling |
| Concurrency | **p-limit** | Bounded parallelism per request, polite to target sites |
| Database | **Turso (libSQL / SQLite)** via **Drizzle ORM** | Same driver for a local file and the hosted edge database; serverless-friendly |
| AI (optional) | **OpenAI Responses API** | Personalized openers; falls back to a deterministic template |
| CSV | **PapaParse** | Robust import (auto-detects the website column) and export |
| Hosting | **Vercel** (static page + serverless functions on **AWS**) | Push-to-deploy from GitHub, preview URL for every branch |

### Data storage and caching

- **Database:** a single `companies` table keyed by root domain, storing the crawled profile as JSON plus `fetched_at`. Locally this is a SQLite file (`local.db`). In production it is a hosted Turso database, with no code changes.
- **Profile cache (7-day TTL):** repeat lookups skip the crawl entirely and return in milliseconds. The "Served from cache" stat makes this visible. Failed crawls are never cached, so they are retried next time.
- **Scores are derived, not stored**, so tuning the scoring model takes effect immediately.

### Performance and reliability

- **Client-side batching (5 domains per request):** results stream into the table batch by batch, a progress bar shows status, and no single serverless call comes close to its timeout, even for lists of hundreds.
- **Bounded concurrency:** 4 sites at a time per request, with an 8-second timeout per page.
- **Adaptive crawling:** instead of guessing URLs, the crawler follows the site's own navigation to find about, contact, history, and team pages (up to 3), so it works across different site builders.
- **Fallbacks:** tries `https://`, then `https://www.`, then `http://` before marking a site unreachable.
- **Rate limits and bot walls:** `429`/`5xx` responses are retried once, honoring `Retry-After`. Cloudflare and AWS WAF CAPTCHA challenges are detected from response headers and reported as *bot-protected* rather than bypassed.
- **Static UI:** the page is prerendered at build time; only the API routes run on demand.

### Ethical data collection

- Checks `robots.txt` before every request and reports the lead as *blocked* instead of crawling around the rule.
- Identifies itself with a descriptive `User-Agent` (`SaaSquatchLeadScorer/1.0`).
- Collects only business contact details that companies publish on their own websites.
- Light footprint: at most 4 pages per company, cached for a week.
- Business data from OpenStreetMap is attributed in the UI, as the ODbL license requires.

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # defaults work as-is
npm run db:push              # creates the local SQLite schema
npm run dev                  # http://localhost:3000
```

Pick **Auto repair** and **Columbus, OH**, then **Find & score**. Or open **Import a list**, click **Load sample list**, then **Score leads**. The sample dataset is in [`public/sample-leads.csv`](public/sample-leads.csv): 17 rows of real family-owned SMBs (machine shops, HVAC, landscaping, food), including one intentional duplicate to demonstrate deduplication.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | No | `file:local.db` locally, `libsql://…` for Turso in production |
| `DATABASE_AUTH_TOKEN` | Production only | Turso auth token |
| `OPENAI_API_KEY` | No | Enables AI-written outreach openers |
| `OPENAI_MODEL` | No | Defaults to `gpt-5-mini` |

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run db:push` | Sync the Drizzle schema to the database |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript checks |

## Deployment (Vercel + Turso)

1. Create a database: `turso db create saasquatch-lead-scorer`, then get the URL (`turso db show saasquatch-lead-scorer --url`) and a token (`turso db tokens create saasquatch-lead-scorer`).
2. Push the schema: `DATABASE_URL=… DATABASE_AUTH_TOKEN=… npm run db:push`.
3. Import the GitHub repo in Vercel and add the environment variables above.
4. Every push to `main` deploys to production; every pull request gets a preview URL.

## API

`POST /api/discover`

```json
{ "industry": "auto-repair", "location": "Columbus, OH" }
```

Returns `{ "location", "companies": [{ "name", "domain" }], "chainsExcluded" }`. An unknown city returns `404`; invalid payloads return `400`.

`POST /api/enrich`

```json
{ "domains": ["geitzmachine.com", "https://www.hardingplumbing.com/"] }
```

Accepts 1–10 domains per request and returns `{ "leads": Lead[] }`, where each lead contains the crawled profile, `score`, `tier`, `reasons`, `nextAction`, `opener`, and a `cached` flag. Invalid payloads return `400`.

## Project structure

```
src/
├── app/
│   ├── api/discover/route.ts      # POST: industry + city → independent company domains
│   ├── api/enrich/route.ts        # POST: validate, dedupe, enrich with bounded concurrency
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/                    # SiteHeader, SiteFooter, BrandMark
│   ├── landing/                   # PageBackground, Hero, HowItWorks
│   ├── lead-source/               # LeadSource tabs, DiscoverPanel, ImportPanel
│   └── leads/
│       ├── lead-workspace.tsx     # Composes source, progress, summary, filters, table
│       ├── scoring-progress.tsx   # Batch progress bar
│       ├── pipeline-summary.tsx   # Pipeline stats
│       ├── lead-filters.tsx       # Tier, contactable, search, export
│       ├── lead-table.tsx         # Ranked table (LeadRow)
│       ├── lead-details.tsx       # Score breakdown, contacts, outreach opener
│       ├── next-action-badge.tsx
│       ├── best-contact.tsx
│       ├── score-ring.tsx
│       └── company-avatar.tsx
├── hooks/
│   └── use-lead-scoring.ts        # Batches domains through /api/enrich and tracks progress
├── lib/                           # Shared by client and server
│   ├── types.ts
│   ├── industries.ts              # Industry → OpenStreetMap tag selectors
│   ├── lead-filters.ts            # Filtering, sorting, tier counts
│   ├── next-action.ts             # Next-action labels shared by UI and CSV
│   ├── domain.ts                  # URL normalization and dedupe
│   ├── csv.ts                     # CSV import/export
│   ├── api-client.ts              # JSON POST helper with error handling
│   ├── animation.ts, format.ts    # Small UI helpers
│   └── site.ts                    # App name, repo URL, crawler User-Agent
└── server/                        # Server-only code
    ├── db/                        # libSQL + Drizzle client and schema
    ├── discovery.ts               # Nominatim geocoding, Overpass search, chain filtering
    └── enrichment/
        ├── enrich-domain.ts       # Cache → crawl → extract → verify → score pipeline
        ├── crawler.ts             # robots.txt-aware crawler with retry and CAPTCHA detection
        ├── extract-profile.ts     # HTML → company profile
        ├── domain-registry.ts     # RDAP domain registration lookup
        ├── mail-server.ts         # MX record lookup
        ├── lead-score.ts          # Acquisition-fit scoring and next best action
        └── outreach-opener.ts     # AI or template outreach opener
```

## Limitations and next steps

- **Discovery coverage:** OpenStreetMap coverage varies by city, and only businesses that list a website are returned. Inside SaaSquatch, the same pipeline would take companies from its existing Google Maps and Apollo sources.
- **JavaScript-rendered sites:** pages that render only in the browser return little HTML. A headless-browser fallback (Playwright on a worker) would cover them.
- **Bot protection:** CAPTCHA-protected sites are flagged, not crawled. Falling back to the other SaaSquatch sources for those companies would fill the gap without bypassing anyone's protection.
- **Configurable scoring:** let each searcher set their own buy-box (industries, age, geography) and weights.
- **Direct CRM sync:** push Hot leads straight into HubSpot or Salesforce through their APIs instead of CSV.
- **Owner identification:** match LinkedIn people data from SaaSquatch's existing sources to find the owner's name for each company.
