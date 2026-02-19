/**
 * Unit tests for CSV loader
 * Tests parsing, field normalization, and error handling
 */

import { strict as assert } from "assert";
import { loadCsvBaseline } from "../load-csv.mjs";
import { join } from "path";
import { writeFileSync, unlinkSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create temporary test CSV
function createTestCsv(content) {
  const path = join(__dirname, "test-temp.csv");
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

describe("CSV Loader", () => {
  test("loads valid CSV and normalizes fields", () => {
    const csv = `Nr.;Biermarke/Name;Brauerei;Land;Alkoholgehalt;Stammwürze;Zutaten;Größe;Preis;Kategorie

=== ÄGYPTEN ===
1;Sakara Gold;Al Ahram;Ägypten;4,0%;9,5 °P;Wasser, Hopfen;0,33L;3,80 €;Pilsner
2;Stella;Al Ahram;Ägypten;4,5%;10,5 °P;Wasser, Hopfen;0,33L;3,60 €;Pilsner

=== ALBANIEN ===
3;Korça;Birra Korça;Albanien;4,7%;11,0 °P;Wasser, Hopfen;0,5L;2,60 €;Pilsner
`;

    const path = createTestCsv(csv);
    try {
      const beers = loadCsvBaseline(path);

      assert.strictEqual(beers.length, 3, "Should load 3 beers");

      // Test beer 1
      assert.strictEqual(beers[0].nr, 1);
      assert.strictEqual(beers[0].name, "Sakara Gold");
      assert.strictEqual(beers[0].brewery, "Al Ahram");
      assert.strictEqual(beers[0].country, "Ägypten");
      assert.strictEqual(beers[0].abv, "4,0%");
      assert.strictEqual(beers[0].size, "0,33L");

      // Test beer 3 gets correct country from section header
      assert.strictEqual(beers[2].country, "Albanien");
    } finally {
      cleanupTestCsv(path);
    }
  });

  test("skips invalid rows and continues", () => {
    const csv = `Nr.;Biermarke/Name;Brauerei;Land;Alkoholgehalt;Stammwürze;Zutaten;Größe;Preis;Kategorie

=== TEST ===
1;Valid Beer;Brewery;Test;4,0%;10 °P;Hops;0,33L;3,00 €;Pilsner
invalid;No;Number;Test;4,0%;10 °P;Hops;0,33L;3,00 €;Pilsner
2;Another Beer;Brewery;Test;5,0%;11 °P;Hops;0,5L;4,00 €;Lager
`;

    const path = createTestCsv(csv);
    try {
      const beers = loadCsvBaseline(path);
      assert.strictEqual(beers.length, 2, "Should skip invalid row");
      assert.strictEqual(beers[0].nr, 1);
      assert.strictEqual(beers[1].nr, 2);
    } finally {
      cleanupTestCsv(path);
    }
  });

  test("trims whitespace from fields", () => {
    const csv = `Nr.;Biermarke/Name;Brauerei;Land;Alkoholgehalt;Stammwürze;Zutaten;Größe;Preis;Kategorie

=== TEST ===
1;  Beer Name  ;  Brewery  ;TEST;4,0%;10 °P;Hops;0,33L;3,00 €;Pilsner
`;

    const path = createTestCsv(csv);
    try {
      const beers = loadCsvBaseline(path);
      assert.strictEqual(beers[0].name, "Beer Name");
      assert.strictEqual(beers[0].brewery, "Brewery");
      assert.strictEqual(beers[0].country, "TEST");
    } finally {
      cleanupTestCsv(path);
    }
  });

  test("handles missing optional fields as undefined", () => {
    const csv = `Nr.;Biermarke/Name;Brauerei;Land;Alkoholgehalt;Stammwürze;Zutaten;Größe;Preis;Kategorie

=== TEST ===
1;Beer;Brewery;Test;-;-;-;0,33L;3,00 €;Pilsner
`;

    const path = createTestCsv(csv);
    try {
      const beers = loadCsvBaseline(path);
      const beer = beers[0];
      assert.strictEqual(beer.abv, "-");
      assert.strictEqual(beer.stammwuerze, "-");
      assert.strictEqual(beer.ingredients, "-");
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
