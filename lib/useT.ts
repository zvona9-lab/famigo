// /lib/useT.ts
import { useMemo } from "react";
import { i18n } from "./i18n";
import { useLocale } from "./locale";

export function useT() {
  const { locale } = useLocale();

  // ✅ kad se locale promijeni -> promijeni se referenca -> rerender
  return useMemo(() => {
    return (key: string, params?: Record<string, any>) => i18n.t(key, params);
  }, [locale]);
}
