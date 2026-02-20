import { notFound, redirect } from "next/navigation";
import BeerDetailContent from "@/components/beer-detail-content";
import { buildBeerSlug, parseBeerNrFromSlug, slugifyBeerName } from "@/lib/beer-slug";
import { loadBeers } from "@/lib/beers";

export default async function BeerDetailPage({
  params,
}: {
  params: Promise<{ nr: string }>;
}) {
  const { nr: routeParam } = await params;
  const beerNr = parseBeerNrFromSlug(routeParam);

  const beers = await loadBeers();
  let beer =
    beerNr !== null ? beers.find((entry) => entry.nr === beerNr) : undefined;

  if (!beer) {
    const slugMatches = beers.filter(
      (entry) => slugifyBeerName(entry.name) === routeParam,
    );
    if (slugMatches.length === 1) {
      beer = slugMatches[0];
    }
  }

  if (!beer) {
    notFound();
  }

  const canonicalSlug = buildBeerSlug(beer);
  if (routeParam !== canonicalSlug) {
    redirect(`/bier/${canonicalSlug}`);
  }

  return <BeerDetailContent beer={beer} />;
}
