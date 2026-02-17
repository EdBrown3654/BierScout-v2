export type Locale = "de" | "en";

export interface Dictionary {
  meta: { title: string; description: string };
  marquee: string;
  hero: {
    subtitle: string;
    tagline: string;
    cta_line1: string;
    cta_line2: string;
    button: string;
  };
  stats: {
    beers: string;
    countries: string;
    categories: string;
    breweries: string;
  };
  footer: { tagline: string; copyright: string };
  board: { title: string; subtitle: (n: number, m: number) => string };
  search: { placeholder: string };
  filter: { allCountries: string; allCategories: string };
  results: { count: (n: number) => string };
  empty: { title: string; subtitle: string };
  card: {
    unknown: string;
    label: { country: string; abv: string; size: string; price: string };
  };
}
