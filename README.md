# SaaSquatch Lead Scorer

**Find, verify, and rank acquisition leads.** Pick an industry and a city, or import your own list. Each company's website is crawled, its contacts are verified, and it gets a 0–100 acquisition-fit score with the reasons behind every point.

Built in 5 hours as an extension to [SaaSquatch Leads](https://www.saasquatchleads.com/) for the Caprae Capital challenge. Approach: **quality first**.

- **Video walkthrough:** [Watch on Loom](https://www.loom.com/share/d24d7aaefaf5471a86ab6845ce8d2cde)
- **Live demo:** [saasquatch-lead-scorer.vercel.app](https://saasquatch-lead-scorer.vercel.app/)

## Why this feature

SaaSquatch already solves data reach: it pulls companies from Apollo, LinkedIn, Google Maps, and more. Once a searcher has hundreds of rows, the bottleneck is deciding **which owners to call first**. For an acquisition entrepreneur, a good lead is an owner-run business that has operated for decades (a possible succession window), can be reached directly, and has room for digital improvement after the deal. This tool turns those signals into a ranked list with a recommended next step for each lead.

## Features

- **Discovery:** industry + city → independent businesses from OpenStreetMap. Chains, branded locations, and directory/social links are excluded.
- **Import:** paste URLs, upload a CSV, or drag one in. The website column is detected automatically, and URL variants are deduplicated to one root domain.
- **Verification:** emails and phones extracted from the live site, phone numbers validated, email domain checked for an MX record, and company age confirmed with the RDAP domain registration date.
- **Explainable score:** Hot / Warm / Cold tiers, with every point listed alongside its reason.
- **Next best action:** email the owner, call, reach out on LinkedIn, research, or skip.
- **Outreach:** an AI-written opener (template fallback) and a one-click email draft.
- **Export:** filtered CSV with HubSpot-compatible column names.

### Scoring model

A transparent rules engine (`src/server/enrichment/lead-score.ts`). Scores are computed on read, never stored, so weights can change without re-crawling.

| Signal | Points |
| --- | --- |
| Founded 25+ years ago (10+ years: 15; domain registered 15+ years ago: 10) | 25 |
| Family-owned, owner-operated, or multi-generation | 20 |
| Email found with a working mail domain (email only: 10) | 25 |
| Direct phone number | 10 |
| LinkedIn company page | 10 |
| Website not updated in 2+ years (digital upside) | 10 |

Hot ≥ 65, Warm ≥ 40, Cold below that.

## UX and design choices

- **One screen, one flow:** source → progress → insights → results, in the order a searcher works.
- **Fast first results:** leads stream in batches of 5 behind a progress bar, so the first ones are usable within seconds.
- **Triage first, detail on demand:** the table shows score, age, best contact, and next step. Expanding a row shows the score breakdown, contacts, and opener.
- **Color means state:** emerald = hot/verified, amber = warm, slate = cold, rose = skip.
- **Honest states:** sites that are blocked by robots.txt, protected by a CAPTCHA, or offline are labeled with a suggested next step instead of disappearing.
- **Shortcuts:** ⌘/Ctrl + Enter to score, one-click copy, a sample list for the first visit.

## Architecture

```
React client ─ POST /api/discover ─► Nominatim geocode ─► Overpass (40 km) ─► chain filter ─► domains
             └ batches of 5 ─► POST /api/enrich (serverless, zod, p-limit 4)
                                 ├─ cache hit (Turso, 7-day TTL) ─► score
                                 └─ miss, in parallel:
                                      website crawl (robots.txt, CAPTCHA detection, about/contact pages)
                                      RDAP registration year · DNS MX lookup
                                    ─► opener (OpenAI or template) ─► cache ─► score
```

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| API | Next.js Route Handlers with zod validation |
| Data sources | Company websites (fetch + cheerio + robots-parser), OpenStreetMap Nominatim/Overpass, RDAP, DNS MX |
| Parsing | libphonenumber-js, regex, PapaParse |
| Database | Turso (libSQL/SQLite) via Drizzle ORM; a local SQLite file in development |
| AI | OpenAI Responses API (optional) |
| Hosting | Vercel: statically prerendered page + serverless functions on AWS |
| Deployment | Push to `main` deploys to production; every pull request gets a preview URL |

**Storage and caching:** one `companies` table keyed by root domain stores the crawled profile as JSON. Profiles are cached for 7 days, so repeat lookups take milliseconds. Failed crawls are not cached.

**Performance and reliability:** 5 domains per request keeps each serverless call well under its timeout. Up to 4 sites are crawled concurrently with an 8 s page timeout. The crawler follows each site's own navigation to find about/contact pages, falls back from `https://` to `www.` to `http://`, and retries 429/5xx responses once, honoring `Retry-After`.

**Ethical collection:** robots.txt is respected, requests carry a descriptive User-Agent, CAPTCHAs are reported rather than bypassed, at most 4 pages are fetched per company, and OpenStreetMap data is attributed.

## Setup

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # defaults work as-is
npm run db:push              # creates the local SQLite schema
npm run dev                  # http://localhost:3000
```

Try **Auto repair** + **Columbus, OH**, or open **Import a list** → **Try sample list**.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | `file:local.db` locally, `libsql://…` for Turso |
| `DATABASE_AUTH_TOKEN` | Turso token (production only) |
| `OPENAI_API_KEY` | Optional. Enables AI openers |
| `OPENAI_MODEL` | Optional. Defaults to `gpt-5-mini` |

**Deploy:** create a Turso database, run `npm run db:push` against it, then import the repo into Vercel with the variables above.

## Dataset

`public/sample-leads.csv`: 17 real family-owned SMBs (machine shops, HVAC, landscaping, food), including one intentional duplicate to demonstrate deduplication.

## Limitations and next steps

- OpenStreetMap coverage varies by city. Inside SaaSquatch, discovery would use its existing Google Maps and Apollo sources.
- Sites rendered only by JavaScript need a headless-browser fallback (e.g. Playwright).
- Configurable buy-box and weights per searcher, direct HubSpot/Salesforce sync, and owner-name matching from LinkedIn data.
