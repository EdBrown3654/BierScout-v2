"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import {
  getBeerDomain,
  getFaviconUrl,
  getLocalLogoUrl,
  getLogoDevNameUrl,
  getLogoDevUrl,
  normalizeLogoName,
} from "@/lib/beer-domains";

// Category → background color for monogram fallback
const categoryColors: Record<string, string> = {
  Pilsner: "#d4a017",
  "Helles/Lager": "#e8b923",
  Weizenbier: "#f0c940",
  "Pale Ale": "#c48a1a",
  IPA: "#b07415",
  Export: "#a06810",
  "Belgische Biere": "#8b5a0e",
  "Schwarzbier/Porter/Stout": "#2a1a0a",
  Doppelbock: "#3d200c",
  Bockbier: "#4a2a10",
  Kellerbier: "#c89020",
  "Craft Beer": "#9b5de5",
  "Bio-Bier": "#4caf50",
  Alkoholfrei: "#607d8b",
  Festbier: "#d32f2f",
  Sonstiges: "#666666",
  Geschenkbox: "#d4a017",
};

function getCategoryColor(category: string): string {
  return categoryColors[category] || "#d4a017";
}

function getInitials(name: string): string {
  // Get first letter, or first two if single word
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const MIN_FAVICON_DIMENSION = 32;

export default function BeerLogo({
  beerName,
  breweryName,
  category,
}: {
  beerName: string;
  breweryName: string;
  category: string;
}) {
  const domain = getBeerDomain(beerName, breweryName);
  const logoDevToken = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN?.trim() || "";
  const [imgError, setImgError] = useState(false);
  const [srcIndex, setSrcIndex] = useState(0);

  const sourceCandidates = useMemo(() => {
    if (!domain) return [];

    const sources: string[] = [getLocalLogoUrl(domain)];

    if (logoDevToken) {
      sources.push(getLogoDevUrl(domain, logoDevToken));

      const nameCandidates = Array.from(
        new Set([breweryName, beerName].map((name) => normalizeLogoName(name)))
      ).filter((name) => name.length > 0);

      for (const name of nameCandidates) {
        sources.push(getLogoDevNameUrl(name, logoDevToken));
      }
    }

    sources.push(getFaviconUrl(domain));

    return Array.from(new Set(sources));
  }, [domain, logoDevToken, breweryName, beerName]);

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (
      img.naturalWidth < MIN_FAVICON_DIMENSION ||
      img.naturalHeight < MIN_FAVICON_DIMENSION
    ) {
      setSrcIndex((currentIndex) => {
        if (currentIndex < sourceCandidates.length - 1) {
          return currentIndex + 1;
        }
        setImgError(true);
        return currentIndex;
      });
    }
  };

  const initials = getInitials(beerName);
  const bgColor = getCategoryColor(category);
  const isDark =
    category.includes("Schwarz") ||
    category.includes("Porter") ||
    category.includes("Stout") ||
    category.includes("Doppelbock") ||
    category.includes("Bockbier");

  const currentSrc = sourceCandidates[srcIndex] ?? null;

  // Show monogram fallback if no source is found or all source candidates fail
  if (!currentSrc || imgError) {
    return (
      <div
        className="flex h-24 w-24 shrink-0 items-center justify-center border-[2px] border-black font-mono text-3xl font-black uppercase"
        style={{
          backgroundColor: bgColor,
          color: isDark ? "#d4a017" : "#000000",
        }}
        title={beerName}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center border-[2px] border-black bg-white p-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={`${beerName} Logo`}
        width={80}
        height={80}
        className="h-20 w-20 object-contain"
        onLoad={handleImageLoad}
        onError={() => {
          setSrcIndex((currentIndex) => {
            if (currentIndex < sourceCandidates.length - 1) {
              return currentIndex + 1;
            }
            setImgError(true);
            return currentIndex;
          });
        }}
        loading="lazy"
      />
    </div>
  );
}
