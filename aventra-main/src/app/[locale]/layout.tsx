import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { isRtlLocale, type AppLocale } from "@/lib/locale";
import { cairo, geist, geistInter, geistMono, interHeading } from "@/lib/fonts";
import { AppProviders } from "@/providers/app-providers";
import { ThemeInitScript } from "@/components/theme/theme-init-script";
import "../globals.css";

export const metadata: Metadata = {
  title: "Aventra",
  description: "Aventra helps job seekers optimize their resumes with AI-powered ATS analysis and enables companies to discover the best candidates efficiently.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  // ✅ validate locale
  if (!routing.locales.includes(rawLocale as AppLocale)) notFound();

  const locale = rawLocale as AppLocale;
  const isRTL = isRtlLocale(locale);

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

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
        <NextIntlClientProvider locale={locale} messages={messages}> {/* ✅ برا */}
          <AppProviders>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}