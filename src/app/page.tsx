import { loadBeers, getCountries, getCategories } from "@/lib/beers";
import HomeContent from "@/components/home-content";

export default function Home() {
  const beers = loadBeers();
  const countries = getCountries(beers);
  const categories = getCategories(beers);

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
      statValues={statValues}
    />
  );
}
