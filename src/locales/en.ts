import type { Dictionary } from "./types";

const en: Dictionary = {
  meta: {
    title: "BIERSCOUT \u2014 BEER RULES THE WORLD",
    description:
      "Hops, Humor, and Hard Bargains. Discover beers from around the world.",
  },
  marquee: "BEER * HOPS * MALT * CHEERS *",
  hero: {
    subtitle: "EST. 2026 \u2014 FOR BEER LOVERS",
    tagline: "BEER RULES THE WORLD",
    cta_line1: "BEER ? WHERE ? WHEN ? I WANT IT.",
    cta_line2: "Hops, Humor, and Hard Bargains.",
    button: "TO THE HOPFEN-BOARD",
  },
  stats: {
    beers: "BEERS",
    countries: "COUNTRIES",
    categories: "STYLES",
    breweries: "BREWERIES",
  },
  logos: {
    title: "LOGO SYNC OUTPUT",
    domains: "DOMAINS",
    cached: "CACHED",
    downloaded: "DOWNLOADED",
    skipped: "SKIPPED",
    failed: "FAILED",
    updated: "UPDATED",
  },
  footer: {
    tagline: "Hops, Humor, and Hard Bargains.",
    copyright: "\u00A9 2026 BIERSCOUT. CHEERS.",
  },
  board: {
    title: "HOPFEN-BOARD",
    subtitle: (n, m) => `${n} beers from ${m} countries`,
  },
  search: { placeholder: "SEARCH: BEER, BREWERY, COUNTRY..." },
  filter: { allCountries: "ALL COUNTRIES", allCategories: "ALL STYLES" },
  results: {
    count: (n) => `${n} RESULT${n !== 1 ? "S" : ""}`,
  },
  empty: {
    title: "NO BEER FOUND",
    subtitle: "Try a different search term, buddy.",
  },
  card: {
    unknown: "UNKNOWN",
    label: { country: "COUNTRY", abv: "ABV", size: "SIZE", price: "PRICE" },
  },
};

export default en;
