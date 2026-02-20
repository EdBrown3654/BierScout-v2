import type { Dictionary } from "./types";

const de: Dictionary = {
  meta: {
    title: "BIERSCOUT \u2014 BIER REGIERT DIE WELT",
    description:
      "Hopfen, Humor und Harte Rabatte. Entdecke Biere aus aller Welt.",
  },
  marquee: "BIER * HOPFEN * MALZ * PROST *",
  hero: {
    subtitle: "EST. 2026 \u2014 FUER BIERFREUNDE",
    tagline: "BIER REGIERT DIE WELT",
    cta_line1: "BIER ? WO ? WANN ? WILL ICH.",
    cta_line2: "Hopfen, Humor und Harte Rabatte.",
    button: "ZUM HOPFEN-BOARD",
  },
  stats: {
    beers: "BIERE",
    countries: "LAENDER",
    categories: "SORTEN",
    breweries: "BRAUEREIEN",
  },
  logos: {
    title: "LOGO-SYNC AUSGABE",
    domains: "DOMAINS",
    cached: "LOKAL",
    downloaded: "GELADEN",
    skipped: "UEBERSPRUNGEN",
    failed: "FEHLER",
    updated: "STAND",
  },
  footer: {
    tagline: "Hopfen, Humor und Harte Rabatte.",
    copyright: "\u00A9 2026 BIERSCOUT. PROST.",
  },
  board: {
    title: "HOPFEN-BOARD",
    subtitle: (n, m) => `${n} Biere aus ${m} Laendern`,
  },
  search: { placeholder: "SUCHE: BIER, BRAUEREI, LAND..." },
  filter: {
    allCountries: "ALLE LAENDER",
    allCategories: "ALLE SORTEN",
    allBeers: "ALLE BIERE",
  },
  results: {
    count: (n) => `${n} ERGEBNIS${n !== 1 ? "SE" : ""}`,
  },
  empty: {
    title: "KEIN BIER GEFUNDEN",
    subtitle: "Versuch es mit einem anderen Suchbegriff, Digga.",
  },
  card: {
    unknown: "UNBEKANNT",
    label: { country: "LAND", abv: "ALK", size: "GROESSE", price: "PREIS" },
  },
};

export default de;
