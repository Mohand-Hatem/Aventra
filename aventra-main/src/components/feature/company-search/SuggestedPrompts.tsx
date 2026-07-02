// SuggestedPrompts.tsx
"use client";

import { IconSparkles } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface Props {
  onSelect: (value: string) => void;
}

const prompts = [
  "frontend",
  "backend",
  "flutter",
  "data",
] as const;

export default function SuggestedPrompts({
  onSelect,
}: Props) {

  const t = useTranslations("candidateSearch.assistant");

  return (
    <div className="space-y-2">

      {prompts.map((key) => (

        <button
          key={key}
          onClick={() => {
    void onSelect(t(`suggestions.${key}`));
}}
          className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-background/80 p-3 text-left transition-all hover:border-primary/30 hover:bg-muted/60 hover:shadow-sm dark:hover:border-sky/30"
        >
          <IconSparkles
            size={18}
            className="text-primary dark:text-sky"
          />

          <span className="text-sm">
            {t(`suggestions.${key}`)}
          </span>

        </button>

      ))}

    </div>
  );
}