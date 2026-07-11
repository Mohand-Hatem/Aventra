import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import RequireRole from "@/components/auth/RequireRole";
import CompanySearchSection from "@/components/feature/company-search/CompanySearchSection";
import { ROLES } from "@/constants/roles";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "candidateSearch" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function CompanySearchPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <RequireRole allowedRoles={[ROLES.company, ROLES.admin]}>
      <CompanySearchSection />
    </RequireRole>
  );
}
