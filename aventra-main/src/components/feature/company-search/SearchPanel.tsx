/**
 * Folder: src/components/feature/company-search
 * File: SearchPanel.tsx
 * Purpose: AI Search Assistant chat panel (left side).
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { IconSend, IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

const SUGGESTED_QUERIES = [
  "Frontend developers with React",
  "Data scientists with Python",
  "DevOps engineers with AWS",
  "Mobile developers with Flutter",
];

interface SearchPanelProps {
  onSearch: (query: string) => void;
  isPending: boolean;
}

function getTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function SearchPanel({ onSearch, isPending }: SearchPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function handleSend(query?: string) {
    const text = (query ?? input).trim();
    if (!text || isPending) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, time: getTime() },
    ]);
    setInput("");
    onSearch(text);
  }

  // Add assistant reply when search completes
  useEffect(() => {
  if (isPending) return;
  setMessages((prev) => {
    const last = prev[prev.length - 1];
    if (!last || last.role === "assistant") return prev;
    // مش هيضيف رسالة لو لسه مفيش search اتعمل
    return [
      ...prev,
      {
        role: "assistant",
        content: "Results are ready. Select a candidate from the table to view details.",
        time: getTime(),
      },
    ];
  });
}, [isPending]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card overflow-hidden">

      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Search Assistant</p>
          <span className="rounded-full bg-primary/10 dark:bg-sky/10 px-2 py-0.5 text-[10px] font-bold text-primary dark:text-sky">
            AI
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Describe the type of candidate you&apos;re looking for
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          /* Suggested queries */
          <div className="flex flex-col gap-2 pt-2">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isPending}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-4 py-3 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                <IconSparkles size={13} className="text-primary dark:text-sky shrink-0" />
                {q}
              </button>
            ))}
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col gap-1",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "rounded-br-sm bg-primary/10 dark:bg-sky/10 text-foreground"
                    : "rounded-bl-sm bg-muted text-foreground"
                )}
              >
                {msg.content}
              </div>
              <div className="flex items-center gap-1 px-1">
                <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                {msg.role === "user" && (
                  <span className="text-[10px] text-primary dark:text-sky">✓✓</span>
                )}
              </div>
            </div>
          ))
        )}

        {/* Thinking indicator */}
        {isPending && (
          <div className="flex items-start gap-2">
            <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
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

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your search..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            disabled={isPending}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isPending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary dark:bg-sky text-white transition-opacity disabled:opacity-40 hover:opacity-90"
          >
            <IconSend size={14} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          ✦ Powered by AI
        </p>
      </div>
    </div>
  );
}
