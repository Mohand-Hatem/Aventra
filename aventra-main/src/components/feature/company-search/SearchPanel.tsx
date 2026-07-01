/**
 * Folder: src/components/feature/company-search
 * File: SearchPanel.tsx
 * Purpose:
 * - Chat-like search interface for companies.
 * - Sends natural language queries to the AI search endpoint.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { IconSearch, IconSend, IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { CandidateResult } from "@/types/company";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUERIES = [
  "Find Backend Developers with Node.js and PostgreSQL",
  "Senior React developers with 5+ years experience",
  "Full Stack engineers with AWS and Docker",
  "Data Scientists with Python and TensorFlow",
];

interface SearchPanelProps {
  onSearch: (query: string) => void;
  isPending: boolean;
  candidates: CandidateResult[];
  onSelectCandidate: (candidate: CandidateResult) => void;
  selectedCandidate: CandidateResult | null;
}

export default function SearchPanel({
  onSearch,
  isPending,
  candidates,
  onSelectCandidate,
  selectedCandidate,
}: SearchPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function handleSend(query?: string) {
    const text = (query ?? input).trim();
    if (!text || isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    onSearch(text);
  }

  // لما الـ search يرجع نتايج، نضيف رسالة الـ assistant
  useEffect(() => {
    if (!isPending && candidates.length > 0) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev;
        return [
          ...prev,
          {
            role: "assistant",
            content: `Found ${candidates.length} matching candidate${candidates.length > 1 ? "s" : ""}. Select one to view their CV.`,
          },
        ];
      });
    } else if (!isPending && messages.some((m) => m.role === "user") && candidates.length === 0) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev;
        return [
          ...prev,
          { role: "assistant", content: "No matching candidates found. Try a different query." },
        ];
      });
    }
  }, [isPending, candidates.length]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card">

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <IconSparkles size={16} className="text-primary dark:text-sky" />
        <p className="text-sm font-semibold text-foreground">AI Candidate Search</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-sky/10">
              <IconSearch size={20} className="text-primary dark:text-sky" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Search candidates using natural language
            </p>
            <div className="flex flex-col gap-2 w-full">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary dark:bg-sky text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Candidate list */}
            {!isPending && candidates.length > 0 && (
              <div className="space-y-2 pt-1">
                {candidates.map((c) => {
                  const name =
                    typeof c.user.name === "string"
                      ? c.user.name
                      : c.user.name?.en ?? "Unknown";
                  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                  const isSelected = selectedCandidate?.cvId === c.cvId;

                  return (
                    <button
                      key={c.cvId}
                      onClick={() => onSelectCandidate(c)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                        isSelected
                          ? "border-primary dark:border-sky bg-primary/5 dark:bg-sky/5"
                          : "border-border bg-background hover:bg-muted"
                      )}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-sky/10 text-xs font-bold text-primary dark:text-sky">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          ATS: {c.atsScore} · Match: {c.matchScore}%
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Search by skills, role, experience..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            disabled={isPending}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isPending}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary dark:bg-sky text-white transition-opacity disabled:opacity-40 hover:opacity-90"
          >
            <IconSend size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
