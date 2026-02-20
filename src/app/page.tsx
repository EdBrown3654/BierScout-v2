import fs from "node:fs";
import path from "node:path";
import { loadBeers, getCountries, getCategories } from "@/lib/beers";
import HomeContent from "@/components/home-content";

interface LogoSyncStats {
  provider: string;
  totalDomains: number;
  cachedLogos: number;
  downloaded: number;
  skipped: number;
  failed: number;
  generatedAt: string | null;
}

function loadLogoSyncStats(): LogoSyncStats | null {
  try {
    const manifestPath = path.join(
      process.cwd(),
      "public",
      "logos",
      "manifest.json",
    );
    const logosDir = path.join(process.cwd(), "public", "logos");

    const rawManifest = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(rawManifest) as {
      provider?: string;
      totalDiscoveredDomains?: number;
      downloaded?: number;
      skipped?: number;
      failed?: number;
      generatedAt?: string;
    };

    const cachedLogos = fs
      .readdirSync(logosDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".png")).length;

    return {
      provider: manifest.provider ?? "unknown",
      totalDomains: manifest.totalDiscoveredDomains ?? 0,
      cachedLogos,
      downloaded: manifest.downloaded ?? 0,
      skipped: manifest.skipped ?? 0,
      failed: manifest.failed ?? 0,
      generatedAt: manifest.generatedAt ?? null,
    };
  } catch {
    return null;
  }
}

export default function Home() {
  const beers = loadBeers();
  const countries = getCountries(beers);
  const categories = getCategories(beers);
  const logoSyncStats = loadLogoSyncStats();

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
      logoSyncStats={logoSyncStats}
    />
  );
}
