import type { Beer } from "@/lib/beers";

const DIACRITIC_PATTERN = /[\u0300-\u036f]/g;
const NON_ALNUM_PATTERN = /[^a-z0-9]+/g;
const DUPLICATE_DASH_PATTERN = /-+/g;
const EDGE_DASH_PATTERN = /^-|-$/g;

export function slugifyBeerName(name: string): string {
  return name
    .normalize("NFD")
    .replace(DIACRITIC_PATTERN, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(NON_ALNUM_PATTERN, "-")
    .replace(DUPLICATE_DASH_PATTERN, "-")
    .replace(EDGE_DASH_PATTERN, "");
}

export function buildBeerSlug(beer: Pick<Beer, "name" | "nr">): string {
  const namePart = slugifyBeerName(beer.name);
  return namePart ? `${namePart}-${beer.nr}` : `bier-${beer.nr}`;
}

export function parseBeerNrFromSlug(slug: string): number | null {
  const match = slug.match(/(\d+)$/);
  if (!match) {
    return null;
  }

  const beerNr = Number.parseInt(match[1], 10);
  if (!Number.isInteger(beerNr) || beerNr <= 0) {
    return null;
  }

  return beerNr;
}
