import de from "./de";
import en from "./en";
import type { Locale, Dictionary } from "./types";

export type { Locale, Dictionary };

export const defaultLocale: Locale = "de";

export const dictionaries: Record<Locale, Dictionary> = { de, en };
