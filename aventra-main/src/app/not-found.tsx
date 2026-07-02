import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { NotFoundView } from "@/components/feature/not-found/not-found-view";
import { ThemeInitScript } from "@/components/theme/theme-init-script";
import { cairo, geist, geistInter, geistMono, interHeading } from "@/lib/fonts";
import { isRtlLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";
import "./globals.css";

export default async function NotFound() {
  const locale = await getLocale();
  const messages = await getMessages();
  const isRTL = isRtlLocale(locale);

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
        isRTL ? "font-arabic" : "font-sans",
      )}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeInitScript />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NotFoundView />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
