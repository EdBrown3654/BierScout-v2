"use client";

import Link from "next/link";
import BeerLogo from "@/components/beer-logo";
import SiteFooter from "@/components/site-footer";
import type { Beer } from "@/lib/beers";
import { useT } from "@/lib/i18n-context";

type DetailFact = {
  label: string;
  value?: string | number;
  href?: string;
};

function normalizeDisplayValue(
  value: string | number | undefined,
  missing: string,
): string {
  if (value === undefined || value === null) {
    return missing;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "-") {
      return missing;
    }
    return trimmed;
  }
  return String(value);
}

function formatCoordinates(beer: Beer): string | undefined {
  if (
    typeof beer.breweryLatitude !== "number" ||
    typeof beer.breweryLongitude !== "number"
  ) {
    return undefined;
  }

  return `${beer.breweryLatitude.toFixed(5)}, ${beer.breweryLongitude.toFixed(
    5,
  )}`;
}

function DetailFactsSection({
  title,
  facts,
  missing,
}: {
  title: string;
  facts: DetailFact[];
  missing: string;
}) {
  const visibleFacts = facts.filter((fact) => {
    if (fact.value === undefined || fact.value === null) {
      return false;
    }
    if (typeof fact.value === "string") {
      const trimmed = fact.value.trim();
      return trimmed.length > 0 && trimmed !== "-";
    }
    return true;
  });

  if (visibleFacts.length === 0) {
    return null;
  }

  return (
    <section className="border-[3px] border-black bg-white">
      <div className="border-b-[3px] border-black bg-black px-4 py-3 text-white">
        <h2 className="font-bold uppercase tracking-wider">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 [&>*]:border-b-[2px] [&>*]:border-black [&>*:last-child]:border-b-0 sm:[&>*:nth-last-child(-n+2)]:border-b-0">
        {visibleFacts.map((fact) => {
          const normalized = normalizeDisplayValue(fact.value, missing);
          return (
            <div
              key={fact.label}
              className="px-4 py-3"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                {fact.label}
              </div>
              {fact.href ? (
                <a
                  href={fact.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block break-all font-mono text-sm font-bold uppercase text-black underline underline-offset-2"
                >
                  {normalized}
                </a>
              ) : (
                <div className="mt-1 break-all font-mono text-sm font-bold uppercase text-black">
                  {normalized}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function BeerDetailContent({ beer }: { beer: Beer }) {
  const t = useT();

  const baseFacts: DetailFact[] = [
    { label: t.detail.labels.name, value: beer.name },
    { label: t.detail.labels.brewery, value: beer.brewery },
    { label: t.detail.labels.country, value: beer.country },
    { label: t.detail.labels.category, value: beer.category },
    { label: t.detail.labels.abv, value: beer.abv },
    { label: t.detail.labels.stammwuerze, value: beer.stammwuerze },
    { label: t.detail.labels.ingredients, value: beer.ingredients },
    { label: t.detail.labels.size, value: beer.size },
    { label: t.detail.labels.price, value: beer.price },
  ];

  const breweryFacts: DetailFact[] = [
    { label: t.detail.labels.breweryId, value: beer.breweryId },
    { label: t.detail.labels.breweryType, value: beer.breweryType },
    {
      label: t.detail.labels.breweryWebsite,
      value: beer.breweryWebsite,
      href: beer.breweryWebsite,
    },
    { label: t.detail.labels.breweryCity, value: beer.breweryCity },
    { label: t.detail.labels.breweryState, value: beer.breweryState },
    {
      label: t.detail.labels.breweryStateProvince,
      value: beer.breweryStateProvince,
    },
    {
      label: t.detail.labels.breweryCountryCode,
      value: beer.breweryCountryCode,
    },
    { label: t.detail.labels.breweryPhone, value: beer.breweryPhone },
    {
      label: t.detail.labels.breweryPostalCode,
      value: beer.breweryPostalCode,
    },
    { label: t.detail.labels.breweryStreet, value: beer.breweryStreet },
    { label: t.detail.labels.breweryAddress1, value: beer.breweryAddress1 },
    { label: t.detail.labels.breweryAddress2, value: beer.breweryAddress2 },
    { label: t.detail.labels.breweryAddress3, value: beer.breweryAddress3 },
    {
      label: t.detail.labels.breweryCoordinates,
      value: formatCoordinates(beer),
    },
  ];

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <div className="border-b-[3px] border-black bg-[#d4a017] px-4 py-3 sm:px-8">
        <Link
          href="/#hopfen-board"
          className="inline-block border-[3px] border-black bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-[#d4a017]"
        >
          {t.detail.backToBoard}
        </Link>
      </div>

      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <section className="border-[3px] border-black bg-white">
          <div className="border-b-[3px] border-black bg-black px-4 py-4 text-white sm:px-6">
            <p className="font-mono text-xs uppercase tracking-widest text-[#d4a017]">
              {t.detail.subtitle(beer.nr)}
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase leading-tight sm:text-5xl">
              {t.detail.title}
            </h1>
          </div>
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
            <BeerLogo beerName={beer.name} breweryName={beer.brewery} />
            <div>
              <h2 className="text-2xl font-bold uppercase sm:text-4xl">
                {beer.name}
              </h2>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-gray-600">
                {beer.brewery}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 space-y-4">
          <DetailFactsSection
            title={t.detail.section.base}
            facts={baseFacts}
            missing={t.detail.missing}
          />
          <DetailFactsSection
            title={t.detail.section.brewery}
            facts={breweryFacts}
            missing={t.detail.missing}
          />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
