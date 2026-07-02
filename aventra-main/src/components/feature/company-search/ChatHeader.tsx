"use client";

import { Badge } from "@/components/ui/badge";
import { IconRobot } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

export default function ChatHeader() {
  const t = useTranslations("candidateSearch.assistant");

  return (
    <div className="border-b border-border px-5 py-4">
      <div className="flex items-center gap-2">
        <IconRobot
  size={18}
  className="text-primary dark:text-sky"
/>
        <h2 className="text-sm font-semibold">
          {t("title")}
        </h2>

        <Badge
          variant="secondary"
          className="ml-auto"
        >
          AI
        </Badge>
      </div>

      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
        {t("subtitle")}
      </p>
    </div>
  );
}