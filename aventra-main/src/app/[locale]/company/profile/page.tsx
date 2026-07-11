import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import RequireRole from "@/components/auth/RequireRole";
import { CompanyProfile } from "@/components/feature/profile/CompanyProfile";
import { ROLES } from "@/constants/roles";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "companyProfile" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <RequireRole allowedRoles={[ROLES.company, ROLES.admin]}>
      <CompanyProfile />
    </RequireRole>
  );
}
