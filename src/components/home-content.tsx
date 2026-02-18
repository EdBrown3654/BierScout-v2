"use client";

import { useMemo } from "react";
import { useT } from "@/lib/i18n-context";
import type { Beer } from "@/lib/beers";
import HopfenBoard from "@/components/hopfen-board";
import LanguageToggle from "@/components/language-toggle";

interface HomeContentProps {
  beers: Beer[];
  countries: string[];
  categories: string[];
  statValues: {
    beersCount: number;
    countriesCount: number;
    categoriesCount: number;
    breweriesCount: number;
  };
}

export default function HomeContent({
  beers,
  countries,
  categories,
  statValues,
}: HomeContentProps) {
  const t = useT();

  const stats = useMemo(
    () => [
      { label: t.stats.beers, value: statValues.beersCount },
      { label: t.stats.countries, value: statValues.countriesCount },
      { label: t.stats.categories, value: statValues.categoriesCount },
      { label: t.stats.breweries, value: statValues.breweriesCount },
    ],
    [t, statValues],
  );

  return (
    <main className="min-h-screen">
      {/* TOP MARQUEE BAR */}
      <div className="overflow-hidden border-b-[3px] border-black bg-[#d4a017] py-2">
        <div className="marquee-track flex w-max gap-8 whitespace-nowrap font-mono text-xs font-bold uppercase tracking-widest text-black">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i}>
              {t.marquee} {t.marquee}
            </span>
          ))}
        </div>
      </div>

      {/* HERO SECTION */}
      <header className="relative border-b-[3px] border-black">
        {/* Language toggle - top right */}
        <div className="absolute right-4 top-4 z-10 sm:right-8 sm:top-6">
          <LanguageToggle />
        </div>

        {/* Banner image */}
        <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-black overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Header/bierscout_banner.png"
            alt="BIERSCOUT Banner"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="px-4 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="border-t-[3px] border-black pt-6">
              <p className="text-2xl font-bold uppercase tracking-wide sm:text-3xl lg:text-4xl">
                {t.hero.tagline}
              </p>
            </div>

            <div className="mt-8 max-w-2xl border-[3px] border-black bg-black p-6 text-white">
            <p className="text-lg font-bold uppercase tracking-wider sm:text-xl">
              {(() => {
                const lastQ = t.hero.cta_line1.lastIndexOf("?");
                const before = t.hero.cta_line1.slice(0, lastQ + 1);
                const highlight = t.hero.cta_line1.slice(lastQ + 1).trim();
                return (
                  <>
                    {before}{" "}
                    <span className="text-[#d4a017]">{highlight}</span>
                  </>
                );
              })()}
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-gray-400">
              {t.hero.cta_line2}
            </p>
          </div>

          <a
            href="#hopfen-board"
            className="mt-8 inline-block border-[3px] border-black bg-[#d4a017] px-8 py-4 text-lg font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-[#d4a017]"
          >
            {t.hero.button} &darr;
          </a>
          </div>
        </div>
      </header>

      {/* STATS BAR */}
      <div className="grid grid-cols-2 border-b-[3px] border-black sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-r-[3px] border-black p-4 text-center last:border-r-0 sm:p-6"
          >
            <div className="text-3xl font-black sm:text-4xl lg:text-5xl">
              {stat.value}
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* HOPFEN-BOARD */}
      <HopfenBoard beers={beers} countries={countries} categories={categories} />

      {/* FOOTER */}
      <footer className="border-t-[3px] border-black bg-black px-4 py-8 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-black uppercase tracking-wider">
              BIER<span className="text-[#d4a017]">SCOUT</span>
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-gray-500">
              {t.footer.tagline}
            </p>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-gray-600">
            {t.footer.copyright}
          </p>
        </div>
      </footer>
    </main>
  );
}
