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
 * @property {string} [breweryId]
 * @property {string} [breweryWebsite]
 * @property {string} [breweryCity]
 * @property {string} [breweryState]
 * @property {string} [breweryStateProvince]
 * @property {string} [breweryCountryCode]
 * @property {string} [breweryType]
 * @property {string} [breweryPhone]
 * @property {string} [breweryPostalCode]
 * @property {string} [breweryStreet]
 * @property {string} [breweryAddress1]
 * @property {string} [breweryAddress2]
 * @property {string} [breweryAddress3]
 * @property {number} [breweryLatitude]
 * @property {number} [breweryLongitude]
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

const COUNTRY_NAME_ALIASES = {
  agypten: "egypt",
  albanien: "albania",
  argentinien: "argentina",
  australien: "australia",
  belgien: "belgium",
  brasilien: "brazil",
  bulgarien: "bulgaria",
  chile: "chile",
  china: "china",
  danemark: "denmark",
  deutschland: "germany",
  finnland: "finland",
  frankreich: "france",
  griechenland: "greece",
  indien: "india",
  indonesien: "indonesia",
  irland: "ireland",
  island: "iceland",
  israel: "israel",
  italien: "italy",
  japan: "japan",
  kanada: "canada",
  kuba: "cuba",
  luxemburg: "luxembourg",
  mexiko: "mexico",
  niederlande: "netherlands",
  norwegen: "norway",
  osterreich: "austria",
  paraguay: "paraguay",
  peru: "peru",
  polen: "poland",
  portugal: "portugal",
  rumanien: "romania",
  russland: "russia",
  schweden: "sweden",
  schweiz: "switzerland",
  singapur: "singapore",
  slowakei: "slovakia",
  slowenien: "slovenia",
  spanien: "spain",
  sudafrika: "south africa",
  tschechien: "czech republic",
  turkei: "turkey",
  uk: "united kingdom",
  ungarn: "hungary",
  usa: "united states",
  "vereinigte staaten": "united states",
};

const BREWERY_QUERY_ALIASES = {
  "heineken slovensko": "heineken",
  "heineken italia": "heineken",
  "heineken uk": "heineken",
  "heineken romania": "heineken",
  "heineken russia": "heineken",
  "heineken espana": "heineken",
  "heineken ceska republika": "heineken",
  "heineken hungaria": "heineken",
  "heineken png": "heineken",
  "guinness brewery": "guinness",
};

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

function normalizeCountryForMatching(country) {
  const normalized = normalizeForMatching(country);
  return COUNTRY_NAME_ALIASES[normalized] || normalized;
}

function simplifyBreweryNameForQuery(name) {
  if (!name) return "";

  const simplified = name
    .replace(/\([^)]*\)/g, " ")
    .replace(/&/g, " and ")
    .replace(
      /\b(brauerei|brewery|breweries|brewing|company|co\.?|group|industries|industry|s\.?a\.?l?\.?|ltd\.?|inc\.?)\b/gi,
      " "
    )
    .replace(/\b(italia|uk|russia|romania|hungaria|españa|espana|slovensko|png|ceska|republika)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return simplified;
}

function buildQueryCandidates(breweryName) {
  const candidates = [];
  const pushCandidate = (value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) return;
    if (!candidates.includes(trimmed)) {
      candidates.push(trimmed);
    }
  };

  pushCandidate(breweryName);

  const normalizedName = normalizeForMatching(breweryName);
  const aliasCandidate = BREWERY_QUERY_ALIASES[normalizedName];
  if (aliasCandidate) {
    pushCandidate(aliasCandidate);
  }

  const simplifiedCandidate = simplifyBreweryNameForQuery(breweryName);
  if (
    simplifiedCandidate &&
    normalizeForMatching(simplifiedCandidate) !== normalizedName
  ) {
    pushCandidate(simplifiedCandidate);
  }

  return candidates;
}

function dedupeBreweries(breweries) {
  const unique = new Map();

  for (const brewery of breweries) {
    const key =
      brewery.id ||
      `${normalizeForMatching(brewery.name)}|${normalizeCountryForMatching(brewery.country)}`;
    if (!unique.has(key)) {
      unique.set(key, brewery);
    }
  }

  return Array.from(unique.values());
}

/**
 * Calculate simple matching score between brewery names
 * Higher score = better match
 */
function calculateMatchScore(csvName, breweryName, csvCountry, breweryCountry) {
  const normCsvName = normalizeForMatching(csvName);
  const normBrewName = normalizeForMatching(breweryName);
  const normCsvCountry = normalizeCountryForMatching(csvCountry);
  const normBrewCountry = normalizeCountryForMatching(breweryCountry || "");

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

function toOptionalNumber(value) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
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

async function queryByName(query) {
  const byNameUrl = `${API_BASE}/breweries?by_name=${encodeURIComponent(
    query
  )}&per_page=50`;
  const result = await httpGetWithTimeout(byNameUrl, {
    timeout: TIMEOUT_MS,
    retries: 1,
  });
  return Array.isArray(result) ? result : [];
}

async function queryBySearch(query) {
  const searchUrl = `${API_BASE}/breweries/search?query=${encodeURIComponent(
    query
  )}&per_page=50`;
  const result = await httpGetWithTimeout(searchUrl, {
    timeout: TIMEOUT_MS,
    retries: 1,
  });
  return Array.isArray(result) ? result : [];
}

async function fetchBreweryCandidates(queryCandidates) {
  const collected = [];

  for (const queryCandidate of queryCandidates) {
    const byNameResults = await queryByName(queryCandidate);
    if (byNameResults.length > 0) {
      collected.push(...byNameResults);
    }
  }

  if (collected.length === 0) {
    for (const queryCandidate of queryCandidates) {
      const searchResults = await queryBySearch(queryCandidate);
      if (searchResults.length > 0) {
        collected.push(...searchResults);
      }
    }
  }

  return dedupeBreweries(collected);
}

/**
 * Search brewery by name and country
 *
 * @param {string} breweryName
 * @param {string} country
 * @param {Object} options
 * @returns {Promise<EnrichmentPayload|null>}
 */
export async function searchBrewery(breweryName, country, options = {}) {
  const { delayMs = DEFAULT_DELAY_MS } = options;

  // Skip if no brewery name provided
  if (!breweryName || breweryName === "-") {
    return null;
  }

  try {
    // Wait for rate limit
    await sleep(delayMs);

    const queryCandidates = buildQueryCandidates(breweryName);
    const results = await fetchBreweryCandidates(queryCandidates);

    if (!Array.isArray(results) || results.length === 0) {
      return null;
    }

    // Find best match by name and country
    let bestMatch = null;
    let bestScore = 0;

    for (const brewery of results) {
      const score = calculateMatchScore(
        breweryName,
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
      breweryId: bestMatch.id || undefined,
      breweryWebsite: bestMatch.website_url || undefined,
      breweryCity: bestMatch.city || undefined,
      breweryState: bestMatch.state || bestMatch.state_province || undefined,
      breweryStateProvince: bestMatch.state_province || undefined,
      breweryCountryCode: bestMatch.country || undefined,
      breweryType: bestMatch.brewery_type || undefined,
      breweryPhone: bestMatch.phone || undefined,
      breweryPostalCode: bestMatch.postal_code || undefined,
      breweryStreet: bestMatch.street || bestMatch.address_1 || undefined,
      breweryAddress1: bestMatch.address_1 || undefined,
      breweryAddress2: bestMatch.address_2 || undefined,
      breweryAddress3: bestMatch.address_3 || undefined,
      breweryLatitude: toOptionalNumber(bestMatch.latitude),
      breweryLongitude: toOptionalNumber(bestMatch.longitude),
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
  const { delayMs = DEFAULT_DELAY_MS } = options;
  const enrichment = new Map();
  const lookupCache = new Map();
  let matched = 0;
  let attempted = 0;

  for (const beer of baselineBeers) {
    attempted++;
    const cacheKey = [
      normalizeForMatching(beer.brewery),
      normalizeCountryForMatching(beer.country),
    ].join("|");

    let payload;
    if (lookupCache.has(cacheKey)) {
      payload = lookupCache.get(cacheKey);
    } else {
      payload = await searchBrewery(beer.brewery, beer.country, { delayMs });
      lookupCache.set(cacheKey, payload);
    }

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
