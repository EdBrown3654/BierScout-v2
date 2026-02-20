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
  filter: {
    allCountries: "ALL COUNTRIES",
    allCategories: "ALL STYLES",
    allBeers: "A - Z",
  },
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
  detail: {
    backToBoard: "BACK TO HOPFEN-BOARD",
    title: "BEER - DETAILS",
    subtitle: (nr) => `#${String(nr).padStart(3, "0")}`,
    section: {
      base: "BEER INFO",
      brewery: "BREWERY",
    },
    labels: {
      name: "NAME",
      brewery: "BREWERY",
      country: "COUNTRY",
      category: "CATEGORY",
      abv: "ABV",
      stammwuerze: "ORIGINAL WORT",
      ingredients: "INGREDIENTS",
      size: "SIZE",
      price: "PRICE",
      breweryId: "BREWERY ID",
      breweryType: "BREWERY TYPE",
      breweryWebsite: "WEBSITE",
      breweryCity: "CITY",
      breweryState: "STATE",
      breweryStateProvince: "STATE/PROVINCE",
      breweryCountryCode: "API COUNTRY",
      breweryPhone: "PHONE",
      breweryPostalCode: "POSTAL CODE",
      breweryStreet: "STREET",
      breweryAddress1: "ADDRESS 1",
      breweryAddress2: "ADDRESS 2",
      breweryAddress3: "ADDRESS 3",
      breweryCoordinates: "COORDINATES",
    },
    missing: "—",
  },
};

export default en;
