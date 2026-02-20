/**
 * Unit tests for merge engine
 * Tests merge precedence, collision detection, and source tracking
 */

import { strict as assert } from "assert";
import {
  mergeBeers,
  validateEnrichedBeer,
} from "../merge-enrichment.mjs";

describe("Merge Engine", () => {
  test("applies merge precedence: manual > csv > api", () => {
    const baseline = [
      {
        nr: 1,
        name: "Test Beer",
        brewery: "Test Brewery",
        country: "Germany",
        category: "Pilsner",
        size: "0,5L",
        price: "4,50 €",
        abv: "4,8%",
        stammwuerze: "11 °P",
        ingredients: "Hops, Malt",
      },
    ];

    const enrichmentMap = new Map([
      [
        1,
        {
          breweryId: "brewery-123",
          breweryWebsite: "https://test-brewery.de",
          breweryCity: "Munich",
          breweryState: "Bayern",
          breweryType: "micro",
          breweryPhone: "+4989123456",
          breweryPostalCode: "80331",
          breweryStreet: "Teststrasse 1",
          breweryLatitude: 48.137,
          breweryLongitude: 11.575,
        },
      ],
    ]);

    const manualOverridesMap = new Map([
      [
        1,
        {
          breweryWebsite: "https://manual-override.de",
          breweryCity: "Berlin",
        },
      ],
    ]);

    const enriched = mergeBeers(baseline, enrichmentMap, manualOverridesMap);

    assert.strictEqual(enriched.length, 1);
    const beer = enriched[0];

    // Manual override should take precedence
    assert.strictEqual(beer.breweryWebsite, "https://manual-override.de");
    assert.strictEqual(beer.breweryCity, "Berlin");

    // CSV baseline should be preserved
    assert.strictEqual(beer.name, "Test Beer");
    assert.strictEqual(beer.abv, "4,8%");
    assert.strictEqual(beer.breweryId, "brewery-123");
    assert.strictEqual(beer.breweryType, "micro");
    assert.strictEqual(beer.breweryPhone, "+4989123456");
    assert.strictEqual(beer.breweryPostalCode, "80331");
    assert.strictEqual(beer.breweryStreet, "Teststrasse 1");
    assert.strictEqual(beer.breweryLatitude, 48.137);
    assert.strictEqual(beer.breweryLongitude, 11.575);

    // Source tracking should include all sources
    assert.strictEqual(beer.dataSources.length, 3);
    assert.strictEqual(beer.dataSources[0].source, "csv");
    assert.strictEqual(beer.dataSources[1].source, "open-brewery-db");
    assert.strictEqual(beer.dataSources[1].sourceId, "brewery-123");
    assert.strictEqual(beer.dataSources[2].source, "manual-override");
  });

  test("excludes undefined fields from optional fields", () => {
    const baseline = [
      {
        nr: 1,
        name: "Beer",
        brewery: "Brewery",
        country: "Germany",
        category: "Lager",
        size: "0,33L",
        price: "3,50 €",
        abv: "-",
        stammwuerze: "-",
        ingredients: "-",
      },
    ];

    const enriched = mergeBeers(baseline, new Map(), new Map());
    const beer = enriched[0];

    assert.strictEqual(beer.abv, undefined);
    assert.strictEqual(beer.stammwuerze, undefined);
    assert.strictEqual(beer.ingredients, undefined);
  });

  test("tracks data sources with timestamps", () => {
    const baseline = [
      {
        nr: 1,
        name: "Beer",
        brewery: "Brewery",
        country: "Germany",
        category: "Lager",
        size: "0,33L",
        price: "3,50 €",
        abv: "5%",
        stammwuerze: "12 °P",
        ingredients: "Hops",
      },
    ];

    const enriched = mergeBeers(baseline, new Map(), new Map());
    const beer = enriched[0];

    assert(beer.dataSources);
    assert(Array.isArray(beer.dataSources));
    assert(beer.dataSources[0].syncedAt);
    assert(beer.syncedAt);
  });

  test("applies API precedence from Open Food Facts over CSV for overlapping fields", () => {
    const baseline = [
      {
        nr: 1,
        name: "Beer",
        brewery: "Brewery",
        country: "Germany",
        category: "Lager",
        size: "0,33L",
        price: "3,50 €",
        abv: "-",
        stammwuerze: "-",
        ingredients: "-",
      },
    ];

    const openFoodFactsMap = new Map([
      [
        1,
        {
          abv: "5,0%",
          ingredients: "Water, Malt, Hops",
          country: "Belgium",
          size: "0,5L",
          price: "1,80 €",
          offCode: "1234567890",
          offUrl: "https://world.openfoodfacts.org/product/1234567890",
        },
      ],
    ]);

    const enriched = mergeBeers(baseline, new Map(), new Map(), {
      openFoodFactsMap,
    });
    const beer = enriched[0];

    // API precedence over CSV
    assert.strictEqual(beer.abv, "5,0%");
    assert.strictEqual(beer.ingredients, "Water, Malt, Hops");
    assert.strictEqual(beer.country, "Belgium");
    assert.strictEqual(beer.price, "1,80 €");
    assert.strictEqual(beer.size, "0,5L");

    // Source metadata should include OFF
    assert.strictEqual(beer.openFoodFactsCode, "1234567890");
    assert.strictEqual(
      beer.openFoodFactsUrl,
      "https://world.openfoodfacts.org/product/1234567890"
    );
    assert(
      beer.dataSources.some((source) => source.source === "open-food-facts")
    );
  });
});

describe("Validation", () => {
  test("validates required fields", () => {
    const validBeer = {
      nr: 1,
      name: "Beer",
      brewery: "Brewery",
      country: "Germany",
      category: "Lager",
      size: "0,33L",
      price: "3,50 €",
      dataSources: [{ source: "csv", syncedAt: new Date().toISOString() }],
    };

    const validation = validateEnrichedBeer(validBeer);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(validation.errors.length, 0);
  });

  test("rejects missing required fields", () => {
    const invalidBeer = {
      nr: 1,
      name: "Beer",
      brewery: "Brewery",
      country: "Germany",
      // missing category, size, price
      dataSources: [{ source: "csv", syncedAt: new Date().toISOString() }],
    };

    const validation = validateEnrichedBeer(invalidBeer);
    assert.strictEqual(validation.valid, false);
    assert(validation.errors.length > 0);
  });

  test("allows optional enrichment fields to be missing", () => {
    const beer = {
      nr: 1,
      name: "Beer",
      brewery: "Brewery",
      country: "Germany",
      category: "Lager",
      size: "0,33L",
      price: "3,50 €",
      dataSources: [{ source: "csv", syncedAt: new Date().toISOString() }],
      // breweryWebsite, breweryCity, etc. can be missing
    };

    const validation = validateEnrichedBeer(beer);
    assert.strictEqual(validation.valid, true);
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
