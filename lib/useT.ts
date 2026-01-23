// /lib/useT.ts
import { useMemo } from "react";
import { i18n } from "./i18n";
import { useLocale } from "./locale";

/**
 * Famigo translation helper.
 *
 * Usage:
 *   const t = useT();
 *   t("common.save", "Save");
 *   t("tasks.createdBy", { name: "Alex" });
 *   t("tasks.createdBy", "Created by {{name}}", { name: "Alex" });
 *
 * - If a translation is missing for the active locale, i18n.ts can fallback to EN (enableFallback).
 * - If the key is missing everywhere, passing a defaultValue avoids "[missing ...]" UI.
 */
export function useT() {
  const { locale } = useLocale();

  // ✅ when locale changes -> rerender + update i18n.locale via LocaleProvider
  return useMemo(() => {
    return (
      key: string,
      defaultValueOrOptions?: string | Record<string, any>,
      maybeOptions?: Record<string, any>
    ) => {
      // t(key, "Default")
      if (typeof defaultValueOrOptions === "string") {
        return i18n.t(key, { ...(maybeOptions ?? {}), defaultValue: defaultValueOrOptions });
      }

      // t(key, { ...options })
      if (defaultValueOrOptions && typeof defaultValueOrOptions === "object") {
        return i18n.t(key, defaultValueOrOptions);
      }

      // t(key)
      return i18n.t(key);
    };
  }, [locale]);
}
