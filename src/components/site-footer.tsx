"use client";

import { useT } from "@/lib/i18n-context";

export default function SiteFooter() {
  const t = useT();

  return (
    <footer className="mt-auto border-t-[3px] border-black bg-black px-4 py-8 text-white sm:px-8">
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
  );
}
