/**
 * Open Food Facts Adapter (no API key required)
 * - Fetches beer products from OFF public API
 * - Matches baseline beers by normalized name (+ optional brewery/country score)
 * - Provides optional discovery records for beers not yet in CSV baseline
 */

import { promisify } from "util";

const sleep = promisify(setTimeout);

const API_BASE = "https://world.openfoodfacts.org/cgi/search.pl";
const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 8;
const DEFAULT_DELAY_MS = 120;
const DEFAULT_DISCOVERY_LIMIT = 300;
const REQUEST_TIMEOUT_MS = 15000;

const DIACRITIC_PATTERN = /[\u0300-\u036f]/g;

function normalizeForMatching(value) {
  if (!value) return "";
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITIC_PATTERN, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeCountry(value) {
  const normalized = normalizeForMatching(value);
  if (!normalized) return "";
  if (normalized === "deutschland") return "germany";
  if (normalized === "vereinigte staaten") return "united states";
  return normalized;
}

function cleanValue(value) {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-") {
    return undefined;
  }
  return trimmed;
}

function extractPrimaryBrand(value) {
  const raw = cleanValue(value);
  if (!raw) return undefined;
  const [first] = raw.split(",");
  const candidate = cleanValue(first);
  return candidate;
}

function extractCountry(value) {
  const raw = cleanValue(value);
  if (!raw) return undefined;
  const [first] = raw.split(",");
  const country = cleanValue(first);
  return country;
}

function normalizeAbv(value) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const stringValue = String(value).trim().replace(",", ".");
  const numeric = Number.parseFloat(stringValue);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return undefined;
  }
  return `${numeric.toFixed(1).replace(".", ",")}%`;
}

function extractAbv(product) {
  return (
    normalizeAbv(product.abv) ||
    normalizeAbv(product.alcohol_by_volume) ||
    normalizeAbv(product.nutriments?.alcohol) ||
    normalizeAbv(product.nutriments?.["alcohol_100g"]) ||
    normalizeAbv(product.nutriments?.["alcohol_value"])
  );
}

function buildProductUrl(code) {
  const cleanedCode = cleanValue(code);
  if (!cleanedCode) return undefined;
  return `https://world.openfoodfacts.org/product/${encodeURIComponent(
    cleanedCode,
  )}`;
}

async function fetchBeerProductsPage(page, pageSize) {
  const params = new URLSearchParams({
    action: "process",
    json: "1",
    page: String(page),
    page_size: String(pageSize),
    tagtype_0: "categories",
    tag_contains_0: "contains",
    tag_0: "beers",
    fields:
      "code,product_name,brands,countries,quantity,ingredients_text,abv,alcohol_by_volume,nutriments",
  });

  const response = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: {
      "User-Agent": "BierScout-v2 data sync (https://github.com/EdBrown3654/BierScout-v2)",
      "Accept": "application/json",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Open Food Facts HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!payload || !Array.isArray(payload.products)) {
    return [];
  }

  return payload.products;
}

function buildCollisionKey(name, brewery, country) {
  return [
    normalizeForMatching(name),
    normalizeForMatching(brewery || "-"),
    normalizeCountry(country || ""),
  ].join("|");
}

function calculateMatchScore(beer, product) {
  const beerName = normalizeForMatching(beer.name);
  const beerBrewery = normalizeForMatching(beer.brewery);
  const beerCountry = normalizeCountry(beer.country);

  const productName = normalizeForMatching(product.product_name);
  const productBrand = normalizeForMatching(product.brands);
  const productCountry = normalizeCountry(product.countries);

  let score = 0;

  if (!beerName || !productName) {
    return 0;
  }

  if (beerName === productName) {
    score += 70;
  } else if (productName.includes(beerName) || beerName.includes(productName)) {
    score += 40;
  }

  if (beerBrewery && productBrand) {
    if (beerBrewery === productBrand) {
      score += 25;
    } else if (
      productBrand.includes(beerBrewery) ||
      beerBrewery.includes(productBrand)
    ) {
      score += 15;
    }
  }

  if (beerCountry && productCountry && beerCountry === productCountry) {
    score += 10;
  }

  return Math.min(score, 100);
}

function mapOpenFoodFactsEnrichment(product, matchScore) {
  const offCode = cleanValue(product.code);
  return {
    abv: extractAbv(product),
    ingredients: cleanValue(product.ingredients_text),
    size: cleanValue(product.quantity),
    offCode,
    offUrl: buildProductUrl(offCode),
    matchScore,
  };
}

function mapDiscoveredBeer(product, nr, syncedAt) {
  const name = cleanValue(product.product_name);
  if (!name) {
    return null;
  }

  const brewery = extractPrimaryBrand(product.brands) || "-";
  const country = extractCountry(product.countries) || "Unknown";
  const offCode = cleanValue(product.code);
  const offUrl = buildProductUrl(offCode);

  return {
    nr,
    name,
    brewery,
    country,
    category: "Beer",
    size: cleanValue(product.quantity) || "-",
    price: "-",
    abv: extractAbv(product),
    ingredients: cleanValue(product.ingredients_text),
    dataSources: [
      {
        source: "open-food-facts",
        sourceId: offCode,
        sourceUrl: offUrl,
        syncedAt,
      },
    ],
    syncedAt,
  };
}

/**
 * Enrich baseline beers with Open Food Facts and optionally discover new beers.
 *
 * @param {Array} baselineBeers
 * @param {Object} options
 * @returns {Promise<{enrichment: Map, discoveredBeers: Array, stats: Object}>}
 */
export async function enrichBeersFromOpenFoodFacts(baselineBeers, options = {}) {
  const pageSize = Number.isInteger(options.pageSize)
    ? Math.max(25, options.pageSize)
    : DEFAULT_PAGE_SIZE;
  const maxPages = Number.isInteger(options.maxPages)
    ? Math.max(1, options.maxPages)
    : DEFAULT_MAX_PAGES;
  const delayMs = Number.isInteger(options.delayMs)
    ? Math.max(0, options.delayMs)
    : DEFAULT_DELAY_MS;
  const discoveryLimit = Number.isInteger(options.discoveryLimit)
    ? Math.max(0, options.discoveryLimit)
    : DEFAULT_DISCOVERY_LIMIT;
  const includeDiscovery = options.includeDiscovery !== false;

  const products = [];
  for (let page = 1; page <= maxPages; page++) {
    const pageProducts = await fetchBeerProductsPage(page, pageSize);
    if (pageProducts.length === 0) {
      break;
    }
    products.push(...pageProducts);
    if (page < maxPages && delayMs > 0) {
      await sleep(delayMs);
    }
  }

  const enrichment = new Map();
  const matchedCodes = new Set();
  let matched = 0;

  for (const beer of baselineBeers) {
    let bestMatch = null;
    let bestScore = 0;

    for (const product of products) {
      const score = calculateMatchScore(beer, product);
      if (score > bestScore && score >= 55) {
        bestMatch = product;
        bestScore = score;
      }
    }

    if (!bestMatch) {
      continue;
    }

    const payload = mapOpenFoodFactsEnrichment(bestMatch, bestScore);
    enrichment.set(beer.nr, payload);
    matched++;

    if (payload.offCode) {
      matchedCodes.add(payload.offCode);
    }
  }

  const discoveredBeers = [];
  if (includeDiscovery && discoveryLimit > 0) {
    const syncedAt = new Date().toISOString();
    const existingKeys = new Set(
      baselineBeers.map((beer) =>
        buildCollisionKey(beer.name, beer.brewery, beer.country),
      ),
    );
    const discoveredKeys = new Set();
    const matchedNames = new Set(
      baselineBeers
        .filter((beer) => enrichment.has(beer.nr))
        .map((beer) => buildCollisionKey(beer.name, beer.brewery, beer.country)),
    );
    let nextNr = baselineBeers.reduce((maxNr, beer) => Math.max(maxNr, beer.nr), 0);

    for (const product of products) {
      if (discoveredBeers.length >= discoveryLimit) {
        break;
      }

      const offCode = cleanValue(product.code);
      if (offCode && matchedCodes.has(offCode)) {
        continue;
      }

      const mapped = mapDiscoveredBeer(product, nextNr + 1, syncedAt);
      if (!mapped) {
        continue;
      }

      const collisionKey = buildCollisionKey(
        mapped.name,
        mapped.brewery,
        mapped.country,
      );

      if (existingKeys.has(collisionKey) || discoveredKeys.has(collisionKey)) {
        continue;
      }
      if (matchedNames.has(collisionKey)) {
        continue;
      }

      nextNr++;
      mapped.nr = nextNr;
      discoveredBeers.push(mapped);
      discoveredKeys.add(collisionKey);
    }
  }

  return {
    enrichment,
    discoveredBeers,
    stats: {
      attempted: baselineBeers.length,
      matched,
      fetchedProducts: products.length,
      discovered: discoveredBeers.length,
    },
  };
}

export default enrichBeersFromOpenFoodFacts;
