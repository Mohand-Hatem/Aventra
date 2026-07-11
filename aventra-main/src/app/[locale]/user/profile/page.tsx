import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import RequireRole from "@/components/auth/RequireRole";
import { UserProfile } from "@/components/feature/profile/UserProfile";
import { ROLES } from "@/constants/roles";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <RequireRole allowedRoles={[ROLES.user, ROLES.admin]}>
      <UserProfile />
    </RequireRole>
  );
}
