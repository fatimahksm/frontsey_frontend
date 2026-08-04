"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { DICTIONARIES, LOCALES, type Dictionary, type Locale } from "@/lib/i18n/translations";

const STORAGE_KEY = "dbwb.locale";

function isLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.value === value);
}

interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLocale(locale: Locale): void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Visitor-chosen display language for the public storefront's fixed UI
 * text - independent of the owner's content, which is never translated.
 * `defaultLocale` seeds the very first visit (from the website's
 * primaryLanguage, when it's one of the 3 supported locales); after that,
 * the visitor's own explicit choice (persisted in localStorage, a
 * device-level preference rather than a per-site one) always wins.
 */
export function LocaleProvider({ children, defaultLocale }: { children: ReactNode; defaultLocale?: string }) {
  const initial = defaultLocale && isLocale(defaultLocale) ? defaultLocale : "en";
  const [locale, setLocaleState] = useState<Locale>(initial);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored && isLocale(stored) && stored !== locale) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with localStorage, mirrors auth-context's session read pattern
      setLocaleState(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only on mount
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next);
  }

  const dir = LOCALES.find((l) => l.value === locale)?.dir ?? "ltr";
  const t = DICTIONARIES[locale];
  const value = useMemo<LocaleContextValue>(() => ({ locale, dir, t, setLocale }), [locale, dir, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
