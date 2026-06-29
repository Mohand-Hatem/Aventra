import { Geist_Mono, Inter, Geist, Cairo } from "next/font/google";

export const interHeading = Inter({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const geistInter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-cairo",
});
