"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import {
  getBeerDomain,
  getFaviconUrl,
  getLocalLogoUrl,
} from "@/lib/beer-domains";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const takeLeadingChar = (value: string) =>
    value.replace(/^[^A-Za-z0-9ÄÖÜäöüß]+/, "").charAt(0);

  if (words.length >= 2) {
    const first = takeLeadingChar(words[0]);
    const second = takeLeadingChar(words[1]);
    const pair = `${first}${second}`.toUpperCase();
    if (pair) return pair;
  }

  const compact = name.replace(/[^A-Za-z0-9ÄÖÜäöüß]/g, "").slice(0, 2);
  return (compact || "?").toUpperCase();
}

const MIN_FAVICON_DIMENSION = 32;
const DEFAULT_LOGO_WRAPPER_BG = "#1f2937";

export default function BeerLogo({
  beerName,
  breweryName,
}: {
  beerName: string;
  breweryName: string;
}) {
  const domain = getBeerDomain(beerName, breweryName);
  const [imgError, setImgError] = useState(false);
  const [srcIndex, setSrcIndex] = useState(0);

  const sourceCandidates = useMemo(() => {
    if (!domain) return [];

    const sources: string[] = [getLocalLogoUrl(domain)];

    sources.push(getFaviconUrl(domain));

    return Array.from(new Set(sources));
  }, [domain]);

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

  const currentSrc = sourceCandidates[srcIndex] ?? null;

  // Show monogram fallback if no source is found or all source candidates fail
  if (!currentSrc || imgError) {
    return (
      <div
        className="flex h-24 w-24 shrink-0 items-center justify-center border-[5px] border-black font-mono text-3xl font-black uppercase text-black"
        title={beerName}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className="flex h-24 w-24 shrink-0 items-center justify-center border-[5px] border-black"
      style={{ backgroundColor: DEFAULT_LOGO_WRAPPER_BG }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={`${beerName} Logo`}
        width={96}
        height={96}
        className="h-full w-full object-contain"
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
