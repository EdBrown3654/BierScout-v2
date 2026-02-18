"use client";

import { useState } from "react";
import { getBeerDomain, getFaviconUrl } from "@/lib/beer-domains";

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
  const [imgError, setImgError] = useState(false);

  const initials = getInitials(beerName);
  const bgColor = getCategoryColor(category);
  const isDark =
    category.includes("Schwarz") ||
    category.includes("Porter") ||
    category.includes("Stout") ||
    category.includes("Doppelbock") ||
    category.includes("Bockbier");

  // Show monogram fallback if no domain found or image fails
  if (!domain || imgError) {
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
        src={getFaviconUrl(domain)}
        alt={`${beerName} Logo`}
        width={80}
        height={80}
        className="h-20 w-20 object-contain"
        onError={() => setImgError(true)}
        loading="lazy"
      />
    </div>
  );
}
