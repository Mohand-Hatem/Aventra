"use client";

import { useEffect, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { IconLanguage } from "@tabler/icons-react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");
  const [, startTransition] = useTransition();

  useEffect(() => {
    for (const loc of routing.locales) {
      if (loc !== locale) {
        router.prefetch(pathname, { locale: loc });
      }
    }
  }, [locale, pathname, router]);

  const switchLocale = (newLocale: (typeof routing.locales)[number]) => {
    if (newLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale, scroll: false });
    });
  };

  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-0.5"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
            locale === loc
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {loc === "en" ? (
            <>
              <IconLanguage className="size-3.5" />
              {t("en")}
            </>
          ) : (
            t("ar")
          )}
        </button>
      ))}
    </div>
  );
}
