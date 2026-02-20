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
    allBeers: "A - Z",
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
  detail: {
    backToBoard: "ZURUECK ZUM HOPFEN-BOARD",
    title: "BIER - DETAILS",
    subtitle: (nr) => `#${String(nr).padStart(3, "0")}`,
    section: {
      base: "BIERINFOS",
      brewery: "BRAUEREI",
    },
    labels: {
      name: "NAME",
      brewery: "BRAUEREI",
      country: "LAND",
      category: "KATEGORIE",
      abv: "ALKOHOLGEHALT",
      stammwuerze: "STAMMWUERZE",
      ingredients: "ZUTATEN",
      size: "GROESSE",
      price: "PREIS",
      breweryId: "BRAUEREI-ID",
      breweryType: "BRAUEREI-TYP",
      breweryWebsite: "WEBSEITE",
      breweryCity: "STADT",
      breweryState: "REGION",
      breweryStateProvince: "STATE/PROVINCE",
      breweryCountryCode: "API-LAND",
      breweryPhone: "TELEFON",
      breweryPostalCode: "POSTLEITZAHL",
      breweryStreet: "STRASSE",
      breweryAddress1: "ADRESSE 1",
      breweryAddress2: "ADRESSE 2",
      breweryAddress3: "ADRESSE 3",
      breweryCoordinates: "KOORDINATEN",
    },
    missing: "—",
  },
};

export default de;
