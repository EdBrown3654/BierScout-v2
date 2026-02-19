/**
 * Open Brewery DB Adapter
 * Searches brewery metadata by name and country
 * Returns enrichment payloads with website, location, and country info
 *
 * API: https://api.openbrewerydb.org
 * Rate limit: approx 1-2s between requests recommended
 *
 * @typedef {Object} BrewerySearchResult
 * @property {string} id
 * @property {string} name
 * @property {string} [website_url]
 * @property {string} [city]
 * @property {string} [state]
 * @property {string} [country]
 *
 * @typedef {Object} EnrichmentPayload
 * @property {string} [breweryWebsite]
 * @property {string} [breweryCity]
 * @property {string} [breweryState]
 * @property {string} [breweryCountryCode]
 * @property {number} [matchScore]
 */

import { promisify } from "util";
import { get as httpGet } from "http";
import { get as httpsGet } from "https";
import { URL } from "url";

const sleep = promisify(setTimeout);

const API_BASE = "https://api.openbrewerydb.org/v1";
const DEFAULT_DELAY_MS = 500; // milliseconds between requests
const TIMEOUT_MS = 10000; // 10 seconds per request
const MAX_RETRIES = 1; // retry failed requests once

/**
 * Normalize string for matching: lowercase, remove accents, trim
 */
function normalizeForMatching(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .trim();
}

/**
 * Calculate simple matching score between brewery names
 * Higher score = better match
 */
function calculateMatchScore(csvName, breweryName, csvCountry, breweryCountry) {
  const normCsvName = normalizeForMatching(csvName);
  const normBrewName = normalizeForMatching(breweryName);
  const normCsvCountry = normalizeForMatching(csvCountry);
  const normBrewCountry = normalizeForMatching(breweryCountry || "");

  let score = 0;

  // Exact name match: high confidence
  if (normCsvName === normBrewName) {
    score += 70;
  }
  // Partial name match
  else if (normBrewName.includes(normCsvName) || normCsvName.includes(normBrewName)) {
    score += 40;
  }
  // Name starts with same word
  else if (normCsvName.split(" ")[0] === normBrewName.split(" ")[0]) {
    score += 20;
  }

  // Country match is strong signal
  if (normCsvCountry === normBrewCountry) {
    score += 30;
  }

  return Math.min(score, 100);
}

/**
 * Make HTTP request with timeout and retry
 * @param {string} urlStr
 * @param {Object} options
 * @returns {Promise<Object>}
 */
async function httpGetWithTimeout(urlStr, options = {}) {
  const { timeout = TIMEOUT_MS, retries = MAX_RETRIES } = options;
  const url = new URL(urlStr);
  const getFunc = url.protocol === "https:" ? httpsGet : httpGet;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
          reject(new Error("Request timeout"));
        }, timeout);

        const req = getFunc(url, (res) => {
          clearTimeout(timeoutHandle);
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}`));
              return;
            }

            try {
              resolve(JSON.parse(data));
            } catch (err) {
              reject(new Error(`JSON parse error: ${err.message}`));
            }
          });
        });

        req.on("error", (err) => {
          clearTimeout(timeoutHandle);
          reject(err);
        });

        req.end();
      });
    } catch (err) {
      if (attempt < retries) {
        // Wait before retry
        await sleep(1000 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
}

/**
 * Search brewery by name and country
 *
 * @param {string} beerName
 * @param {string} breweryName
 * @param {string} country
 * @param {Object} options
 * @returns {Promise<EnrichmentPayload|null>}
 */
export async function searchBrewery(beerName, breweryName, country, options = {}) {
  const { delayMs = DEFAULT_DELAY_MS } = options;

  // Skip if no brewery name provided
  if (!breweryName || breweryName === "-") {
    return null;
  }

  try {
    // Wait for rate limit
    await sleep(delayMs);

    // Build search query: brewery name
    const url = `${API_BASE}/breweries/search?by_name=${encodeURIComponent(breweryName)}`;

    const results = await httpGetWithTimeout(url, { timeout: TIMEOUT_MS, retries: 1 });

    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    // Find best match by name and country
    let bestMatch = null;
    let bestScore = 0;

    for (const brewery of results) {
      const score = calculateMatchScore(
        beerName,
        brewery.name,
        country,
        brewery.country
      );

      if (score > bestScore && score >= 40) {
        // Minimum confidence threshold
        bestMatch = brewery;
        bestScore = score;
      }
    }

    if (!bestMatch) {
      return null;
    }

    return {
      breweryWebsite: bestMatch.website_url || undefined,
      breweryCity: bestMatch.city || undefined,
      breweryState: bestMatch.state || undefined,
      breweryCountryCode: bestMatch.country || undefined,
      matchScore: bestScore,
    };
  } catch (err) {
    // Graceful fallback on API error
    console.warn(
      `Open Brewery DB lookup failed for "${breweryName}" in ${country}: ${err.message}`
    );
    return null;
  }
}

/**
 * Batch enrich multiple beers
 *
 * @param {Array} baselineBeers
 * @param {Object} options
 * @returns {Promise<{enrichment: Map, stats: Object}>}
 */
export async function enrichBeers(baselineBeers, options = {}) {
  const { delayMs = DEFAULT_DELAY_MS, dryRun = false } = options;
  const enrichment = new Map();
  let matched = 0;
  let attempted = 0;

  for (const beer of baselineBeers) {
    attempted++;
    const payload = await searchBrewery(
      beer.name,
      beer.brewery,
      beer.country,
      { delayMs }
    );

    if (payload) {
      enrichment.set(beer.nr, payload);
      matched++;
    }
  }

  return {
    enrichment,
    stats: { attempted, matched },
  };
}

export default searchBrewery;
