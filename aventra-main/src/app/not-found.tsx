import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { NotFoundView } from "@/components/feature/not-found/not-found-view";
import { ThemeInitScript } from "@/components/theme/theme-init-script";
import { cairo, geist, geistInter, geistMono, interHeading } from "@/lib/fonts";
import { isRtlLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import "./globals.css";

const resolvedThemeCookieKey = "aventra-resolved-theme";

export default async function NotFound() {
  const [locale, messages, cookieStore] = await Promise.all([
    getLocale(),
    getMessages(),
    cookies(),
  ]);
  const isRTL = isRtlLocale(locale);
  const resolvedTheme = cookieStore.get(resolvedThemeCookieKey)?.value;
  const initialThemeClass =
    resolvedTheme === "dark" || resolvedTheme === "light"
      ? resolvedTheme
      : null;

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={cn(
        "h-full",
        geistInter.className,
        geistMono.variable,
        geist.variable,
        interHeading.variable,
        cairo.variable,
        initialThemeClass,
        isRTL ? "font-arabic" : "font-sans",
      )}
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NotFoundView />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
