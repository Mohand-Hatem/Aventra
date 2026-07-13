// Folder: src/components/feature/company-search
// File: FilterCandidatesPanel.tsx
// Purpose: Deterministic candidate filter controls (POST /company/filter, scope: "lastSearch").
// Pure control panel — it does not render its own results list. Applying filters
// replaces the contents of whichever results table/cards the host page already
// shows, via the onApply/onReset callbacks.

"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { IconX } from "@tabler/icons-react";
import toast from "react-hot-toast";
import {
  isAccessRestrictedError,
  useCompanyFilterCandidates,
} from "@/hooks/useCompanyFilterCandidates";
import {
  normalizeCompanyFilterCandidates,
} from "@/types/companyFilter";
import type { CandidateResult } from "@/types/company";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FilterT = ReturnType<typeof useTranslations<"companyProfile">>;

function SkillChipInput({
  skills,
  onAdd,
  onRemove,
  t,
}: {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
  t: FilterT;
}) {
  const [value, setValue] = useState("");

  function commit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !value && skills.length > 0) {
      onRemove(skills[skills.length - 1]);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/60 bg-background/60 px-2.5 py-2 focus-within:border-primary/50 dark:focus-within:border-sky/50">
      {skills.map((skill) => (
        <span
          key={skill}
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary dark:bg-sky/15 dark:text-sky"
        >
          {skill}
          <button
            type="button"
            onClick={() => onRemove(skill)}
            className="cursor-pointer hover:text-destructive"
          >
            <IconX className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={skills.length === 0 ? t("filterSkillsPlaceholder") : ""}
        className="min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

interface FilterCandidatesPanelProps {
  onApply: (candidates: CandidateResult[]) => void;
  onReset: () => void;
  onNoLastSearch: (message: string) => void;
}

export function FilterCandidatesPanel({
  onApply,
  onReset,
  onNoLastSearch,
}: FilterCandidatesPanelProps) {
  const t = useTranslations("companyProfile");

  const [skills, setSkills] = useState<string[]>([]);
  const [requireEducation, setRequireEducation] = useState(false);
  const [requireCertificate, setRequireCertificate] = useState(false);
  const [requireProject, setRequireProject] = useState(false);
  const [sortBySkillMatch, setSortBySkillMatch] = useState(false);

  const { mutate, isPending } = useCompanyFilterCandidates();

  // The sort-by-match checkbox has no effect without typed skills — keep it
  // in sync (derived during render) so it doesn't stay silently checked once
  // skills are cleared.
  if (skills.length === 0 && sortBySkillMatch) {
    setSortBySkillMatch(false);
  }

  function addSkill(skill: string) {
    setSkills((prev) =>
      prev.some((s) => s.toLowerCase() === skill.toLowerCase())
        ? prev
        : [...prev, skill],
    );
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  const isAllDefault =
    skills.length === 0 &&
    !requireEducation &&
    !requireCertificate &&
    !requireProject;

  function handleApply() {
    if (isAllDefault) {
      // Prefer the client-side cache over a network round-trip: it also
      // preserves the AI search's original semantic relevance ordering.
      onReset();
      return;
    }

    mutate(
      {
        skills,
        requireEducation,
        requireCertificate,
        requireProject,
        sortBySkillMatch,
      },
      {
        onSuccess: (data) => {
          if (data.message) {
            toast.error(data.message);
            onNoLastSearch(data.message);
            return;
          }
          onApply(normalizeCompanyFilterCandidates(data.results));
        },
        onError: (error) => {
          if (isAccessRestrictedError(error)) {
            toast.error(t("filterAccessRestricted"));
          } else {
            toast.error(t("filterGenericError"));
          }
        },
      },
    );
  }

  const checkboxes = [
    {
      id: "filter-require-education",
      label: t("filterRequireEducation"),
      checked: requireEducation,
      onCheckedChange: () => setRequireEducation((v) => !v),
    },
    {
      id: "filter-require-certificate",
      label: t("filterRequireCertificate"),
      checked: requireCertificate,
      onCheckedChange: () => setRequireCertificate((v) => !v),
    },
    {
      id: "filter-require-project",
      label: t("filterRequireProject"),
      checked: requireProject,
      onCheckedChange: () => setRequireProject((v) => !v),
    },
  ];

  return (
    <div className="@container space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("filterSkillsLabel")}
        </Label>
        <SkillChipInput
          skills={skills}
          onAdd={addSkill}
          onRemove={removeSkill}
          t={t}
        />
      </div>

      <div className="grid grid-cols-1 gap-2.5 @sm:grid-cols-2 @2xl:grid-cols-4">
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

        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2 transition-colors",
            skills.length === 0
              ? "opacity-50"
              : "hover:border-primary/40 dark:hover:border-sky/40",
          )}
        >
          <Checkbox
            id="filter-sort-by-skill-match"
            checked={sortBySkillMatch}
            disabled={skills.length === 0}
            onCheckedChange={() => setSortBySkillMatch((v) => !v)}
          />
          <Label
            htmlFor="filter-sort-by-skill-match"
            className={cn(
              "text-sm font-normal text-foreground",
              skills.length === 0 ? "cursor-not-allowed" : "cursor-pointer",
            )}
          >
            {t("filterSortBySkillMatch")}
          </Label>
        </div>
      </div>

      <Button
        type="button"
        className="w-full rounded-xl"
        disabled={isPending}
        onClick={handleApply}
      >
        {isPending ? t("filterSearching") : t("filterSearchButton")}
      </Button>
    </div>
  );
}

export default FilterCandidatesPanel;
