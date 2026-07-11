import type { Metadata } from "next";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { isRtlLocale, type AppLocale } from "@/lib/locale";
import { cairo, geist, geistInter, geistMono, interHeading } from "@/lib/fonts";
import { AppProviders } from "@/providers/app-providers";
import { ThemeInitScript } from "@/components/theme/theme-init-script";
import "../globals.css";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://aventra.app";
const resolvedThemeCookieKey = "aventra-resolved-theme";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Aventra",
    default: "Aventra — AI-Powered ATS Resume Scoring & Candidate Search",
  },
  description:
    "Aventra helps job seekers optimize their resumes with AI-powered ATS analysis and enables companies to discover the best candidates efficiently.",
  keywords: [
    "ATS score",
    "resume optimization",
    "AI recruitment",
    "candidate search",
    "CV analysis",
    "job seeker",
    "hiring platform",
    "resume checker",
    "applicant tracking system",
  ],
  authors: [{ name: "Aventra" }],
  creator: "Aventra",
  publisher: "Aventra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Aventra",
    title: "Aventra — AI-Powered ATS Resume Scoring & Candidate Search",
    description:
      "Aventra helps job seekers optimize their resumes with AI-powered ATS analysis and enables companies to discover the best candidates efficiently.",
    images: [
      {
        url: "/mobile-logo.png",
        width: 1200,
        height: 630,
        alt: "Aventra — AI-Powered ATS Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aventra — AI-Powered ATS Resume Scoring & Candidate Search",
    description:
      "Aventra helps job seekers optimize their resumes with AI-powered ATS analysis and enables companies to discover the best candidates efficiently.",
    images: ["/mobile-logo.png"],
    creator: "@aventra",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/mobile-logo.png",
    apple: "/mobile-logo.png",
  },
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
  const [messages, cookieStore] = await Promise.all([
    getMessages({ locale }),
    cookies(),
  ]);
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
          <AppProviders>
            <Navbar />
            <main className="flex  flex-col">{children}</main>
            <Footer />
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
