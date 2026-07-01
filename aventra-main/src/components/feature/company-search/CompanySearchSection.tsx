/**
 * Folder: src/components/feature/company-search
 * File: CompanySearchSection.tsx
 * Purpose:
 * - Main layout: splits screen into SearchPanel (left) + CVViewer (right).
 * - Owns the useCompanySearch hook and passes data down.
 */

"use client";

import { useSearchCandidates } from "@/hooks/useCompanySearch";
import SearchPanel from "./SearchPanel";
import CVViewer from "./CVViewer";
import EmptyViewer from "./EmptyViewer";

export default function CompanySearchSection() {
  const {
    search,
    isPending,
    candidates,
    selectedCandidate,
    setSelectedCandidate,
  } = useSearchCandidates();

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Left — Search Chat */}
      <SearchPanel
        onSearch={search}
        isPending={isPending}
        candidates={candidates}
        onSelectCandidate={setSelectedCandidate}
        selectedCandidate={selectedCandidate}
      />

      {/* Right — CV Viewer */}
      {selectedCandidate ? (
        <CVViewer candidate={selectedCandidate} />
      ) : (
        <EmptyViewer />
      )}
    </div>
  );
}
