import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { applyLocale, getCurrentLocale, loadStoredLocale, persistLocale, type AppLocale } from "./i18n";

type LanguageContextValue = {
  locale: AppLocale;
  ready: boolean;
  setLocale: (next: AppLocale) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(getCurrentLocale());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadStoredLocale();
      applyLocale(stored);
      setLocaleState(stored);
      setReady(true);
    })();
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      locale,
      ready,
      setLocale: async (next) => {
        applyLocale(next);
        setLocaleState(next);
        await persistLocale(next);
      },
    };
  }, [locale, ready]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}
