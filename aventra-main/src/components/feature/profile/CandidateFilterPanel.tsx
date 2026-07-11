"use client";

import { useState } from "react";
import { IconAdjustments, IconFilterOff } from "@tabler/icons-react";
import type { useTranslations } from "next-intl";
import type { CandidateFilterCriteria } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface CandidateFilterPanelProps {
  onApply: (criteria: CandidateFilterCriteria) => void;
  onClear: () => void;
  isPending: boolean;
  t: ReturnType<typeof useTranslations<"companyProfile">>;
}

export function CandidateFilterPanel({
  onApply,
  onClear,
  isPending,
  t,
}: CandidateFilterPanelProps) {
  const [minAts, setMinAts] = useState(0);
  const [hasSkills, setHasSkills] = useState(false);
  const [hasCertifications, setHasCertifications] = useState(false);
  const [hasExperience, setHasExperience] = useState(false);
  const [hasProjects, setHasProjects] = useState(false);

  const hasActiveFilters =
    minAts > 0 ||
    hasSkills ||
    hasCertifications ||
    hasExperience ||
    hasProjects;

  function handleApply() {
    onApply({ minAts, hasSkills, hasCertifications, hasExperience, hasProjects });
  }

  function handleClear() {
    setMinAts(0);
    setHasSkills(false);
    setHasCertifications(false);
    setHasExperience(false);
    setHasProjects(false);
    onClear();
  }

  const checkboxes: Array<{
    id: string;
    label: string;
    checked: boolean;
    onCheckedChange: () => void;
  }> = [
    {
      id: "filter-skills",
      label: t("filterSkills"),
      checked: hasSkills,
      onCheckedChange: () => setHasSkills((v) => !v),
    },
    {
      id: "filter-certifications",
      label: t("filterCertifications"),
      checked: hasCertifications,
      onCheckedChange: () => setHasCertifications((v) => !v),
    },
    {
      id: "filter-experience",
      label: t("filterExperience"),
      checked: hasExperience,
      onCheckedChange: () => setHasExperience((v) => !v),
    },
    {
      id: "filter-projects",
      label: t("filterProjects"),
      checked: hasProjects,
      onCheckedChange: () => setHasProjects((v) => !v),
    },
  ];

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{t("atsRange")}</span>
          <span className="text-primary dark:text-sky tabular-nums">
            {minAts}%
          </span>
        </div>
        <Progress value={minAts} className="h-2.5 bg-muted/60" />
        <input
          type="range"
          min={0}
          max={100}
          value={minAts}
          onChange={(e) => setMinAts(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-transparent accent-primary"
        />
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("filterCriteria")}
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {checkboxes.map((box) => (
            <div
              key={box.id}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2"
            >
              <Checkbox
                id={box.id}
                checked={box.checked}
                onCheckedChange={box.onCheckedChange}
              />
              <Label
                htmlFor={box.id}
                className="cursor-pointer text-sm font-normal text-foreground"
              >
                {box.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-2">
        <Button
          type="button"
          size="sm"
          className="flex-1 rounded-xl"
          disabled={isPending}
          onClick={handleApply}
        >
          <IconAdjustments className="size-4 mr-1.5" />
          {t("applyFilters")}
        </Button>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={handleClear}
          >
            <IconFilterOff className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
