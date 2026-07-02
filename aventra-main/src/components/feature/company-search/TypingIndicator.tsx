// TypingIndicator.tsx
"use client";

import { IconRobot } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export default function TypingIndicator() {
  const t = useTranslations("candidateSearch.assistant");

  return (
    <div className="flex gap-3">

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 dark:bg-sky/10">
        <IconRobot
          size={18}
          className="text-primary dark:text-sky"
        />
      </div>

      <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">

        <div className="mb-2 text-xs text-muted-foreground">
          {t("thinking")}
        </div>

        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-primary dark:bg-sky"
              style={{
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}