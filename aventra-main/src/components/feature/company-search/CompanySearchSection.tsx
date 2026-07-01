"use client";

import { useSearchCandidates } from "@/hooks/useCompanySearch";
import SearchPanel from "./SearchPanel";
import ResultsTable from "./ResultsTable";
import CandidateDetail from "./CandidateDetail";

export default function CompanySearchSection() {
  const {
    search,
    isPending,
    candidates,
    selectedCandidate,
    setSelectedCandidate,
  } = useSearchCandidates();

  return (
    <div className="flex h-full gap-4 p-4 overflow-hidden">

      {/* Left — Search Assistant */}
      <div className="w-[340px] shrink-0">
        <SearchPanel onSearch={search} isPending={isPending} />
      </div>

      {/* Right — Results + Detail */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden min-w-0">

        {/* Top — Results Table */}
        <div className={selectedCandidate ? "flex-1 overflow-hidden" : "h-full overflow-hidden"}>
          <ResultsTable
            candidates={candidates}
            selectedCandidate={selectedCandidate}
            onSelectCandidate={setSelectedCandidate}
            isPending={isPending}
          />
        </div>

        {/* Bottom — Candidate Detail */}
        {selectedCandidate && (
          <div className="h-[320px] shrink-0">
            <CandidateDetail candidate={selectedCandidate} />
          </div>
        )}
      </div>
    </div>
  );
}