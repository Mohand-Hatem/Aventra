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
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 lg:h-[calc(100dvh-7.5rem)] lg:min-h-[640px]">
      <header className="shrink-0 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
          <IconSparkles size={13} />
          {t("searchPanel.badge")}
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("searchPanel.title")}
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          {t("searchPanel.subtitle")}
        </p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Chat Panel */}
        <div className="flex h-[min(500px,55dvh)] shrink-0 flex-col lg:h-auto lg:w-[420px] xl:w-[480px]">
          <SearchPanel onSearch={search} />
        </div>

        {/* Results Panel */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6">
          {/* Results Table */}
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border/50 bg-card/30 shadow-sm">
            <ResultsTable
              candidates={candidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
              isPending={isPending}
            />
          </div>

          {/* Candidate Detail */}
          {selectedCandidate && (
            <div className="h-[min(380px,40dvh)] shrink-0 overflow-hidden rounded-xl border border-border/50 bg-card/30 shadow-sm lg:h-[360px]">
              <CandidateDetail candidate={selectedCandidate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
