"use client";

import { useMemo, useState } from "react";
import type { Beer } from "@/lib/beers";
import { useLocale, useT } from "@/lib/i18n-context";
import BeerLogo from "@/components/beer-logo";

const LETTER_OPTIONS = Array.from({ length: 26 }, (_, index) =>
  String.fromCharCode(65 + index),
);

function getBeerInitial(beerName: string): string {
  const normalized = beerName
    .trim()
    .charAt(0)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  return /^[A-Z]$/.test(normalized) ? normalized : "";
}

export default function HopfenBoard({
  beers,
  countries,
  categories,
  initialCountry = "",
}: {
  beers: Beer[];
  countries: string[];
  categories: string[];
  initialCountry?: string;
}) {
  const t = useT();
  const { locale } = useLocale();
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedInitial, setSelectedInitial] = useState("");
  const collator = useMemo(
    () =>
      new Intl.Collator(locale === "de" ? "de-DE" : "en-US", {
        sensitivity: "base",
        numeric: true,
      }),
    [locale],
  );
  const availableInitials = useMemo(() => {
    return new Set(
      beers
        .filter((beer) => {
          const matchesCountry =
            !selectedCountry || beer.country === selectedCountry;
          const matchesCategory =
            !selectedCategory || beer.category === selectedCategory;
          return matchesCountry && matchesCategory;
        })
        .map((beer) => getBeerInitial(beer.name))
        .filter(Boolean),
    );
  }, [beers, selectedCountry, selectedCategory]);

  const filtered = useMemo(() => {
    return beers
      .filter((beer) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          beer.name.toLowerCase().includes(q) ||
          beer.brewery.toLowerCase().includes(q) ||
          beer.country.toLowerCase().includes(q) ||
          beer.category.toLowerCase().includes(q);

        const matchesCountry =
          !selectedCountry || beer.country === selectedCountry;
        const matchesCategory =
          !selectedCategory || beer.category === selectedCategory;
        const matchesInitial =
          !selectedInitial || getBeerInitial(beer.name) === selectedInitial;

        return (
          matchesSearch && matchesCountry && matchesCategory && matchesInitial
        );
      })
      .sort((a, b) => {
        const byName = collator.compare(a.name, b.name);
        if (byName !== 0) return byName;
        return a.nr - b.nr;
      });
  }, [
    beers,
    search,
    selectedCountry,
    selectedCategory,
    selectedInitial,
    collator,
  ]);

  return (
    <section id="hopfen-board">
      {/* Section header */}
      <div className="border-b-[3px] border-black bg-black px-4 py-6 text-white sm:px-8">
        <h2 className="text-3xl font-bold uppercase tracking-widest sm:text-5xl">
          {t.board.title}
        </h2>
        <p className="mt-2 font-mono text-sm uppercase tracking-wider text-[#d4a017]">
          {t.board.subtitle(beers.length, countries.length)}
        </p>
      </div>

      {/* Search & Filter bar */}
      <div className="border-b-[3px] border-black bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder={t.search.placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border-[3px] border-black bg-white px-4 py-3 font-mono text-sm uppercase tracking-wider text-black placeholder:text-gray-500 focus:border-[#d4a017] focus:outline-none"
          />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="select-chevron border-[3px] border-black bg-white px-4 py-3 font-mono text-sm uppercase tracking-wider text-black focus:border-[#d4a017] focus:outline-none"
          >
            <option value="">{t.filter.allCountries}</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select-chevron border-[3px] border-black bg-white px-4 py-3 font-mono text-sm uppercase tracking-wider text-black focus:border-[#d4a017] focus:outline-none"
          >
            <option value="">{t.filter.allCategories}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={selectedInitial}
            onChange={(e) => setSelectedInitial(e.target.value)}
            className="select-chevron border-[3px] border-black bg-white px-4 py-3 font-mono text-sm uppercase tracking-wider text-black focus:border-[#d4a017] focus:outline-none"
          >
            <option value="">{t.filter.allBeers}</option>
            {LETTER_OPTIONS.map((letter) => {
              const isAvailable = availableInitials.has(letter);
              return (
                <option key={letter} value={letter} disabled={!isAvailable}>
                  {letter}
                </option>
              );
            })}
          </select>
        </div>

        <div className="mt-3 font-mono text-xs uppercase tracking-wider text-gray-600">
          {t.results.count(filtered.length)}
        </div>
      </div>

      {/* Beer grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-3.5">
        {filtered.map((beer) => (
          <BeerCard key={beer.nr} beer={beer} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="border-t-[3px] border-black bg-white p-12 text-center">
          <p className="text-2xl font-bold uppercase">{t.empty.title}</p>
          <p className="mt-2 font-mono text-sm uppercase text-gray-500">
            {t.empty.subtitle}
          </p>
        </div>
      )}
    </section>
  );
}

function BeerCard({ beer }: { beer: Beer }) {
  const t = useT();

  return (
    <div className="group border-[3px] border-black bg-white p-4 transition-colors hover:bg-[#d4a017] hover:text-black">
      {/* Top row: Logo + Header info */}
      <div className="flex gap-3">
        {/* Beer Logo */}
        <BeerLogo beerName={beer.name} breweryName={beer.brewery} />

        {/* Name + Brewery + Nr */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-base font-bold uppercase leading-tight tracking-wide">
              <span className="block truncate">{beer.name}</span>
            </h3>
            <span className="shrink-0 text-right font-mono text-[10px] uppercase tracking-wider text-gray-500 group-hover:text-black">
              {beer.category}
            </span>
          </div>

          <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-gray-600 group-hover:text-black/70">
            {beer.brewery !== "-" ? beer.brewery : t.card.unknown}
          </p>

          <div className="mt-1 font-mono text-[9px] uppercase tracking-wider text-gray-500 group-hover:text-black/60">
            #{String(beer.nr).padStart(3, "0")}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="mt-3 grid grid-cols-4 gap-1 border-t-[2px] border-black pt-3">
        <InfoCell label={t.card.label.country} value={beer.country || "?"} />
        <InfoCell
          label={t.card.label.abv}
          value={beer.abv && beer.abv !== "-" ? beer.abv : "?"}
        />
        <InfoCell label={t.card.label.size} value={beer.size} />
        <InfoCell label={t.card.label.price} value={beer.price} />
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-widest text-gray-400 group-hover:text-black/50">
        {label}
      </div>
      <div className="font-mono text-[10px] font-bold uppercase">{value}</div>
    </div>
  );
}
