import { headers } from "next/headers";
import { loadBeers, getCountries, getCategories } from "@/lib/beers";
import HomeContent from "@/components/home-content";

const REGION_COUNTRY_OVERRIDES: Record<string, string> = {
  GB: "UK",
  US: "USA",
};

const LANGUAGE_REGION_FALLBACKS: Record<string, string> = {
  de: "DE",
  en: "US",
  fr: "FR",
  es: "ES",
  it: "IT",
  pt: "PT",
  nl: "NL",
  pl: "PL",
  cs: "CZ",
  sk: "SK",
  sl: "SI",
  da: "DK",
  sv: "SE",
  fi: "FI",
  no: "NO",
  el: "GR",
  tr: "TR",
  ru: "RU",
  hu: "HU",
  ro: "RO",
  ja: "JP",
  ko: "KR",
  zh: "CN",
  th: "TH",
  vi: "VN",
  id: "ID",
};

function mapRegionToCountry(
  regionCode: string,
  availableCountries: Set<string>,
  regionNames: Intl.DisplayNames,
): string | null {
  const normalizedRegionCode = regionCode.toUpperCase();
  const overrideCountry = REGION_COUNTRY_OVERRIDES[normalizedRegionCode];
  if (overrideCountry && availableCountries.has(overrideCountry)) {
    return overrideCountry;
  }

  const regionCountryName = regionNames.of(normalizedRegionCode);
  if (regionCountryName && availableCountries.has(regionCountryName)) {
    return regionCountryName;
  }

  return null;
}

function getInitialCountryFromAcceptLanguage(
  acceptLanguageHeader: string | null,
  countries: string[],
): string {
  if (!acceptLanguageHeader || countries.length === 0) {
    return "";
  }

  const localeCandidates = acceptLanguageHeader
    .split(",")
    .map((entry) => entry.trim().split(";")[0])
    .filter(Boolean);

  const availableCountries = new Set(countries);
  const regionNames = new Intl.DisplayNames(["de-DE"], { type: "region" });

  for (const localeTag of localeCandidates) {
    const localeParts = localeTag.replace(/_/g, "-").split("-").filter(Boolean);
    if (localeParts.length === 0) continue;

    const languageCode = localeParts[0].toLowerCase();
    const regionCode = localeParts
      .slice(1)
      .find((part) => /^[A-Za-z]{2}$/.test(part));

    if (regionCode) {
      const countryFromRegion = mapRegionToCountry(
        regionCode,
        availableCountries,
        regionNames,
      );
      if (countryFromRegion) return countryFromRegion;
    }

    const fallbackRegionCode = LANGUAGE_REGION_FALLBACKS[languageCode];
    if (fallbackRegionCode) {
      const countryFromLanguage = mapRegionToCountry(
        fallbackRegionCode,
        availableCountries,
        regionNames,
      );
      if (countryFromLanguage) return countryFromLanguage;
    }
  }

  return "";
}

export default async function Home() {
  const beers = loadBeers();
  const countries = getCountries(beers);
  const categories = getCategories(beers);
  const requestHeaders = await headers();
  const initialCountry = getInitialCountryFromAcceptLanguage(
    requestHeaders.get("accept-language"),
    countries,
  );

  const statValues = {
    beersCount: beers.length,
    countriesCount: countries.length,
    categoriesCount: categories.length,
    breweriesCount: new Set(
      beers.map((b) => b.brewery).filter((b) => b !== "-"),
    ).size,
  };

  return (
    <HomeContent
      beers={beers}
      countries={countries}
      categories={categories}
      initialCountry={initialCountry}
      statValues={statValues}
    />
  );
}
