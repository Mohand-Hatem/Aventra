import Landing from "@/components/feature/Landing";
import SliderAnimation from "@/components/feature/slideranimation";
import GridDescription from "@/components/feature/gridDescription";
import WhatServe from "@/components/feature/whatServe";
import SiteStats from "@/components/feature/siteStats";

export default function HomePage() {
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
