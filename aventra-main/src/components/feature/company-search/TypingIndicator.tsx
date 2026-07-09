"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function TypingIndicator() {
  const t = useTranslations("candidateSearch.assistant");

  return (
    <div className="flex items-end gap-3">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/8 dark:from-sky/20 dark:to-sky/8">
        <Image
          src="/mobile-logo.png"
          alt="Aventra AI"
          width={18}
          height={18}
          className="object-contain"
        />
      </div>

      {/* Bubble */}
      <div className="rounded-2xl rounded-bl-md border border-border/40 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-sm">
        <p className="mb-2 text-[10px] font-medium text-muted-foreground">
          {t("thinking")}
        </p>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-linear-to-b from-primary to-primary/70 dark:from-sky dark:to-sky/70"
              style={{
                animationDelay: `${i * 0.18}s`,
                animationDuration: "0.9s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
