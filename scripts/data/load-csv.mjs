/**
 * CSV Loader: Parse biermarket_bierliste.csv into normalized baseline objects
 * Normalizes field names and handles country context tracking
 *
 * @typedef {Object} BaselineBeer
 * @property {number} nr
 * @property {string} name
 * @property {string} brewery
 * @property {string} country
 * @property {string} abv
 * @property {string} stammwuerze
 * @property {string} ingredients
 * @property {string} size
 * @property {string} price
 * @property {string} category
 */

import { readFileSync } from "fs";
import { join } from "path";

/**
 * Parse CSV file and return array of baseline beer objects
 * Handles country section headers (=== COUNTRY ===) to track context
 *
 * @param csvPath - Path to CSV file
 * @returns Array of normalized baseline beer objects
 * @throws Error if file cannot be read or parsed
 */
export function loadCsvBaseline(csvPath) {
  let csv;
  try {
    csv = readFileSync(csvPath, "utf-8");
  } catch (err) {
    throw new Error(`Failed to read CSV at ${csvPath}: ${err.message}`);
  }

  const lines = csv.split("\n");
  const beers = [];
  let currentCountry = "";
  let lineNum = 0;

  for (const line of lines) {
    lineNum++;
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Country section headers: === ÄGYPTEN ===
    const countryMatch = trimmed.match(/^===\s*(.+?)\s*===$/);
    if (countryMatch) {
      currentCountry = countryMatch[1].trim();
      continue;
    }

    // Skip header row
    if (trimmed.startsWith("Nr.")) continue;

    const parts = trimmed.split(";");
    if (parts.length < 10) {
      // Skip malformed lines (not enough fields)
      continue;
    }

    const nr = parseInt(parts[0], 10);
    if (isNaN(nr)) {
      // Skip lines where nr is not a valid number
      continue;
    }

    const baseline = {
      nr,
      name: (parts[1] || "").trim(),
      brewery: (parts[2] || "-").trim(),
      country: (parts[3] && parts[3].trim() !== "-")
        ? parts[3].trim()
        : currentCountry,
      abv: (parts[4] || "-").trim(),
      stammwuerze: (parts[5] || "-").trim(),
      ingredients: (parts[6] || "-").trim(),
      size: (parts[7] || "-").trim(),
      price: (parts[8] || "-").trim(),
      category: (parts[9] || "-").trim(),
    };

    // Validation: require nr, name, country, category, size, price
    if (!baseline.name || !baseline.country || !baseline.category || !baseline.size || !baseline.price) {
      console.warn(
        `Skipping row ${lineNum} (nr=${nr}): missing required field(s)`
      );
      continue;
    }

    beers.push(baseline);
  }

  return beers;
}

/**
 * Load CSV from project root
 */
export function loadBeers() {
  const csvPath = join(process.cwd(), "biermarket_bierliste.csv");
  return loadCsvBaseline(csvPath);
}

export default loadBeers;
