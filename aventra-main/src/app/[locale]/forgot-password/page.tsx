import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ForgotPasswordContent from "./ForgotPasswordContent";

export const dynamic = "force-static";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "forgotPassword" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ForgotPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ForgotPasswordContent />;
}
