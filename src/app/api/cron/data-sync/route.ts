import { put } from "@vercel/blob";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { loadCsvBaseline } from "../../../../../scripts/data/load-csv.mjs";
import { mergeBeers, validateEnrichedBeer } from "../../../../../scripts/data/merge-enrichment.mjs";
import { analyzeQuality } from "../../../../../scripts/data/report-quality.mjs";
import { enrichBeers } from "../../../../../scripts/data/sources/open-brewery-db.mjs";

export const runtime = "nodejs";
export const maxDuration = 300;

const CSV_PATH = join(process.cwd(), "biermarket_bierliste.csv");
const OVERRIDES_PATH = join(process.cwd(), "data", "manual-overrides.json");
const DEFAULT_REQUEST_DELAY_MS = 150;

const BEERS_BLOB_PATH = process.env.BEERS_BLOB_PATH || "beers/latest.json";
const REPORT_BLOB_PATH =
  process.env.SYNC_REPORT_BLOB_PATH || "sync-report/latest.json";

function isCronAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET is missing. Refusing scheduled sync request.");
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

function parseRequestDelayMs(): number {
  const rawValue = process.env.DATA_SYNC_REQUEST_DELAY_MS;
  if (!rawValue) {
    return DEFAULT_REQUEST_DELAY_MS;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return DEFAULT_REQUEST_DELAY_MS;
  }

  return parsed;
}

function loadManualOverridesSync(pathToOverrides: string): Map<number, Record<string, unknown>> {
  try {
    if (!existsSync(pathToOverrides)) {
      return new Map();
    }

    const content = readFileSync(pathToOverrides, "utf-8");
    const parsed = JSON.parse(content) as {
      overrides?: Array<{ nr: number; fields?: Record<string, unknown> }>;
    };

    if (!Array.isArray(parsed.overrides)) {
      console.warn("Invalid manual overrides format: expected { overrides: [] }");
      return new Map();
    }

    return new Map(
      parsed.overrides.map((entry) => [entry.nr, entry.fields ?? {}]),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`Failed to load manual overrides: ${message}`);
    return new Map();
  }
}

function sortBeersForOutput<T extends { nr: number }>(beers: T[]): T[] {
  return beers.slice().sort((a, b) => a.nr - b.nr);
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requestDelayMs = parseRequestDelayMs();

    const baselineBeers = loadCsvBaseline(CSV_PATH);
    const manualOverridesMap = loadManualOverridesSync(OVERRIDES_PATH);

    const enrichmentMap = new Map<number, Record<string, unknown>>();
    let enrichStats = { attempted: 0, matched: 0 };

    try {
      const result = await enrichBeers(baselineBeers, {
        delayMs: requestDelayMs,
      });

      for (const [nr, payload] of result.enrichment as Map<number, Record<string, unknown>>) {
        enrichmentMap.set(nr, payload);
      }
      enrichStats = result.stats as { attempted: number; matched: number };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.warn(`Open Brewery DB enrichment failed. Continuing with baseline: ${message}`);
    }

    const mergedBeers = mergeBeers(
      baselineBeers,
      enrichmentMap,
      manualOverridesMap,
    ) as Array<Record<string, unknown> & { nr: number }>;

    const sortedBeers = sortBeersForOutput(mergedBeers);
    const qualityTracker = analyzeQuality(
      sortedBeers,
      enrichmentMap,
      manualOverridesMap,
    );

    let validationErrors = 0;
    for (const beer of sortedBeers) {
      const validation = validateEnrichedBeer(beer);
      if (!validation.valid) {
        validationErrors++;
        for (const errorMessage of validation.errors) {
          qualityTracker.recordError(beer.nr, errorMessage);
        }
      }
    }

    qualityTracker.finish();
    const report = qualityTracker.generateReport();

    const [beersBlob, reportBlob] = await Promise.all([
      put(BEERS_BLOB_PATH, JSON.stringify(sortedBeers), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json; charset=utf-8",
      }),
      put(REPORT_BLOB_PATH, JSON.stringify(report), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json; charset=utf-8",
      }),
    ]);

    return NextResponse.json({
      ok: true,
      inputCount: baselineBeers.length,
      outputCount: sortedBeers.length,
      attempted: enrichStats.attempted,
      matched: enrichStats.matched,
      unmatched: report.unmatched,
      overridesApplied: report.overridesApplied,
      validationErrors,
      requestDelayMs,
      blobs: {
        beers: beersBlob.url,
        report: reportBlob.url,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Vercel cron sync failed:", message);

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
