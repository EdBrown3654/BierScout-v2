/**
 * Merge Engine: Apply deterministic precedence and track data sources
 * Priority: manual overrides > API enrichment > CSV baseline
 *
 * Implements AC-5: Explicit merge precedence
 * Implements AC-6: Source trace metadata
 * Implements AC-7: Name collision handling via name + brewery + country
 *
 * @typedef {Object} DataSource
 * @property {string} source - "csv" | "open-brewery-db" | "open-food-facts" | string
 * @property {string} [sourceId]
 * @property {string} [sourceUrl]
 * @property {string} syncedAt - ISO timestamp
 *
 * @typedef {Object} EnrichedBeer
 * @property {number} nr
 * @property {string} name
 * @property {string} brewery
 * @property {string} country
 * @property {string} category
 * @property {string} size
 * @property {string} price
 * @property {string} [abv]
 * @property {string} [stammwuerze]
 * @property {string} [ingredients]
 * @property {string} [breweryWebsite]
 * @property {string} [breweryId]
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
 * @property {string} [openFoodFactsCode]
 * @property {string} [openFoodFactsUrl]
 * @property {DataSource[]} dataSources
 * @property {string} [syncedAt]
 */

/**
 * Build collision detection key: normalized(name) + normalized(brewery) + normalized(country)
 * Used to identify duplicate beers across sources
 */
function buildCollisionKey(beer) {
  const normalize = (str) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  return [
    normalize(beer.name),
    normalize(beer.brewery || "-"),
    normalize(beer.country),
  ].join("|");
}

/**
 * Load manual overrides from file
 * Format: { overrides: [{ nr, fields: {} }] }
 *
 * @param {string} overridesPath
 * @returns {Promise<Map<number, Object>>}
 */
export async function loadManualOverrides(overridesPath) {
  try {
    const fs = await import("fs").then((m) => m.default || m);
    const content = fs.readFileSync(overridesPath, "utf-8");
    const data = JSON.parse(content);
    if (!Array.isArray(data.overrides)) {
      throw new Error("Invalid overrides format: expected { overrides: [] }");
    }
    return new Map(data.overrides.map((o) => [o.nr, o.fields]));
  } catch (err) {
    if (err.code === "ENOENT") {
      // File doesn't exist, return empty map
      return new Map();
    }
    throw err;
  }
}

/**
 * Merge baseline with enrichment using explicit precedence
 * Returns array of enriched records with source tracking
 *
 * @param {Array} baselineBeers
 * @param {Map} enrichmentMap - nr -> Open Brewery DB payload
 * @param {Map} manualOverridesMap - nr -> override fields
 * @param {Object} options
 * @param {Map} [options.openFoodFactsMap] - nr -> Open Food Facts payload
 * @returns {Array} enriched beers with source tracking
 */
export function mergeBeers(
  baselineBeers,
  enrichmentMap,
  manualOverridesMap = new Map(),
  options = {}
) {
  const openFoodFactsMap = options.openFoodFactsMap || new Map();
  const now = new Date().toISOString();
  const enrichedBeers = [];
  const collisionMap = new Map(); // Track name collisions

  for (const baseline of baselineBeers) {
    const key = buildCollisionKey(baseline);

    // Check for collision (same name + brewery + country)
    if (collisionMap.has(key)) {
      console.warn(
        `Name collision detected: "${baseline.name}" from ${baseline.brewery} (${baseline.country})`
      );
    }
    collisionMap.set(key, baseline.nr);

    // Start with baseline fields
    const enriched = {
      nr: baseline.nr,
      name: baseline.name,
      brewery: baseline.brewery,
      country: baseline.country,
      category: baseline.category,
      size: baseline.size,
      price: baseline.price,
      abv: baseline.abv !== "-" ? baseline.abv : undefined,
      stammwuerze: baseline.stammwuerze !== "-" ? baseline.stammwuerze : undefined,
      ingredients: baseline.ingredients !== "-" ? baseline.ingredients : undefined,
      dataSources: [
        {
          source: "csv",
          syncedAt: now,
        },
      ],
    };

    // Apply API enrichment (if available and not overridden)
    const apiEnrichment = enrichmentMap.get(baseline.nr);
    if (apiEnrichment) {
      if (apiEnrichment.breweryId) {
        enriched.breweryId = apiEnrichment.breweryId;
      }
      if (apiEnrichment.breweryWebsite) {
        enriched.breweryWebsite = apiEnrichment.breweryWebsite;
      }
      if (apiEnrichment.breweryCity) {
        enriched.breweryCity = apiEnrichment.breweryCity;
      }
      if (apiEnrichment.breweryState) {
        enriched.breweryState = apiEnrichment.breweryState;
      }
      if (apiEnrichment.breweryStateProvince) {
        enriched.breweryStateProvince = apiEnrichment.breweryStateProvince;
      }
      if (apiEnrichment.breweryCountryCode) {
        enriched.breweryCountryCode = apiEnrichment.breweryCountryCode;
      }
      if (apiEnrichment.breweryType) {
        enriched.breweryType = apiEnrichment.breweryType;
      }
      if (apiEnrichment.breweryPhone) {
        enriched.breweryPhone = apiEnrichment.breweryPhone;
      }
      if (apiEnrichment.breweryPostalCode) {
        enriched.breweryPostalCode = apiEnrichment.breweryPostalCode;
      }
      if (apiEnrichment.breweryStreet) {
        enriched.breweryStreet = apiEnrichment.breweryStreet;
      }
      if (apiEnrichment.breweryAddress1) {
        enriched.breweryAddress1 = apiEnrichment.breweryAddress1;
      }
      if (apiEnrichment.breweryAddress2) {
        enriched.breweryAddress2 = apiEnrichment.breweryAddress2;
      }
      if (apiEnrichment.breweryAddress3) {
        enriched.breweryAddress3 = apiEnrichment.breweryAddress3;
      }
      if (typeof apiEnrichment.breweryLatitude === "number") {
        enriched.breweryLatitude = apiEnrichment.breweryLatitude;
      }
      if (typeof apiEnrichment.breweryLongitude === "number") {
        enriched.breweryLongitude = apiEnrichment.breweryLongitude;
      }

      enriched.dataSources.push({
        source: "open-brewery-db",
        sourceId: apiEnrichment.breweryId,
        syncedAt: now,
      });
    }

    // Apply Open Food Facts enrichment (API has precedence over CSV)
    const offEnrichment = openFoodFactsMap.get(baseline.nr);
    if (offEnrichment) {
      if (offEnrichment.price) {
        enriched.price = offEnrichment.price;
      }
      if (offEnrichment.abv) {
        enriched.abv = offEnrichment.abv;
      }
      if (offEnrichment.ingredients) {
        enriched.ingredients = offEnrichment.ingredients;
      }
      if (offEnrichment.size) {
        enriched.size = offEnrichment.size;
      }
      if (offEnrichment.country) {
        enriched.country = offEnrichment.country;
      }
      if (offEnrichment.category) {
        enriched.category = offEnrichment.category;
      }
      if (offEnrichment.offCode) {
        enriched.openFoodFactsCode = offEnrichment.offCode;
      }
      if (offEnrichment.offUrl) {
        enriched.openFoodFactsUrl = offEnrichment.offUrl;
      }

      enriched.dataSources.push({
        source: "open-food-facts",
        sourceId: offEnrichment.offCode,
        sourceUrl: offEnrichment.offUrl,
        syncedAt: now,
      });
    }

    // Apply manual overrides (highest precedence)
    const manualOverride = manualOverridesMap.get(baseline.nr);
    if (manualOverride) {
      Object.assign(enriched, manualOverride);
      enriched.dataSources.push({
        source: "manual-override",
        syncedAt: now,
      });
    }

    enriched.syncedAt = now;
    enrichedBeers.push(enriched);
  }

  return enrichedBeers;
}

/**
 * Validate enriched record
 *
 * @param {Object} beer
 * @returns {{valid: boolean, errors: string[]}}
 *
 * Required fields: nr, name, country, category, size, price
 * Validation is non-blocking: returns errors but doesn't fail
 */
export function validateEnrichedBeer(beer) {
  const errors = [];

  if (typeof beer.nr !== "number" || beer.nr <= 0) {
    errors.push(`Invalid nr: ${beer.nr}`);
  }
  if (!beer.name || typeof beer.name !== "string") {
    errors.push("Missing or invalid name");
  }
  if (!beer.country || typeof beer.country !== "string") {
    errors.push("Missing or invalid country");
  }
  if (!beer.category || typeof beer.category !== "string") {
    errors.push("Missing or invalid category");
  }
  if (!beer.size || typeof beer.size !== "string") {
    errors.push("Missing or invalid size");
  }
  if (!beer.price || typeof beer.price !== "string") {
    errors.push("Missing or invalid price");
  }
  if (!Array.isArray(beer.dataSources) || beer.dataSources.length === 0) {
    errors.push("Missing dataSources");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default mergeBeers;
