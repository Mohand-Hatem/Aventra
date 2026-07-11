import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import PaymentResultContent from "./PaymentResultContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "payment" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function PaymentResultPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PaymentResultContent />;
}
