"use client";

import { ScaleLoader } from "@/components/shared/scale-loader";
import { cn } from "@/lib/utils";

type PageLoadingProps = {
  title?: string;
  className?: string;
};

export default function PageLoading({ title, className }: PageLoadingProps) {
  return (
    <section
      className={cn(
        "flex h-[80vh] w-full flex-col items-center justify-center gap-6 px-4",
        className,
      )}
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Soft background pulse */}
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/10 dark:bg-sky/10" />
        <img
          src="/mobile-logo.png"
          alt="Aventra Logo"
          width={64}
          height={64}
          className="relative object-contain animate-pulse"
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <ScaleLoader size="lg" className="text-primary dark:text-sky" />
        {title && (
          <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase animate-pulse">
            {title}
          </p>
        )}
      </div>
    </section>
  );
}
