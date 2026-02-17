"use client";

import { useLocale } from "@/lib/i18n-context";
import type { Locale } from "@/locales";

const locales: Locale[] = ["de", "en"];

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      className="inline-flex border-[3px] border-black font-mono text-sm font-bold uppercase"
      role="radiogroup"
      aria-label="Language"
    >
      {locales.map((l) => {
        const isActive = l === locale;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setLocale(l)}
            className={
              "px-3 py-1.5 tracking-wider transition-colors " +
              (isActive
                ? "bg-black text-[#d4a017]"
                : "bg-white text-gray-400 hover:text-black")
            }
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
