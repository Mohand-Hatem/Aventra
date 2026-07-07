// WelcomeMessage.tsx
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function WelcomeMessage() {
  const t = useTranslations("candidateSearch.assistant");

  return (
    <div className="rounded-xl border border-border/70 bg-gradient-to-br from-muted/50 to-muted/20 p-4">

      <div className="mb-3 flex items-center gap-2">

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 dark:bg-sky/10">
          <Image
            src="/logo.png"
            alt="Aventra Logo"
            width={20}
            height={20}
            className="object-contain"
          />
        </div>

        <div>
          <h3 className="font-medium">
            {t("welcomeTitle")}
          </h3>

          <p className="text-xs text-muted-foreground">
            Aventra Recruiter AI
          </p>
        </div>

      </div>

      <p className="text-sm leading-7 text-muted-foreground">
        {t("welcome")}
      </p>

    </div>
  );
}