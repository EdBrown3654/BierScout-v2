import { readFileSync } from "fs";
import { join } from "path";

export interface Beer {
  nr: number;
  name: string;
  brewery: string;
  country: string;
  abv: string;
  stammwuerze: string;
  ingredients: string;
  size: string;
  price: string;
  category: string;
}

export function loadBeers(): Beer[] {
  const csv = readFileSync(
    join(process.cwd(), "biermarket_bierliste.csv"),
    "utf-8"
  );

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

    beers.push({
      nr,
      name: parts[1] || "",
      brewery: parts[2] || "-",
      country: parts[3] && parts[3] !== "-" ? parts[3] : currentCountry,
      abv: parts[4] || "-",
      stammwuerze: parts[5] || "-",
      ingredients: parts[6] || "-",
      size: parts[7] || "-",
      price: parts[8] || "-",
      category: parts[9] || "-",
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
