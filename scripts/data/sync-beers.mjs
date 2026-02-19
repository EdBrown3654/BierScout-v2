#!/usr/bin/env node

/**
 * Sync CLI: Entrypoint for manual and scheduled beer data synchronization
 * Coordinates CSV loading, API enrichment, merging, and report generation
 *
 * Usage:
 *   node scripts/data/sync-beers.mjs           # Full sync
 *   node scripts/data/sync-beers.mjs --dry-run # Validate without writing
 *   node scripts/data/sync-beers.mjs --request-delay-ms 1000 # Custom rate limit
 *
 * Implements AC-2: Single command for full sync
 * Implements AC-3: Dry-run mode support
 * Implements AC-4: Deterministic output files
 * Implements AC-8: Graceful fallback on API failures
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { loadCsvBaseline } from "./load-csv.mjs";
import { enrichBeers, searchBrewery } from "./sources/open-brewery-db.mjs";
import { mergeBeers, validateEnrichedBeer } from "./merge-enrichment.mjs";
import { analyzeQuality } from "./report-quality.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const CSV_PATH = join(process.cwd(), "biermarket_bierliste.csv");
const DATA_DIR = join(process.cwd(), "data");
const ENRICHED_PATH = join(DATA_DIR, "beers.enriched.json");
const REPORT_PATH = join(DATA_DIR, "sync-report.json");
const OVERRIDES_PATH = join(DATA_DIR, "manual-overrides.json");

// Command-line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const skipEnrichment = args.includes("--skip-enrichment");
const requestDelayMs = args.includes("--request-delay-ms")
  ? parseInt(args[args.indexOf("--request-delay-ms") + 1], 10)
  : 500;

/**
 * Load manual overrides synchronously (ES module compatibility)
 */
function loadManualOverridesSync(overridesPath) {
  try {
    if (!existsSync(overridesPath)) {
      return new Map();
    }
    const content = readFileSync(overridesPath, "utf-8");
    const data = JSON.parse(content);
    if (!Array.isArray(data.overrides)) {
      console.warn("Invalid overrides format: expected { overrides: [] }");
      return new Map();
    }
    return new Map(data.overrides.map((o) => [o.nr, o.fields || {}]));
  } catch (err) {
    console.warn(`Failed to load manual overrides: ${err.message}`);
    return new Map();
  }
}

/**
 * Sort beers deterministically by nr for consistent output
 */
function sortBeersForOutput(beers) {
  return beers.slice().sort((a, b) => a.nr - b.nr);
}

/**
 * Write JSON file with deterministic formatting
 */
function writeJsonFile(path, data, options = {}) {
  const { pretty = true } = options;
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  writeFileSync(path, content, "utf-8");
}

/**
 * Main sync function
 */
async function sync() {
  console.log("Beer Data Sync & Enrichment Pipeline");
  console.log("====================================");
  console.log(`Dry run: ${isDryRun}`);
  console.log(`Request delay: ${requestDelayMs}ms`);
  console.log("");

  try {
    // 1. Load CSV baseline
    console.log("1. Loading CSV baseline...");
    const baselineBeers = loadCsvBaseline(CSV_PATH);
    console.log(`   Loaded ${baselineBeers.length} beers from CSV`);

    // 2. Load manual overrides
    console.log("2. Loading manual overrides...");
    const manualOverridesMap = loadManualOverridesSync(OVERRIDES_PATH);
    console.log(`   Loaded ${manualOverridesMap.size} manual overrides`);

    // 3. Enrich with Open Brewery DB
    console.log("3. Enriching with Open Brewery DB...");
    const enrichmentMap = new Map();
    let enrichStats = { attempted: 0, matched: 0 };

    if (skipEnrichment) {
      console.log("   Skipped (--skip-enrichment flag)");
    } else {
      try {
        const result = await enrichBeers(baselineBeers, {
          delayMs: requestDelayMs,
          dryRun: isDryRun,
        });
        enrichmentMap.clear();
        for (const [nr, payload] of result.enrichment) {
          enrichmentMap.set(nr, payload);
        }
        enrichStats = result.stats;
        console.log(
          `   Attempted: ${enrichStats.attempted}, Matched: ${enrichStats.matched}`
        );
      } catch (err) {
        console.warn(`   Open Brewery DB failed (graceful fallback): ${err.message}`);
        console.warn("   Continuing with baseline data only");
      }
    }

    // 4. Merge with explicit precedence
    console.log("4. Merging with explicit precedence...");
    const enrichedBeers = mergeBeers(
      baselineBeers,
      enrichmentMap,
      manualOverridesMap
    );
    console.log(`   Merged ${enrichedBeers.length} enriched records`);

    // 5. Validate and analyze quality
    console.log("5. Validating and analyzing quality...");
    const tracker = analyzeQuality(
      enrichedBeers,
      enrichmentMap,
      manualOverridesMap
    );
    tracker.finish();

    let validationErrors = 0;
    for (const beer of enrichedBeers) {
      const validation = validateEnrichedBeer(beer);
      if (!validation.valid) {
        validationErrors++;
        validation.errors.forEach((err) => {
          tracker.recordError(beer.nr, err);
        });
      }
    }
    console.log(
      `   Valid records: ${enrichedBeers.length - validationErrors}/${enrichedBeers.length}`
    );
    if (validationErrors > 0) {
      console.warn(`   Validation errors: ${validationErrors}`);
    }

    // 6. Generate quality report
    console.log("6. Generating quality report...");
    const report = tracker.generateReport();
    console.log(
      `   Report: ${report.matched.openBreweryDb} matched, ${report.unmatched} unmatched`
    );

    // 7. Write outputs (unless dry-run)
    if (!isDryRun) {
      console.log("7. Writing output files...");

      // Create data directory if needed
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
      }

      // Sort for deterministic output
      const sortedBeers = sortBeersForOutput(enrichedBeers);

      // Write enriched beers
      writeJsonFile(ENRICHED_PATH, sortedBeers);
      console.log(`   Wrote ${ENRICHED_PATH}`);

      // Write quality report
      writeJsonFile(REPORT_PATH, report);
      console.log(`   Wrote ${REPORT_PATH}`);
    } else {
      console.log("7. Dry-run mode: skipping file writes");
    }

    console.log("");
    console.log("Sync completed successfully!");
    console.log(`Duration: ${report.durationMs}ms`);

    return 0;
  } catch (err) {
    console.error("");
    console.error("SYNC FAILED");
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    return 1;
  }
}

// Run sync
const exitCode = await sync();
process.exit(exitCode);
