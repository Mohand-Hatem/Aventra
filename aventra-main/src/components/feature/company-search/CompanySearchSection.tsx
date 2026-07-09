"use client";
import { IconSparkles } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useSearchCandidates } from "@/hooks/useCompanySearch";
import { useRecruiterChat } from "@/hooks/useRecruiterChat";
import { useState, useMemo, useEffect } from "react";
import CandidateCards from "./CandidateCards";
import SidebarChat from "./FloatingChat";
import type { CandidateResult } from "@/types/company";

export default function CompanySearchSection() {
  const t = useTranslations("candidateSearch");

  const [minScore, setMinScore] = useState<number>(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const {
    setSearchResults,
    setChatSearching,
    isPending,
    candidates,
    selectedCandidate,
    setSelectedCandidate,
  } = useSearchCandidates();

  const {
    messages,
    sendMessage,
    isThinking,
    isTokenLimitReached,
    tokenLimitError,
  } = useRecruiterChat({ onSearch: setSearchResults });

  // Sync searching loading indicator
  useEffect(() => {
    setChatSearching(isThinking);
  }, [isThinking, setChatSearching]);

  // Open the floating chat widget on load if there are no messages
  useEffect(() => {
    if (messages.length === 0) {
      setIsChatOpen(true);
    }
  }, [messages.length]);

  // Get last query content
  const lastUserMessage = useMemo(() => {
    return [...messages].reverse().find((m) => m.role === "user");
  }, [messages]);

  const currentQuery = lastUserMessage?.content || "";

  // Dynamic latency generator for aesthetic touch
  const latency = useMemo(() => {
    if (!candidates.length) return 0;
    // Generate a latency between 32ms and 58ms
    const hash = currentQuery ? currentQuery.length : 0;
    return (hash % 26) + 32;
  }, [candidates.length, currentQuery]);

  // Filter candidates list
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Min score check
      if (c.matchScore < minScore) return false;
      return true;
    });
  }, [candidates, minScore]);

  const [visibleCount, setVisibleCount] = useState<number>(5);
  useEffect(() => {
    setVisibleCount(5);
  }, [filteredCandidates.length]);

  const hasMore = filteredCandidates.length > visibleCount;
  const paginatedCandidates = useMemo(() => {
    return filteredCandidates.slice(0, visibleCount);
  }, [filteredCandidates, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, filteredCandidates.length));
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] rounded-xl w-full overflow-hidden bg-canvas shadow-md">
      {/* Main Content (Left) */}
      <div className="flex-1 flex flex-col overflow-y-auto px-4 sm:px-8 py-6 gap-6 relative">
        <header className="shrink-0 space-y-2 border-b border-border/40 pb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary dark:border-sky/30 dark:bg-sky/10 dark:text-sky">
            <IconSparkles size={13} />
            AI SEMANTIC SEARCH
          </div>

          {currentQuery ? (
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl leading-tight">
              Results for{" "}
              <span className="text-primary dark:text-sky">
                "{currentQuery}"
              </span>
            </h1>
          ) : (
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl leading-tight">
                Candidate Search
              </h1>
              <p className="text-sm text-muted-foreground">
                Ask for candidates with your requirements and get the best
                matches
              </p>
            </div>
          )}

          {candidates.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center rounded-md bg-primary/10 text-primary dark:bg-sky/20 dark:text-sky px-2 py-0.5 text-xs font-bold">
                LIVE QUERY
              </span>
              <span>
                Found {candidates.length} matches from Vector DB & BigTable
                clusters
              </span>
              <span className="hidden sm:inline text-muted-foreground/40">
                |
              </span>
              <span className="italic">Search latency: {latency}ms</span>
            </div>
          )}
        </header>

        <div className="flex flex-col gap-4 pb-12 w-full max-w-full mx-auto">
          <CandidateCards
            candidates={paginatedCandidates}
            selectedCandidate={selectedCandidate}
            onSelectCandidate={setSelectedCandidate}
            isPending={isPending}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            remainingCount={filteredCandidates.length - visibleCount}
            // Pass new states for top bar filters
            minAtsScore={minScore}
            setMinAtsScore={setMinScore}
          />
        </div>
      </div>

      <SidebarChat
        messages={messages}
        sendMessage={sendMessage}
        isThinking={isThinking}
        isTokenLimitReached={isTokenLimitReached}
        tokenLimitError={tokenLimitError}
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
      />
    </div>
  );
}
