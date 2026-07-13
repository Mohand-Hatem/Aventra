// Folder: src/hooks
// File: useFilterableCandidateResults.ts
// Purpose: Shared "filter overrides the same results table" logic for the
// Candidate Search page and Company Profile page. The deterministic
// /company/filter results replace what's displayed in place; the original
// AI search results stay cached so clearing filters can restore them
// instantly without a network call.

"use client";

import { useState } from "react";
import type { CandidateResult } from "@/types/company";

export function useFilterableCandidateResults(
  sourceCandidates: CandidateResult[],
) {
  const [filteredCandidates, setFilteredCandidates] = useState<
    CandidateResult[] | null
  >(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateResult | null>(null);

  // A new/changed source (new AI search, or a different history entry)
  // always drops any active filter override — derived during render rather
  // than via an effect, so there's no extra render with stale data.
  const [prevSource, setPrevSource] = useState(sourceCandidates);
  if (prevSource !== sourceCandidates) {
    setPrevSource(sourceCandidates);
    setFilteredCandidates(null);
  }

  const displayedCandidates = filteredCandidates ?? sourceCandidates;

  const [prevDisplayed, setPrevDisplayed] = useState(displayedCandidates);
  if (prevDisplayed !== displayedCandidates) {
    setPrevDisplayed(displayedCandidates);
    const stillValid =
      selectedCandidate &&
      displayedCandidates.some((c) => c.cvId === selectedCandidate.cvId);
    if (!stillValid) {
      setSelectedCandidate(displayedCandidates[0] ?? null);
    }
  }

  return {
    displayedCandidates,
    isFiltered: filteredCandidates !== null,
    selectedCandidate,
    setSelectedCandidate,
    applyFilterResults: (results: CandidateResult[]) =>
      setFilteredCandidates(results),
    resetFilterResults: () => setFilteredCandidates(null),
  };
}
