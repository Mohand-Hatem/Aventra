"use client";

import { useMemo, useState } from "react";
import {
  IconAdjustments,
  IconFilterOff,
  IconSchool,
  IconThumbUp,
  IconThumbDown,
  IconSlideshow,
} from "@tabler/icons-react";
import type { useTranslations } from "next-intl";
import type { CandidateFilterCriteria, CandidateResult } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CandidateFilterPanelProps {
  candidates: CandidateResult[];
  onApply: (criteria: CandidateFilterCriteria) => void;
  onClear: () => void;
  isPending: boolean;
  t: ReturnType<typeof useTranslations<"companyProfile">>;
}

function ScoreSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>{label}</span>
        <span className="text-primary dark:text-sky tabular-nums">
          {value}%
        </span>
      </div>
      <Progress value={value} className="h-2.5 bg-muted/60" />
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-transparent accent-primary"
      />
    </div>
  );
}

function TagCloud({
  icon,
  label,
  options,
  selected,
  onToggle,
  activeClassName,
}: {
  icon: React.ReactNode;
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  activeClassName: string;
}) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="max-h-40 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:w-0.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full flex flex-wrap gap-1.5 rounded-xl border border-border/60 bg-background/60 p-2.5">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                  ? activeClassName
                  : "border-transparent bg-muted text-muted-foreground hover:border-border",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CandidateFilterPanel({
  candidates,
  onApply,
  onClear,
  isPending,
  t,
}: CandidateFilterPanelProps) {
  const [minAts, setMinAts] = useState(0);
  const [minMatch, setMinMatch] = useState(0);
  const [hasSkills, setHasSkills] = useState(false);
  const [hasCertifications, setHasCertifications] = useState(false);
  const [hasExperience, setHasExperience] = useState(false);
  const [hasProjects, setHasProjects] = useState(false);
  const [selectedEducations, setSelectedEducations] = useState<string[]>([]);
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([]);
  const [selectedWeaknesses, setSelectedWeaknesses] = useState<string[]>([]);

  const allEducation = useMemo(
    () =>
      Array.from(
        new Set(
          candidates
            .flatMap(
              (c) => c.education?.map((e) => e.degree || e.institution) || [],
            )
            .filter(Boolean),
        ),
      ) as string[],
    [candidates],
  );
  const allStrengths = useMemo(
    () =>
      Array.from(
        new Set(
          candidates.flatMap((c) => c.strengths?.map((s) => s.title) || []),
        ),
      ).filter(Boolean),
    [candidates],
  );
  const allWeaknesses = useMemo(
    () =>
      Array.from(
        new Set(
          candidates.flatMap((c) => c.weaknesses?.map((w) => w.title) || []),
        ),
      ).filter(Boolean),
    [candidates],
  );

  const hasActiveFilters =
    minAts > 0 ||
    minMatch > 0 ||
    hasSkills ||
    hasCertifications ||
    hasExperience ||
    hasProjects ||
    selectedEducations.length > 0 ||
    selectedStrengths.length > 0 ||
    selectedWeaknesses.length > 0;

  function toggle(
    list: string[],
    setList: (l: string[]) => void,
    value: string,
  ) {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  }

  function handleApply() {
    onApply({
      minAts,
      minMatch,
      hasSkills,
      hasCertifications,
      hasExperience,
      hasProjects,
      educations: selectedEducations,
      strengths: selectedStrengths,
      weaknesses: selectedWeaknesses,
    });
  }

  function handleClear() {
    setMinAts(0);
    setMinMatch(0);
    setHasSkills(false);
    setHasCertifications(false);
    setHasExperience(false);
    setHasProjects(false);
    setSelectedEducations([]);
    setSelectedStrengths([]);
    setSelectedWeaknesses([]);
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
      <div className="max-h-[420px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:w-0.5 [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full space-y-5 pr-1">
        <ScoreSlider
          label={t("atsRange")}
          value={minAts}
          onChange={setMinAts}
        />
        <ScoreSlider
          label={t("matchRange")}
          value={minMatch}
          onChange={setMinMatch}
        />

        <div className="space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("filterCriteria")}
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {checkboxes.map((box) => (
              <div
                key={box.id}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 transition-colors hover:border-primary/40 dark:hover:border-sky/40"
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

        <TagCloud
          icon={<IconSchool className="size-3.5" />}
          label={t("filterEducation")}
          options={allEducation}
          selected={selectedEducations}
          onToggle={(v) => toggle(selectedEducations, setSelectedEducations, v)}
          activeClassName="border-primary bg-primary text-primary-foreground dark:border-sky dark:bg-sky"
        />

        <TagCloud
          icon={<IconThumbUp className="size-3.5" />}
          label={t("filterStrengths")}
          options={allStrengths}
          selected={selectedStrengths}
          onToggle={(v) => toggle(selectedStrengths, setSelectedStrengths, v)}
          activeClassName="border-emerald-500 bg-emerald-500 text-white"
        />

        <TagCloud
          icon={<IconThumbDown className="size-3.5" />}
          label={t("filterWeaknesses")}
          options={allWeaknesses}
          selected={selectedWeaknesses}
          onToggle={(v) => toggle(selectedWeaknesses, setSelectedWeaknesses, v)}
          activeClassName="border-rose-500 bg-rose-500 text-white"
        />

        {allEducation.length === 0 &&
        allStrengths.length === 0 &&
        allWeaknesses.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/15 px-3 py-2.5 text-xs text-muted-foreground">
            <IconSlideshow className="size-3.5 shrink-0" />
            {t("filterTagsEmpty")}
          </div>
        ) : null}
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-border/60 pt-4">
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
