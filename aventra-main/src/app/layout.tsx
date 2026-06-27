import { Geist_Mono, Inter, Geist, Cairo } from "next/font/google";
import { cookies } from "next/headers";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/providers/app-providers";
import { routing } from "@/i18n/routing";
import "./globals.css";

const interHeading = Inter({
  subsets: ["latin"],
  variable: "--font-heading",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistInter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-cairo",
});

function resolveLocale(raw?: string) {
  return routing.locales.includes(raw as (typeof routing.locales)[number])
    ? (raw as (typeof routing.locales)[number])
    : routing.defaultLocale;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("NEXT_LOCALE")?.value);
  const isRTL = locale === "ar";

  return (
    <html
      suppressHydrationWarning
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
