import { loadBeers, getCountries, getCategories } from "@/lib/beers";
import HopfenBoard from "@/components/hopfen-board";

export default function Home() {
  const beers = loadBeers();
  const countries = getCountries(beers);
  const categories = getCategories(beers);

  const stats = [
    { label: "BIERE", value: beers.length },
    { label: "LAENDER", value: countries.length },
    { label: "SORTEN", value: categories.length },
    { label: "BRAUEREIEN", value: new Set(beers.map((b) => b.brewery).filter((b) => b !== "-")).size },
  ];

  return (
    <main className="min-h-screen">
      {/* ═══ TOP MARQUEE BAR ═══ */}
      <div className="overflow-hidden border-b-[3px] border-black bg-[#d4a017] py-2">
        <div className="marquee-track flex w-max gap-8 whitespace-nowrap font-mono text-xs font-bold uppercase tracking-widest text-black">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i}>
              BIER * HOPFEN * MALZ * PROST * BIER * HOPFEN * MALZ * PROST *
            </span>
          ))}
        </div>
      </div>

      {/* ═══ HERO SECTION ═══ */}
      <header className="border-b-[3px] border-black px-4 py-12 sm:px-8 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-gray-500">
            EST. 2026 — FUER BIERFREUNDE
          </p>

          <h1 className="mt-4 text-6xl font-black uppercase leading-none tracking-tighter sm:text-8xl lg:text-[10rem]">
            BIER
            <br />
            <span className="text-[#d4a017]">SCOUT</span>
          </h1>

          <div className="mt-6 border-t-[3px] border-black pt-6">
            <p className="text-2xl font-bold uppercase tracking-wide sm:text-3xl lg:text-4xl">
              BIER REGIERT DIE WELT
            </p>
          </div>

          <div className="mt-8 max-w-2xl border-[3px] border-black bg-black p-6 text-white">
            <p className="text-lg font-bold uppercase tracking-wider sm:text-xl">
              BIER ? WO ? WANN ?{" "}
              <span className="text-[#d4a017]">WILL ICH.</span>
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-gray-400">
              Hopfen, Humor und Harte Rabatte.
            </p>
          </div>

          <a
            href="#hopfen-board"
            className="mt-8 inline-block border-[3px] border-black bg-[#d4a017] px-8 py-4 text-lg font-bold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-[#d4a017]"
          >
            ZUM HOPFEN-BOARD &darr;
          </a>
        </div>
      </header>

      {/* ═══ STATS BAR ═══ */}
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

      {/* ═══ HOPFEN-BOARD ═══ */}
      <HopfenBoard beers={beers} countries={countries} categories={categories} />

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t-[3px] border-black bg-black px-4 py-8 text-white sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xl font-black uppercase tracking-wider">
              BIER<span className="text-[#d4a017]">SCOUT</span>
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-gray-500">
              Hopfen, Humor und Harte Rabatte.
            </p>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-gray-600">
            &copy; 2026 BIERSCOUT. PROST.
          </p>
        </div>
      </footer>
    </main>
  );
}
