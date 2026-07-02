// WelcomeMessage.tsx
"use client";

import { IconRobot } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export default function WelcomeMessage() {
  const t = useTranslations("candidateSearch.assistant");

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">

      <div className="mb-3 flex items-center gap-2">

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 dark:bg-sky/10">
          <IconRobot
          size={18}
          className="text-primary dark:text-sky"
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