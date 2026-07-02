"use client";

import { Badge } from "@/components/ui/badge";
import { IconRobot } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export default function ChatHeader() {
  const t = useTranslations("candidateSearch.assistant");

  return (
    <div className="border-b border-border/80 bg-muted/30 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 dark:bg-sky/10">
          <IconRobot
            size={18}
            className="text-primary dark:text-sky"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">
            {t("title")}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <Badge
          variant="secondary"
          className="shrink-0 border border-primary/20 bg-primary/5 text-primary dark:border-sky/20 dark:bg-sky/10 dark:text-sky"
        >
          AI
        </Badge>
      </div>
    </div>
  );
}