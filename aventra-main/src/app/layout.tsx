import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

import { AppProviders } from "@/providers/app-providers";

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

export const metadata: Metadata = {
  title: "Aventra",
  description:
    "Aventra helps job seekers optimize their resumes with AI-powered ATS analysis and enables companies to discover the best candidates efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        geistInter.className,
        geistMono.variable,
        "font-sans",
        geist.variable,
        interHeading.variable
      )}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AppProviders>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}