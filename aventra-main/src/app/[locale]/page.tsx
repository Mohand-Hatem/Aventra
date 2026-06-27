import { setRequestLocale } from "next-intl/server";
import Landing from "@/components/feature/Landing";
import SliderAnimation from "@/components/feature/slideranimation";
import GridDescription from "@/components/feature/gridDescription";
import WhatServe from "@/components/feature/whatServe";
import SiteStats from "@/components/feature/siteStats";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div>
      <Landing />
      <SliderAnimation />
      <GridDescription />
      <WhatServe />
      <SiteStats />
    </div>
  );
}
