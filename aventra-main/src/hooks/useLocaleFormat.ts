"use client";

import { useLocale } from "next-intl";
import { formatLocalizedNumber, toArabicNumerals } from "@/lib/locale-format";

export function useLocaleFormat() {
  const locale = useLocale();
  const isArabic = locale === "ar";

  return {
    locale,
    isArabic,
    /** Format a number with locale-appropriate digits and grouping. */
    n: (value: number, options?: Intl.NumberFormatOptions) =>
      formatLocalizedNumber(value, locale, options),
    /** Convert Western digits in any string for Arabic mode. */
    digits: (value: string | number) =>
      isArabic ? toArabicNumerals(String(value)) : String(value),
  };
}
