const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

/** Western digits → Eastern Arabic-Indic numerals (٠–٩). */
export function toArabicNumerals(text: string): string {
  return text.replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)] ?? d);
}

/** Locale-aware number formatting (uses Arabic-Indic digits for `ar`). */
export function formatLocalizedNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale, options).format(
    value,
  );
}

/** Recursively convert Western digits in translation strings for Arabic locale. */
export function localizeMessageTree<T>(messages: T, locale: string): T {
  if (locale !== "ar") return messages;
  if (typeof messages === "string") return toArabicNumerals(messages) as T;
  if (Array.isArray(messages)) {
    return messages.map((item) => localizeMessageTree(item, locale)) as T;
  }
  if (messages && typeof messages === "object") {
    return Object.fromEntries(
      Object.entries(messages as Record<string, unknown>).map(([key, value]) => [
        key,
        localizeMessageTree(value, locale),
      ]),
    ) as T;
  }
  return messages;
}
