"use client";

import { useLayoutEffect } from "react";

export function LocaleHtmlAttributes({ locale }: { locale: string }) {
  const isRTL = locale === "ar";

  useLayoutEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = isRTL ? "rtl" : "ltr";
    html.classList.remove("font-arabic", "font-sans");
    html.classList.add(isRTL ? "font-arabic" : "font-sans");
  }, [locale, isRTL]);

  return null;
}
