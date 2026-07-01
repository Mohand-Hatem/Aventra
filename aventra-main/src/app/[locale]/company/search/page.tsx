/**
 * Folder: src/app/[locale]/company/search
 * File: page.tsx
 * Purpose: Route entry point for /company/search
 */

import CompanySearchSection from "@/components/feature/company-search/CompanySearchSection";

export const metadata = {
  title: "Candidate Search — Aventra",
  description: "Search and discover candidates using AI-powered matching.",
};

export default function CompanySearchPage() {
  return <CompanySearchSection />;
}
