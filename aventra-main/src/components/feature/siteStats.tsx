import Image from "next/image";
import { IconSparkles } from "@tabler/icons-react";
import { getTranslations } from "next-intl/server";

export default async function SiteStats() {
  const t = await getTranslations("siteStats");

  return (
    <section className="relative w-full overflow-hidden bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[50vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-sky/10"
      />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        <div className="text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
            <IconSparkles className="size-3" /> {t("badge")}
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl transition-shadow duration-300 hover:shadow-2xl dark:border-border/40">
          <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/40 px-4 py-2.5 backdrop-blur-sm">
            <span className="size-2.5 rounded-full bg-red-400/80" />
            <span className="size-2.5 rounded-full bg-amber-400/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
            <span className="mx-auto text-[10px] font-medium tracking-wide text-muted-foreground">
              {t("browserLabel")}
            </span>
          </div>

          <div className="relative overflow-hidden">
            <Image
              src="/panorimic light.png"
              alt={t("altLight")}
              width={3840}
              height={1080}
              className="block h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.01] dark:hidden"
              priority
            />
            <Image
              src="/panaromic dark.png"
              alt={t("altDark")}
              width={3840}
              height={1080}
              className="hidden h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.01] dark:block"
              priority
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
