"use client";

import { ScaleLoader } from "@/components/shared/scale-loader";

export default function PageLoading() {
  return (
    <section className="flex min-h-[40vh] items-center justify-center px-4">
      <ScaleLoader size="lg" className="text-primary dark:text-sky" />
    </section>
  );
}
