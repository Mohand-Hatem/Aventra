import Image from "next/image";
import { IconSparkles } from "@tabler/icons-react";

export default function SiteStats() {
  return (
    <section className="relative w-full overflow-hidden bg-background px-4 py-20 sm:px-6 lg:px-8">
      {/* subtle background glow — matches project pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[50vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl dark:bg-sky/10"
      />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        {/* section heading */}
        <div className="text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
            <IconSparkles className="size-3" /> See It in Action
          </span>
          <h2 className="font-heading mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for every step of the hiring journey
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            A single platform for job seekers and companies — intuitive,
            AI-powered, and ready to scale.
          </p>
        </div>

        {/* card */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl transition-shadow duration-300 hover:shadow-2xl dark:border-border/40">
          {/* top bar — decorative dot strip like a browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/40 px-4 py-2.5 backdrop-blur-sm">
            <span className="size-2.5 rounded-full bg-red-400/80" />
            <span className="size-2.5 rounded-full bg-amber-400/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
            <span className="mx-auto text-[10px] font-medium tracking-wide text-muted-foreground">
              aventra.app — AI-Powered ATS
            </span>
          </div>

          {/* panoramic screenshots */}
          <div className="relative overflow-hidden">
            {/* light mode */}
            <Image
              src="/panorimic light.png"
              alt="Aventra platform – light mode"
              width={3840}
              height={1080}
              className="block w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.01] dark:hidden"
              priority
            />
            {/* dark mode */}
            <Image
              src="/panaromic dark.png"
              alt="Aventra platform – dark mode"
              width={3840}
              height={1080}
              className="hidden w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.01] dark:block"
              priority
            />

            {/* subtle bottom fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-card to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
