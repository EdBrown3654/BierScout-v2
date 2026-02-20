# Beer Data Sync & Enrichment

This document describes the Beer Data Sync & Enrichment Pipeline for BierScout.

## Overview

The pipeline automatically enriches the beer database with metadata from free API sources:

- **Baseline**: `biermarket_bierliste.csv` (local source of truth)
- **Enrichment**: Open Brewery DB (brewery website, location, country metadata)
- **Manual Overrides**: `data/manual-overrides.json` (curator corrections)

The sync process ensures:
- **Deterministic output** (sorted by `nr` for cache efficiency)
- **Source tracing** (every enriched field tracks its origin)
- **Graceful fallback** (if APIs fail, last valid snapshot is kept)
- **Quality reporting** (machine-readable metrics in `data/sync-report.json`)

## Architecture

```
CSV Baseline
    ↓
Load & Normalize (load-csv.mjs)
    ↓
Enrich from APIs (sources/open-brewery-db.mjs)
    ↓
Merge with explicit precedence (merge-enrichment.mjs)
  Priority: manual overrides > CSV > API > scrape
    ↓
Validate & Track quality (report-quality.mjs)
    ↓
Write deterministic outputs
  - data/beers.enriched.json
  - data/sync-report.json
```

## Data Schema

### Canonical Beer Record

```typescript
interface Beer {
  // Required fields
  nr: number;
  name: string;
  brewery: string;
  country: string;
  category: string;
  size: string;
  price: string;

  // Optional baseline fields (from CSV)
  abv?: string;
  stammwuerze?: string;
  ingredients?: string;

  // Optional enriched fields (from APIs)
  breweryWebsite?: string;
  breweryCity?: string;
  breweryState?: string;
  breweryCountryCode?: string;

  // Source tracking
  dataSources: Array<{
    source: "csv" | "open-brewery-db" | "manual-override";
    sourceId?: string;
    sourceUrl?: string;
    syncedAt: string; // ISO timestamp
  }>;
  syncedAt: string; // ISO timestamp
}
```

## Manual Overrides

Create or edit `data/manual-overrides.json` to correct specific records:

```json
{
  "overrides": [
    {
      "nr": 1,
      "fields": {
        "brewery": "Corrected Name",
        "breweryWebsite": "https://brewery.de",
        "breweryCity": "Munich"
      }
    }
  ]
}
```

**Note**: Manual overrides have highest precedence and override CSV + API data.

## Running the Sync

### Manual Sync

```bash
# Full sync (load CSV, enrich, merge, write outputs)
npm run data:sync

# Dry-run mode (validate without writing files)
npm run data:sync:dry

# Custom rate limit (milliseconds between API requests)
npm run data:sync -- --request-delay-ms 2000
```

### Scheduled Sync

The sync runs automatically daily via GitHub Actions:

- **Trigger**: 02:00 UTC every day (`.github/workflows/data-sync.yml`)
- **On change**: Commits `data/beers.enriched.json` and `data/sync-report.json`
- **On failure**: Creates visible logs and exits with non-zero code

To view scheduled runs: GitHub → Actions → Beer Data Sync

## Quality Report

After each sync, review `data/sync-report.json`:

```json
{
  "runId": "sync-1708336800000",
  "startedAt": "2024-02-19T02:00:00.000Z",
  "finishedAt": "2024-02-19T02:05:30.123Z",
  "durationMs": 330123,
  "inputCount": 500,
  "outputCount": 500,
  "matched": {
    "openBreweryDb": 450
  },
  "unmatched": 50,
  "conflicts": 2,
  "overridesApplied": 3,
  "missingFields": {
    "breweryWebsite": 50,
    "breweryCity": 5,
    "abv": 2
  },
  "errors": [],
  "warnings": [
    {
      "beer": 123,
      "message": "Name collision detected: 'Pilsner' from 'Brewery A' (Germany)"
    }
  ]
}
```

Key metrics:
- **matched**: Breweries successfully enriched from Open Brewery DB
- **unmatched**: Breweries not found (data added later or API mismatch)
- **missingFields**: Count of records missing optional enrichment fields
- **errors**: Non-blocking issues (validation, parsing)
- **warnings**: Collisions, API timeouts, rate limits

## API Integration

### Open Brewery DB

- **Endpoint**: `https://api.openbrewerydb.org/v1/breweries/search`
- **Query**: Brewery name + country matching
- **Timeout**: 10 seconds per request
- **Retry**: Up to 2 retries on failure
- **Rate limit**: Configurable delay (default 500ms between requests)
- **Fallback**: If API fails, sync continues with baseline data

Matching algorithm:
1. Search by brewery name
2. Score matches: exact name match (70 pts), partial (40 pts), country match (30 pts)
3. Select best match with score >= 40

### Future Integrations

- **Open Food Facts** (v2): Barcode-based product data
- **Approved Scrapers** (v2): Explicit allowlist only

## Application Integration

The app now prefers enriched data:

```typescript
// src/lib/beers.ts
export function loadBeers(): Beer[] {
  // Try enriched snapshot first
  if (enrichedJsonExists) {
    return parseEnrichedJson();
  }
  // Fallback to CSV baseline
  return parseCsv();
}
```

This ensures:
- Zero breaking changes (fallback always works)
- UI components use enriched fields only if available
- Search/filter behavior unchanged
- Performance benefits (pre-merged JSON instead of runtime merging)

## Testing

Run unit tests:

```bash
node scripts/data/__tests__/load-csv.test.mjs
node scripts/data/__tests__/merge-enrichment.test.mjs
node scripts/data/__tests__/integration.test.mjs
```

Test coverage:
- CSV parsing and normalization
- Merge precedence (manual > CSV > API)
- Collision detection
- Validation (required vs optional fields)
- Full pipeline integration
- Quality report generation

## Troubleshooting

### Sync Fails

```bash
# Check logs
npm run data:sync

# Validate CSV syntax
npm run data:sync:dry

# Check last report
cat data/sync-report.json | jq '.errors'
```

### API Rate Limiting

```bash
# Increase delay between requests
npm run data:sync -- --request-delay-ms 3000
```

### Corrupted Enriched JSON

```bash
# Regenerate from CSV
rm data/beers.enriched.json
npm run data:sync
```

### Override Not Applied

1. Check `data/manual-overrides.json` syntax (valid JSON)
2. Verify beer `nr` field matches CSV
3. Run `npm run data:sync:dry` to validate
4. Check `data/sync-report.json` for warnings

## Performance Considerations

- **Sync time**: ~2-5 minutes for 500 beers (Open Brewery DB rate limits)
- **Output size**: ~200-300 KB gzipped (deterministic JSON with source metadata)
- **Caching**: GitHub Actions uses `actions/cache` to speed up sync runs
- **Diffs**: Deterministic output (sorted by `nr`) minimizes Git diffs

## Security & Privacy

- **Secrets**: None stored in repo (APIs are public/free)
- **Data**: No user data collected or shared
- **API ToS**: Open Brewery DB allows public usage
- **Scraping**: Future scrapers require explicit allowlist + compliance notes

## Maintenance

### Regular Tasks

1. **Weekly**: Review `data/sync-report.json` for new warnings
2. **Monthly**: Update `data/manual-overrides.json` with corrections
3. **Quarterly**: Evaluate API alternatives (if Open Brewery DB changes)

### Handoff Notes

- Backend Developer: Implemented sync pipeline, adapters, and CLI
- Frontend Developer: UI remains unchanged, optional enriched fields non-blocking
- QA Engineer: Validate AC-1..AC-14 from feature spec

## References

- Feature spec: `.features/002-beer-data-sync-and-enrichment.feature.md`
- Solution design: `.features/002-beer-data-sync-and-enrichment.solution.md`
- API docs: https://api.openbrewerydb.org
- Acceptance criteria: See feature spec (AC-1 through AC-14)
