"use client";

import { IconSparkles } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useSearchCandidates } from "@/hooks/useCompanySearch";
import SearchPanel from "./SearchPanel";
import ResultsTable from "./ResultsTable";
import CandidateDetail from "./CandidateDetail";

export default function CompanySearchSection() {
  const t = useTranslations("candidateSearch");
  const {
    search,
    isPending,
    candidates,
    selectedCandidate,
    setSelectedCandidate,
  } = useSearchCandidates();

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 lg:h-[calc(100dvh-7.5rem)] lg:min-h-[640px]">
      <header className="shrink-0">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
          <IconSparkles size={13} />
          {t("searchPanel.badge")}
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("searchPanel.title")}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("searchPanel.subtitle")}
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="flex h-[min(420px,50dvh)] shrink-0 flex-col lg:h-auto lg:w-[380px] xl:w-[420px]">
          <SearchPanel onSearch={search} />
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
          <div
            className={
              selectedCandidate
                ? "min-h-[280px] flex-1 overflow-hidden lg:min-h-0"
                : "min-h-[320px] flex-1 overflow-hidden lg:min-h-0"
            }
          >
            <ResultsTable
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
              isPending={isPending}
            />
          </div>

          {selectedCandidate && (
            <div className="h-[min(360px,40dvh)] shrink-0 overflow-hidden lg:h-[340px]">
              <CandidateDetail candidate={selectedCandidate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
