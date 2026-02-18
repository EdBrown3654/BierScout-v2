# 002-beer-data-sync-and-enrichment solution

## Status
Planned

## Input spec
- `.features/002-beer-data-sync-and-enrichment.feature.md`

## Tech Design

### Component structure
- **Sync CLI (Node, server-only)**
  - `scripts/data/sync-beers.mjs` as single entrypoint for manual + scheduled sync.
  - `scripts/data/load-csv.mjs` parses `biermarket_bierliste.csv` into normalized baseline objects.
  - `scripts/data/merge-enrichment.mjs` applies deterministic precedence:
    manual overrides > CSV baseline > API enrichment > scrape enrichment.
  - `scripts/data/report-quality.mjs` generates machine-readable quality metrics.
- **Source adapters (replaceable)**
  - `scripts/data/sources/open-brewery-db.mjs` (v1 required).
  - `scripts/data/sources/open-food-facts.mjs` (v2 optional, barcode-only path).
  - `scripts/data/sources/scrape/*.mjs` (optional, allowlist-only adapters).
- **Data artifacts (versioned project files)**
  - `data/beers.enriched.json` canonical app input.
  - `data/sync-report.json` sync summary, match stats, conflicts, skipped records.
  - `data/manual-overrides.json` curated corrections by maintainers.
- **Runtime data loader (App Router server boundary)**
  - `src/lib/beers.ts` (or a split helper module) reads `data/beers.enriched.json`.
  - Fallback to CSV parse if enriched snapshot is missing/corrupt.
- **Scheduler integration**
  - GitHub Actions schedule as default persistence-friendly cron.
  - Optional Vercel Cron only if writing to external storage is introduced later.

### Data flow
1. `npm run data:sync` starts `scripts/data/sync-beers.mjs`.
2. CSV baseline is parsed and normalized (`name`, `brewery`, `country`, `category`, etc.).
3. Matching key is built as `normalized(name) + normalized(brewery) + normalized(country)`.
4. Open Brewery DB adapter fetches candidate brewery metadata and returns mapped enrichment payloads.
5. Merge stage combines baseline + enrichment + manual overrides using explicit precedence.
6. Validation stage rejects malformed records, logs warnings, and never blocks valid baseline output.
7. Writer stage creates deterministic JSON outputs:
   - `data/beers.enriched.json`
   - `data/sync-report.json`
8. App runtime reads enriched JSON; UI/search/filter behavior stays unchanged.

### API/contracts
- **Internal canonical record contract (runtime)**
  - Required: `nr`, `name`, `country`, `category`, `size`, `price`.
  - Optional baseline: `brewery`, `abv`, `stammwuerze`, `ingredients`.
  - Optional enrichment: `breweryWebsite`, `breweryCity`, `breweryState`, `breweryCountryCode`, `dataSources[]`, `syncedAt`.
- **Source trace contract**
  - `dataSources[]` item shape:
    - `source` (`csv` | `open-brewery-db` | `open-food-facts` | `scrape:<sourceName>`)
    - `sourceId` or `sourceUrl`
    - `syncedAt` ISO timestamp
- **Quality report contract (`data/sync-report.json`)**
  - `runId`, `startedAt`, `finishedAt`, `durationMs`
  - `inputCount`, `outputCount`
  - `matched.openBreweryDb`, `unmatched`, `conflicts`, `overridesApplied`
  - `missingFields` counts per field
  - `errors[]`, `warnings[]`
- **External API touchpoints**
  - Open Brewery DB search endpoints by name/city/country for brewery metadata lookup.
  - Optional Open Food Facts endpoint for barcode-based product enrichment.

### Server/Client boundaries
- Sync + adapter code lives in `scripts/` only and is never bundled client-side.
- Data loading into Next.js remains server-side (`src/app/page.tsx` -> `src/lib/beers.ts`).
- Client components (`src/components/*`) consume already merged data, no direct third-party API calls.
- Secrets (if any future source requires token) stay in env vars, never exposed via `NEXT_PUBLIC_*`.

### Performance and reliability
- Deterministic output ordering (by `nr`) to keep diffs small and cache-friendly.
- Adapter-level timeout + retry with capped attempts; on hard failure continue with baseline dataset.
- Optional local request cache per run to reduce repeated API hits for same brewery.
- Rate-limit-safe mode via configurable delay (`--request-delay-ms`).
- `--dry-run` mode for safe validation in CI without writing files.

### Risks and tradeoffs
- Name-based matching can be wrong for generic names; country + brewery must stay in key.
- Open/free APIs may be incomplete; baseline CSV must always render without enrichment.
- Scheduled sync in Vercel without external storage cannot persist generated files; GitHub Actions is better for static snapshot workflows.
- Scraping adds legal + maintenance burden and should be behind explicit source allowlist and documentation.

## Affected files/folders
- `package.json` (new scripts: `data:sync`, optional `data:sync:dry`)
- `scripts/data/sync-beers.mjs` (new)
- `scripts/data/load-csv.mjs` (new)
- `scripts/data/merge-enrichment.mjs` (new)
- `scripts/data/report-quality.mjs` (new)
- `scripts/data/sources/open-brewery-db.mjs` (new)
- `scripts/data/sources/open-food-facts.mjs` (optional, new)
- `data/beers.enriched.json` (new generated artifact)
- `data/sync-report.json` (new generated artifact)
- `data/manual-overrides.json` (new curated artifact)
- `src/lib/beers.ts` (update to prefer enriched JSON)
- `README.md` (update data sync documentation)
- `.github/workflows/data-sync.yml` (new scheduled sync workflow)

## Handoff
- **Backend Developer**
  - Implement sync pipeline, adapters, merge policy, and report generation.
  - Implement scheduler workflow and failure logging behavior.
  - Add fixture-based tests for parser, matching, and merge precedence.
- **Frontend Developer**
  - Ensure existing UI is compatible with enriched optional fields.
  - Keep current UX unchanged; optionally add non-blocking display for new metadata (future scope).
- **QA Engineer**
  - Validate acceptance criteria AC-1..AC-14 from the source feature spec.
  - Verify fallback behavior when APIs are unavailable.
