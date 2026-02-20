#!/usr/bin/env node

/**
 * Sync CLI: Entrypoint for manual and scheduled beer data synchronization
 * Coordinates CSV loading, API enrichment, merging, and report generation
 *
 * Usage:
 *   node scripts/data/sync-beers.mjs           # Full sync
 *   node scripts/data/sync-beers.mjs --dry-run # Validate without writing
 *   node scripts/data/sync-beers.mjs --request-delay-ms 1000 # Open Brewery delay
 *   node scripts/data/sync-beers.mjs --off-max-pages 12 --off-discovery-limit 500
 *
 * Implements AC-2: Single command for full sync
 * Implements AC-3: Dry-run mode support
 * Implements AC-4: Deterministic output files
 * Implements AC-8: Graceful fallback on API failures
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { loadCsvBaseline } from "./load-csv.mjs";
import { enrichBeers } from "./sources/open-brewery-db.mjs";
import { enrichBeersFromOpenFoodFacts } from "./sources/open-food-facts.mjs";
import { mergeBeers, validateEnrichedBeer } from "./merge-enrichment.mjs";
import { analyzeQuality } from "./report-quality.mjs";

// Configuration
const CSV_PATH = join(process.cwd(), "biermarket_bierliste.csv");
const DATA_DIR = join(process.cwd(), "data");
const ENRICHED_PATH = join(DATA_DIR, "beers.enriched.json");
const REPORT_PATH = join(DATA_DIR, "sync-report.json");
const OVERRIDES_PATH = join(DATA_DIR, "manual-overrides.json");

// Command-line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const skipOpenBrewery =
  args.includes("--skip-open-brewery") || args.includes("--skip-enrichment");
const skipOpenFoodFacts = args.includes("--skip-open-food-facts");

function parseIntegerArg(flag, defaultValue, { min = 0 } = {}) {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) {
    return defaultValue;
  }

  const parsed = Number.parseInt(args[index + 1], 10);
  if (!Number.isFinite(parsed) || parsed < min) {
    return defaultValue;
  }
  return parsed;
}

const requestDelayMs = parseIntegerArg("--request-delay-ms", 500, { min: 0 });
const offMaxPages = parseIntegerArg("--off-max-pages", 8, { min: 1 });
const offPageSize = parseIntegerArg("--off-page-size", 100, { min: 25 });
const offDelayMs = parseIntegerArg("--off-delay-ms", 120, { min: 0 });
const offDiscoveryLimit = parseIntegerArg("--off-discovery-limit", 300, {
  min: 0,
});

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
  console.log(`Open Brewery delay: ${requestDelayMs}ms`);
  console.log(
    `Open Food Facts pages: ${offMaxPages} x ${offPageSize} (delay ${offDelayMs}ms, discovery ${offDiscoveryLimit})`
  );
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
    const openBreweryMap = new Map();
    let openBreweryStats = { attempted: 0, matched: 0 };

    if (skipOpenBrewery) {
      console.log("   Skipped (--skip-open-brewery / --skip-enrichment flag)");
    } else {
      try {
        const result = await enrichBeers(baselineBeers, {
          delayMs: requestDelayMs,
          dryRun: isDryRun,
        });
        openBreweryMap.clear();
        for (const [nr, payload] of result.enrichment) {
          openBreweryMap.set(nr, payload);
        }
        openBreweryStats = result.stats;
        console.log(
          `   Attempted: ${openBreweryStats.attempted}, Matched: ${openBreweryStats.matched}`
        );
      } catch (err) {
        console.warn(`   Open Brewery DB failed (graceful fallback): ${err.message}`);
        console.warn("   Continuing with baseline data only");
      }
    }

    // 4. Enrich + discover with Open Food Facts (no-key public API)
    console.log("4. Enriching with Open Food Facts...");
    const openFoodFactsMap = new Map();
    let discoveredBeers = [];
    let openFoodFactsStats = {
      attempted: baselineBeers.length,
      matched: 0,
      fetchedProducts: 0,
      discovered: 0,
    };

    if (skipOpenFoodFacts) {
      console.log("   Skipped (--skip-open-food-facts flag)");
    } else {
      try {
        const result = await enrichBeersFromOpenFoodFacts(baselineBeers, {
          maxPages: offMaxPages,
          pageSize: offPageSize,
          delayMs: offDelayMs,
          discoveryLimit: offDiscoveryLimit,
          includeDiscovery: true,
        });

        for (const [nr, payload] of result.enrichment) {
          openFoodFactsMap.set(nr, payload);
        }
        discoveredBeers = result.discoveredBeers;
        openFoodFactsStats = result.stats;

        console.log(
          `   Attempted: ${openFoodFactsStats.attempted}, Matched: ${openFoodFactsStats.matched}, Discovered: ${openFoodFactsStats.discovered}`
        );
        console.log(`   Fetched products: ${openFoodFactsStats.fetchedProducts}`);
      } catch (err) {
        console.warn(`   Open Food Facts failed (graceful fallback): ${err.message}`);
        console.warn("   Continuing without Open Food Facts data");
      }
    }

    // 5. Merge with explicit precedence
    console.log("5. Merging with explicit precedence...");
    const mergedBaselineBeers = mergeBeers(
      baselineBeers,
      openBreweryMap,
      manualOverridesMap,
      { openFoodFactsMap }
    );
    const allEnrichedBeers = [...mergedBaselineBeers, ...discoveredBeers];
    console.log(
      `   Merged ${mergedBaselineBeers.length} baseline records (+${discoveredBeers.length} discovered)`
    );

    // 6. Validate and analyze quality
    console.log("6. Validating and analyzing quality...");
    const baselineNrs = new Set(baselineBeers.map((beer) => beer.nr));
    const tracker = analyzeQuality(
      allEnrichedBeers,
      openBreweryMap,
      manualOverridesMap,
      {
        openFoodFactsMap,
        baselineNrs,
        inputCount: baselineBeers.length,
        discoveredCount: discoveredBeers.length,
      }
    );

    let validationErrors = 0;
    for (const beer of allEnrichedBeers) {
      const validation = validateEnrichedBeer(beer);
      if (!validation.valid) {
        validationErrors++;
        validation.errors.forEach((err) => {
          tracker.recordError(beer.nr, err);
        });
      }
    }
    console.log(
      `   Valid records: ${allEnrichedBeers.length - validationErrors}/${allEnrichedBeers.length}`
    );
    if (validationErrors > 0) {
      console.warn(`   Validation errors: ${validationErrors}`);
    }
    tracker.finish();

    // 7. Generate quality report
    console.log("7. Generating quality report...");
    const report = tracker.generateReport();
    console.log(
      `   Report: ${report.matched.openBreweryDb} OBDB matched, ${
        report.matched.openFoodFacts || 0
      } OFF matched, ${report.discovered || 0} discovered, ${
        report.unmatched
      } unmatched`
    );

    // 8. Write outputs (unless dry-run)
    if (!isDryRun) {
      console.log("8. Writing output files...");

      // Create data directory if needed
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
      }

      // Sort for deterministic output
      const sortedBeers = sortBeersForOutput(allEnrichedBeers);

      // Write enriched beers
      writeJsonFile(ENRICHED_PATH, sortedBeers);
      console.log(`   Wrote ${ENRICHED_PATH}`);

      // Write quality report
      writeJsonFile(REPORT_PATH, report);
      console.log(`   Wrote ${REPORT_PATH}`);
    } else {
      console.log("8. Dry-run mode: skipping file writes");
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
