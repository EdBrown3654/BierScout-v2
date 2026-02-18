# 002-beer-data-sync-and-enrichment

## Status
Planned

## Goal
Ein robustes, fuer Einsteiger wartbares Daten-Setup schaffen, bei dem `biermarket_bierliste.csv` die stabile Basis bleibt, aber fehlende oder veraltete Felder automatisiert ueber kostenlose Quellen angereichert und regelmaessig aktualisiert werden.

## Non-goals
- Vollstaendiger Ersatz der lokalen CSV durch Live-API-Reads im Frontend
- Aufbau einer eigenen komplexen ETL-Plattform mit Datenbank
- Umgehung von API- oder Website-Nutzungsbedingungen
- Automatisches Massen-Scraping ohne Source-Freigabe
- User-generierter Content (Ratings, Reviews, Accounts)

## User stories
- As a maintainer with low programming experience, I want one command to refresh beer metadata, so that I can keep the catalog current without touching code internals.
- As a BierScout visitor, I want reliable and current brewery metadata, so that beer cards feel trustworthy.
- As a project owner, I want to prioritize free and legally safe data sources, so that operating costs remain near zero.
- As a maintainer, I want a clear fallback strategy when APIs fail, so that the site still works with the last valid snapshot.

## Scope
- Define canonical beer schema for the app runtime (including optional enriched fields).
- Keep CSV as source-of-truth for core list ordering and static baseline fields.
- Add enrichment layer from free APIs with deterministic merge priority.
- Add scheduled sync mode (Cron) plus manual CLI trigger.
- Add quality report for missing fields, conflicts, and unchanged runs.

## Data source strategy (priority order)
1. Local CSV (`biermarket_bierliste.csv`) for baseline fields.
2. Open Brewery DB for brewery-level enrichment (website/location metadata where matchable).
3. Optional Open Food Facts enrichment only for entries with barcode/GTIN.
4. Optional controlled scraping adapters only for explicitly approved sources with Terms/robots compliance.

## Acceptance criteria
- [ ] AC-1: A documented canonical schema exists for baseline + enriched fields, including required vs optional attributes.
- [ ] AC-2: A single command (`npm run data:sync`) runs full sync and writes deterministic output files.
- [ ] AC-3: A dry-run mode (`npm run data:sync -- --dry-run`) exists and writes no project files.
- [ ] AC-4: Output includes `data/beers.enriched.json` (or equivalent) consumed by the app instead of ad-hoc runtime merging.
- [ ] AC-5: Merge precedence is explicit: manual overrides > CSV baseline > API enrichment > scrape enrichment.
- [ ] AC-6: Every enriched record stores source trace metadata (`source`, `sourceId/url`, `syncedAt`).
- [ ] AC-7: Name collisions across countries (e.g. same beer name in multiple countries) are resolved via stable matching rules (`name + brewery + country`).
- [ ] AC-8: If external source is unavailable/rate-limited, sync exits gracefully and keeps last valid enriched snapshot.
- [ ] AC-9: A machine-readable quality report is generated (`data/sync-report.json`) with counts for missing fields, conflicts, and match-rate.
- [ ] AC-10: Legal guardrails are enforced: scraping adapters require explicit allowlist and include source-level compliance notes.
- [ ] AC-11: Scheduled sync runs at least daily via one deployment-compatible scheduler (Vercel Cron or GitHub Actions schedule).
- [ ] AC-12: Failed scheduled syncs produce visible logs and non-zero exit code.
- [ ] AC-13: Existing UI behavior (search/filter/i18n) remains unchanged for users after switching to enriched data source.
- [ ] AC-14: Lint, typecheck, and build pass after implementation.

## Edge cases
- API returns partial or inconsistent brewery naming (umlauts, punctuation, casing differences).
- Duplicate beer names across multiple countries or breweries.
- Entries without brewery, ABV, or ingredients remain valid and renderable.
- API rate limits or temporary outages during scheduled sync.
- Source field format drift (e.g. `ABV` as text like `Variabel`).
- Unicode normalization differences (`ä/ae`, apostrophes, accented characters).
- Scraping source removes fields or blocks bot traffic.

## Risks/Dependencies
- Dependency on third-party API uptime and ToS stability.
- Matching ambiguity can produce incorrect enrichment if keys are weak.
- Cron environment differences between local/dev/prod.
- Additional maintenance burden if scraping is introduced too early.

## Milestones
1. Milestone 1: Schema + enrichment pipeline with Open Brewery DB only, manual trigger only.
2. Milestone 2: Add scheduler + quality report + operational logging.
3. Milestone 3: Evaluate optional barcode path (Open Food Facts) and optional approved scraping adapters.

## Open questions
- Which scheduler is preferred for this repo first: Vercel Cron or GitHub Actions?
- Soll Open Food Facts in v1 direkt integriert werden oder erst nach Barcode-Ergaenzung?
- Welche konkreten Quellen waeren fuer einen spaeteren Scraping-Adapter legal/erwuenscht?
