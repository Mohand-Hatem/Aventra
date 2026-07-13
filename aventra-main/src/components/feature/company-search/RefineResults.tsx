// Folder: src/components/feature/company-search
// File: RefineResults.tsx
// Purpose: Separate filters panel (Min Score, Seniority Level) and chatbot quick query suggestions.

"use client";

import { useTranslations } from "next-intl";
import { FaCode, FaServer, FaDatabase, FaReact } from "react-icons/fa6";
import { RiFlutterFill } from "react-icons/ri";

interface RefineFiltersProps {
  minScore: number;
  setMinScore: (score: number) => void;
  seniorityCounts: Record<string, number>;
  selectedSeniorities: string[];
  onToggleSeniority: (seniority: string) => void;
}

export function RefineFilters({
  minScore,
  setMinScore,
  seniorityCounts,
  selectedSeniorities,
  onToggleSeniority,
}: RefineFiltersProps) {
  const t = useTranslations("candidateSearch");

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card h-full flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold text-foreground mb-6">Filters</h2>

        {/* Min Score Filter */}
        <div className="mb-6 space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold text-foreground">
            <span>{t("resultsTable.match")}</span>
            <span className="text-primary dark:text-sky tabular-nums">
              {minScore}%
            </span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary dark:accent-sky focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-sky/20"
            />
          </div>
          <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-border/50" />

        {/* Seniority Level */}
        <div className="space-y-3">
          <span className="block text-sm font-semibold text-foreground">
            Seniority Level
          </span>
          <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
            {Object.entries(seniorityCounts).map(([level, count]) => {
              const isChecked = selectedSeniorities.includes(level);
              return (
                <label
                  key={level}
                  className="flex items-center gap-3 cursor-pointer group text-sm text-foreground/80 hover:text-foreground transition-colors"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleSeniority(level)}
                      className="peer h-4 w-4 appearance-none rounded border border-border/80 bg-background checked:border-primary checked:bg-primary dark:checked:border-sky dark:checked:bg-sky focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-sky/20 transition-all cursor-pointer"
                    />
                    {isChecked && (
                      <svg
                        className="absolute h-3 w-3 pointer-events-none text-primary-foreground stroke-current stroke-3"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium text-foreground">
                    {level}{" "}
                    <span className="text-xs text-muted-foreground/80 font-normal">
                      ({count})
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface AIQuickSearchProps {
  onSelectPrompt: (prompt: string) => void;
  disabledPrompts?: boolean;
}

const promptKeys = ["frontend", "backend", "flutter", "data"] as const;

export function AIQuickSearch({
  onSelectPrompt,
  disabledPrompts = false,
}: AIQuickSearchProps) {
  const assistantT = useTranslations("candidateSearch.assistant");

  // Map keys to icons from react-icons
  const getPromptIcon = (key: (typeof promptKeys)[number]) => {
    switch (key) {
      case "frontend":
        return (
          <FaReact className="h-4.5 w-4.5 text-primary dark:text-sky animate-spin-slow" />
        );
      case "backend":
        return <FaServer className="h-4.5 w-4.5 text-primary dark:text-sky" />;
      case "flutter":
        return (
          <RiFlutterFill className="h-4.5 w-4.5 text-primary dark:text-sky" />
        );
      case "data":
        return (
          <FaDatabase className="h-4.5 w-4.5 text-primary dark:text-sky" />
        );
      default:
        return <FaCode className="h-4.5 w-4.5 text-primary dark:text-sky" />;
    }
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card h-full flex flex-col justify-between">
      <div className="space-y-3 w-full">
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
          AI Quick Searches
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {promptKeys.map((key) => {
            const promptValue = assistantT(`suggestions.${key}`);
            return (
              <button
                key={key}
                disabled={disabledPrompts}
                onClick={() => onSelectPrompt(promptValue)}
                className="flex flex-col items-start gap-2.5 rounded-xl border border-border/80 bg-card p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:hover:border-sky/40 dark:hover:bg-sky/5 text-foreground cursor-pointer group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 dark:bg-sky/10 group-hover:bg-primary/20 dark:group-hover:bg-sky/20 transition-colors shrink-0">
                  {getPromptIcon(key)}
                </div>
                <span className="text-[10px] sm:text-[11px] leading-tight font-semibold text-foreground/90 group-hover:text-primary dark:group-hover:text-sky transition-colors line-clamp-2">
                  {promptValue}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
