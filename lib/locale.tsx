// /lib/locale.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppLocale, applyLocale, getStoredLocale, persistLocale } from "./i18n";

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (l: AppLocale) => Promise<void>;
  ready: boolean;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "hr",
  setLocale: async () => {},
  ready: false,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("hr");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await getStoredLocale();
      const next = (stored ?? "hr") as AppLocale;
      applyLocale(next);
      setLocaleState(next);
      setReady(true);
    })();
  }, []);

  const setLocale = async (l: AppLocale) => {
    applyLocale(l);
    setLocaleState(l);
    await persistLocale(l);
  };

  const value = useMemo(() => ({ locale, setLocale, ready }), [locale, ready]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
