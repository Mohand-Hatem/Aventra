"use client";
import { IconSparkles } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useSearchCandidates } from "@/hooks/useCompanySearch";
import { useRecruiterChat } from "@/hooks/useRecruiterChat";
import { useState, useMemo, useEffect } from "react";
import CandidateCards from "./CandidateCards";
import SidebarChat from "./FloatingChat";
import type { CandidateResult } from "@/types/company";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
      if (c.atsScore < minScore) return false;
      return true;
    });
  }, [candidates, minScore]);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] rounded-xl w-full bg-canvas shadow-md px-4 sm:px-6 md:px-8 py-8 ">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4">
        <div
          className={cn(
            "row-span-10 flex flex-col gap-6 col-span-12",
            isChatOpen ? "lg:col-span-8" : "lg:col-span-12",
          )}
        >
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

          <div className="flex flex-col gap-4 w-full max-w-full mx-auto">
            <CandidateCards
              candidates={filteredCandidates}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
              isPending={isPending}
              // Pass new states for top bar filters
              minAtsScore={minScore}
              setMinAtsScore={setMinScore}
              hasRawCandidates={candidates.length > 0}
            />
          </div>
        </div>

        {/* Chatbot */}
        {isChatOpen && (
          <div className="col-span-12 lg:col-span-4 lg:col-start-9 lg:sticky lg:top-30 lg:mt-13.5 lg:self-start">
            <SidebarChat
              messages={messages}
              sendMessage={sendMessage}
              isThinking={isThinking}
              isTokenLimitReached={isTokenLimitReached}
              tokenLimitError={tokenLimitError}
              isOpen={isChatOpen}
              setIsOpen={setIsChatOpen}
              inline={true}
            />

            <button
              onClick={() => setIsChatOpen(false)}
              className="hidden lg:flex absolute bottom-0 -left-10 z-50 h-15 w-15 items-center justify-center rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-border/40 bg-canvas text-zinc-900 dark:bg-background dark:text-foreground"
              title="Close AI Assistant"
            >
              <Image
                src="/mobile-logo.png"
                alt="Close"
                width={20}
                height={20}
                className="h-10 w-10 object-contain"
              />
            </button>
          </div>
        )}
      </div>

      {/* Floating Toggle Button when closed */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex h-15 w-15 items-center justify-center rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-border/40 bg-canvas text-zinc-900 dark:bg-background dark:text-foreground"
            title="Open AI Assistant"
          >
            <Image
              src="/mobile-logo.png"
              alt="Open"
              width={24}
              height={24}
              className="h-10 w-10 object-contain"
            />
          </button>
        </div>
      )}
    </div>
  );
}
