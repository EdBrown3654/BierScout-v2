/**
 * Quality Reporter: Generate machine-readable quality metrics
 * Implements AC-9: Quality report with counts, missing fields, conflicts
 *
 * @typedef {Object} QualityReport
 * @property {string} runId
 * @property {string} startedAt - ISO timestamp
 * @property {string} finishedAt - ISO timestamp
 * @property {number} durationMs
 * @property {number} inputCount
 * @property {number} outputCount
 * @property {{openBreweryDb: number, openFoodFacts?: number}} matched
 * @property {number} discovered
 * @property {number} unmatched
 * @property {number} conflicts
 * @property {number} overridesApplied
 * @property {Object<string, number>} missingFields
 * @property {Array<{beer: number|null, message: string}>} errors
 * @property {Array<{beer: number|null, message: string}>} warnings
 */

/**
 * Track quality metrics during sync
 */
export class QualityTracker {
  constructor() {
    this.startedAt = new Date().toISOString();
    this.finishedAt = null;
    this.runId = `sync-${Date.now()}`;
    this.inputCount = 0;
    this.outputCount = 0;
    this.matched = { openBreweryDb: 0, openFoodFacts: 0 };
    this.discovered = 0;
    this.unmatched = 0;
    this.conflicts = 0;
    this.overridesApplied = 0;
    this.missingFields = {};
    this.errors = [];
    this.warnings = [];
  }

  recordInput(count) {
    this.inputCount = count;
  }

  recordOutput(count) {
    this.outputCount = count;
  }

  recordOpenBreweryDbMatch() {
    this.matched.openBreweryDb++;
  }

  recordUnmatched() {
    this.unmatched++;
  }

  recordOpenFoodFactsMatch() {
    this.matched.openFoodFacts++;
  }

  recordDiscovered(count = 1) {
    this.discovered += count;
  }

  recordConflict(message) {
    this.conflicts++;
    this.warnings.push({
      beer: null,
      message,
    });
  }

  recordOverride() {
    this.overridesApplied++;
  }

  recordMissingField(field) {
    this.missingFields[field] = (this.missingFields[field] || 0) + 1;
  }

  recordError(beerNr, message) {
    this.errors.push({
      beer: beerNr,
      message,
    });
  }

  recordWarning(beerNr, message) {
    this.warnings.push({
      beer: beerNr,
      message,
    });
  }

  finish() {
    this.finishedAt = new Date().toISOString();
  }

  /**
   * Generate final report
   */
  generateReport() {
    const startTime = new Date(this.startedAt).getTime();
    const endTime = new Date(this.finishedAt).getTime();
    const durationMs = endTime - startTime;

    return {
      runId: this.runId,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      durationMs,
      inputCount: this.inputCount,
      outputCount: this.outputCount,
      matched: {
        openBreweryDb: this.matched.openBreweryDb,
        ...(this.matched.openFoodFacts > 0 && {
          openFoodFacts: this.matched.openFoodFacts,
        }),
      },
      discovered: this.discovered,
      unmatched: this.unmatched,
      conflicts: this.conflicts,
      overridesApplied: this.overridesApplied,
      missingFields: this.missingFields,
      errors: this.errors,
      warnings: this.warnings,
    };
  }
}

/**
 * Analyze enriched beers for quality metrics
 *
 * @param {Array} enrichedBeers
 * @param {Map} openBreweryEnrichmentMap
 * @param {Map} manualOverridesMap
 * @param {Object} options
 * @param {Map} [options.openFoodFactsMap]
 * @param {Set<number>} [options.baselineNrs]
 * @param {number} [options.inputCount]
 * @param {number} [options.discoveredCount]
 * @returns {QualityTracker}
 */
export function analyzeQuality(
  enrichedBeers,
  openBreweryEnrichmentMap,
  manualOverridesMap,
  options = {}
) {
  const openFoodFactsMap = options.openFoodFactsMap || new Map();
  const baselineNrs = options.baselineNrs || null;
  const inputCount = Number.isInteger(options.inputCount)
    ? options.inputCount
    : enrichedBeers.length;
  const discoveredCount = Number.isInteger(options.discoveredCount)
    ? options.discoveredCount
    : 0;

  const tracker = new QualityTracker();

  tracker.recordInput(inputCount);
  tracker.recordOutput(enrichedBeers.length);
  if (discoveredCount > 0) {
    tracker.recordDiscovered(discoveredCount);
  }

  for (const beer of enrichedBeers) {
    const isBaselineRecord = baselineNrs ? baselineNrs.has(beer.nr) : true;

    if (isBaselineRecord) {
      // Track Open Brewery DB match coverage over baseline records
      if (openBreweryEnrichmentMap.has(beer.nr)) {
        tracker.recordOpenBreweryDbMatch();
      } else {
        tracker.recordUnmatched();
      }
    }

    if (openFoodFactsMap.has(beer.nr)) {
      tracker.recordOpenFoodFactsMatch();
    }

    if (manualOverridesMap.has(beer.nr)) {
      tracker.recordOverride();
    }

    // Check for missing optional fields
    if (!beer.abv) {
      tracker.recordMissingField("abv");
    }
    if (!beer.stammwuerze) {
      tracker.recordMissingField("stammwuerze");
    }
    if (!beer.ingredients) {
      tracker.recordMissingField("ingredients");
    }
    if (!beer.breweryWebsite) {
      tracker.recordMissingField("breweryWebsite");
    }
    if (!beer.breweryCity) {
      tracker.recordMissingField("breweryCity");
    }
  }

  return tracker;
}

export default QualityTracker;
