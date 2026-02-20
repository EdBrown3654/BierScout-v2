import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { get } from "@vercel/blob";

/**
 * Canonical beer schema with baseline and optional enriched fields
 */
export interface Beer {
  nr: number;
  name: string;
  brewery: string;
  country: string;
  category: string;
  size: string;
  price: string;
  // Optional baseline fields
  abv?: string;
  stammwuerze?: string;
  ingredients?: string;
  // Optional enriched fields
  breweryId?: string;
  breweryWebsite?: string;
  breweryCity?: string;
  breweryState?: string;
  breweryStateProvince?: string;
  breweryCountryCode?: string;
  breweryType?: string;
  breweryPhone?: string;
  breweryPostalCode?: string;
  breweryStreet?: string;
  breweryAddress1?: string;
  breweryAddress2?: string;
  breweryAddress3?: string;
  breweryLatitude?: number;
  breweryLongitude?: number;
  // Source tracking
  dataSources?: Array<{
    source: string;
    sourceId?: string;
    sourceUrl?: string;
    syncedAt: string;
  }>;
  syncedAt?: string;
}

const BEERS_BLOB_PATH = process.env.BEERS_BLOB_PATH || "beers/latest.json";

async function loadBeersFromBlob(): Promise<Beer[] | null> {
  const hasBlobToken = Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_TOKEN,
  );
  if (!hasBlobToken) {
    return null;
  }

  try {
    const blob = await get(BEERS_BLOB_PATH, { access: "public" });
    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return null;
    }

    const payload = (await new Response(blob.stream).json()) as unknown;
    if (!Array.isArray(payload)) {
      console.warn("Blob beers payload is invalid. Falling back to local files.");
      return null;
    }

    return payload as Beer[];
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.warn(`Failed to load beers from blob: ${errorMessage}`);
    return null;
  }
}

/**
 * Load enriched beers from data/beers.enriched.json
 * Falls back to CSV parsing if enriched snapshot is missing/corrupt
 */
export async function loadBeers(): Promise<Beer[]> {
  const blobBeers = await loadBeersFromBlob();
  if (blobBeers && blobBeers.length > 0) {
    return blobBeers;
  }

  const cwd = process.cwd();
  const enrichedPath = join(cwd, "data", "beers.enriched.json");

  // Try to load enriched snapshot first
  if (existsSync(enrichedPath)) {
    try {
      const content = readFileSync(enrichedPath, "utf-8");
      const beers = JSON.parse(content);

      if (Array.isArray(beers) && beers.length > 0) {
        return beers;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";
      console.warn(`Failed to parse enriched beers: ${errorMessage}`);
      console.warn("Falling back to CSV parsing");
    }
  }

  // Fallback: parse CSV baseline
  return loadCsvBaseline(join(cwd, "biermarket_bierliste.csv"));
}

/**
 * Parse CSV baseline (fallback when enriched snapshot unavailable)
 */
function loadCsvBaseline(csvPath: string): Beer[] {
  const csv = readFileSync(csvPath, "utf-8");
  const lines = csv.split("\n");
  const beers: Beer[] = [];
  let currentCountry = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Country section headers like === ÄGYPTEN ===
    const countryMatch = trimmed.match(/^===\s*(.+?)\s*===$/);
    if (countryMatch) {
      currentCountry = countryMatch[1];
      continue;
    }

    // Skip header row
    if (trimmed.startsWith("Nr.")) continue;

    const parts = trimmed.split(";");
    if (parts.length < 10) continue;

    const nr = parseInt(parts[0], 10);
    if (isNaN(nr)) continue;

    const abv = parts[4]?.trim() || "-";
    const stammwuerze = parts[5]?.trim() || "-";
    const ingredients = parts[6]?.trim() || "-";

    beers.push({
      nr,
      name: parts[1]?.trim() || "",
      brewery: parts[2]?.trim() || "-",
      country:
        parts[3] && parts[3].trim() !== "-"
          ? parts[3].trim()
          : currentCountry,
      abv: abv !== "-" ? abv : undefined,
      stammwuerze: stammwuerze !== "-" ? stammwuerze : undefined,
      ingredients: ingredients !== "-" ? ingredients : undefined,
      size: parts[7]?.trim() || "-",
      price: parts[8]?.trim() || "-",
      category: parts[9]?.trim() || "-",
    });
  }

  return beers;
}

export function getCountries(beers: Beer[]): string[] {
  const countries = new Set(beers.map((b) => b.country).filter(Boolean));
  return Array.from(countries).sort();
}

export function getCategories(beers: Beer[]): string[] {
  const categories = new Set(beers.map((b) => b.category).filter(Boolean));
  return Array.from(categories).sort();
}
