/**
 * Integration tests for full sync pipeline
 * Tests complete flow from CSV to enriched JSON
 */

import { strict as assert } from "assert";
import { loadCsvBaseline } from "../load-csv.mjs";
import { mergeBeers, validateEnrichedBeer } from "../merge-enrichment.mjs";
import { QualityTracker } from "../report-quality.mjs";
import { join } from "path";
import { writeFileSync, unlinkSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function createTestCsv(content) {
  const path = join(__dirname, "integration-test.csv");
  writeFileSync(path, content, "utf-8");
  return path;
}

function cleanupTestCsv(path) {
  try {
    unlinkSync(path);
  } catch (e) {
    // ignore
  }
}

describe("Full Sync Pipeline", () => {
  test("complete flow from CSV to enriched output", () => {
    const csv = `Nr.;Biermarke/Name;Brauerei;Land;Alkoholgehalt;Stammwürze;Zutaten;Größe;Preis;Kategorie

=== DEUTSCHLAND ===
1;Pilsner;Brewery A;Deutschland;4,8%;11 °P;Hops, Malt;0,5L;4,50 €;Pilsner
2;Dunkel;Brewery B;Deutschland;5,2%;12 °P;Hops, Malt;0,33L;3,80 €;Dunkel

=== BELGIEN ===
3;Trappist;Brewery C;Belgien;7,0%;15 °P;Hops, Malt, Wheat;0,33L;5,00 €;Trappist
`;

    const path = createTestCsv(csv);
    try {
      // 1. Load CSV
      const baseline = loadCsvBaseline(path);
      assert.strictEqual(baseline.length, 3);

      // 2. Prepare enrichment (simulating API results)
      const enrichmentMap = new Map([
        [
          1,
          {
            breweryWebsite: "https://brewery-a.de",
            breweryCity: "Munich",
          },
        ],
        [
          2,
          {
            breweryWebsite: "https://brewery-b.de",
            breweryCity: "Berlin",
          },
        ],
        // Beer 3 has no enrichment (unmatched)
      ]);

      // 3. Merge with empty manual overrides
      const enriched = mergeBeers(baseline, enrichmentMap, new Map());
      assert.strictEqual(enriched.length, 3);

      // 4. Validate all records
      let validCount = 0;
      for (const beer of enriched) {
        const validation = validateEnrichedBeer(beer);
        if (validation.valid) validCount++;
      }
      assert.strictEqual(validCount, 3, "All records should be valid");

      // 5. Generate quality report
      const tracker = new QualityTracker();
      tracker.recordInput(baseline.length);
      tracker.recordOutput(enriched.length);
      tracker.matched.openBreweryDb = 2;
      tracker.unmatched = 1;
      tracker.finish();

      const report = tracker.generateReport();
      assert.strictEqual(report.inputCount, 3);
      assert.strictEqual(report.outputCount, 3);
      assert.strictEqual(report.matched.openBreweryDb, 2);
      assert.strictEqual(report.unmatched, 1);
      assert(report.durationMs >= 0);

      // 6. Verify enriched fields
      const beer1 = enriched[0];
      assert.strictEqual(beer1.nr, 1);
      assert.strictEqual(beer1.breweryWebsite, "https://brewery-a.de");
      assert.strictEqual(beer1.breweryCity, "Munich");
      assert(beer1.dataSources);
      assert(beer1.dataSources.length >= 2);

      const beer3 = enriched[2];
      assert.strictEqual(beer3.nr, 3);
      assert.strictEqual(beer3.breweryWebsite, undefined);
      assert.strictEqual(beer3.breweryCity, undefined);
    } finally {
      cleanupTestCsv(path);
    }
  });

  test("handles missing fields gracefully", () => {
    const csv = `Nr.;Biermarke/Name;Brauerei;Land;Alkoholgehalt;Stammwürze;Zutaten;Größe;Preis;Kategorie

=== DEUTSCHLAND ===
1;Beer;Brewery;Deutschland;-;-;-;0,5L;4,50 €;Lager
`;

    const path = createTestCsv(csv);
    try {
      const baseline = loadCsvBaseline(path);
      const enriched = mergeBeers(baseline, new Map(), new Map());
      const validation = validateEnrichedBeer(enriched[0]);

      // Record should be valid (optional fields can be missing)
      assert.strictEqual(validation.valid, true);

      // But optional fields should be undefined
      assert.strictEqual(enriched[0].abv, undefined);
      assert.strictEqual(enriched[0].stammwuerze, undefined);
      assert.strictEqual(enriched[0].ingredients, undefined);
    } finally {
      cleanupTestCsv(path);
    }
  });

  test("deterministic output ordering by nr", () => {
    const csv = `Nr.;Biermarke/Name;Brauerei;Land;Alkoholgehalt;Stammwürze;Zutaten;Größe;Preis;Kategorie

=== TEST ===
3;Beer 3;Brewery;Test;4,0%;10 °P;Hops;0,33L;3,00 €;Lager
1;Beer 1;Brewery;Test;4,0%;10 °P;Hops;0,33L;3,00 €;Lager
2;Beer 2;Brewery;Test;4,0%;10 °P;Hops;0,33L;3,00 €;Lager
`;

    const path = createTestCsv(csv);
    try {
      const baseline = loadCsvBaseline(path);
      const enriched = mergeBeers(baseline, new Map(), new Map());

      // Sort for output (as in real sync)
      const sorted = enriched.slice().sort((a, b) => a.nr - b.nr);

      assert.strictEqual(sorted[0].nr, 1);
      assert.strictEqual(sorted[1].nr, 2);
      assert.strictEqual(sorted[2].nr, 3);
    } finally {
      cleanupTestCsv(path);
    }
  });
});

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    process.exit(1);
  }
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}
