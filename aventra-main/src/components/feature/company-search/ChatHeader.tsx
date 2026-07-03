"use client";

import { Badge } from "@/components/ui/badge";
import { IconRobot } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export default function ChatHeader() {
  const t = useTranslations("candidateSearch.assistant");

  return (
    <div className="border-b border-border/40 bg-gradient-to-r from-primary/5 via-card to-primary/5 px-5 py-4 dark:from-sky/5 dark:via-card dark:to-sky/5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-sky/20 dark:to-sky/10">
          <IconRobot
            size={20}
            className="text-primary dark:text-sky"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-foreground">
            {t("title")}
          </h2>
          <p className="truncate text-xs text-muted-foreground/80">
            {t("subtitle")}
          </p>
        </div>

        <Badge
          variant="secondary"
          className="shrink-0 border border-primary/30 bg-primary/10 font-semibold text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky"
        >
          AI
        </Badge>
      </div>
    </div>
  );
}