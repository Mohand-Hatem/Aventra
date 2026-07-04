// Folder: src/components/feature/company-search
// File: SearchPanel.tsx
// Purpose: Chat interface — sends every message to LLM+RAG backend.

"use client";

import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import WelcomeMessage from "./WelcomeMessage";
import SuggestedPrompts from "./SuggestedPrompts";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import { useRecruiterChat } from "@/hooks/useRecruiterChat";
import type { CandidateResult } from "@/types/company";

interface SearchPanelProps {
  onSearch: (results: CandidateResult[]) => void;
  onSearchingChange?: (searching: boolean) => void;
}

export default function SearchPanel({
  onSearch,
  onSearchingChange,
}: SearchPanelProps) {
  const { messages, sendMessage, isThinking, isTokenLimitReached, tokenLimitError } =
    useRecruiterChat({ onSearch });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onSearchingChange?.(isThinking);
  }, [isThinking, onSearchingChange]);

  // Only scroll when user sends a message (last message is from user)
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1]?.role === "user") {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-linear-to-b from-card to-card/50 shadow-lg">

      <ChatHeader />

      <div className="flex-1 overflow-y-auto bg-card/40 p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center space-y-6">
            <WelcomeMessage />
            <div className="w-full">
              <SuggestedPrompts onSelect={sendMessage} disabled={isTokenLimitReached} />
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
                time={message.createdAt}
              />
            ))}

            {isThinking && <TypingIndicator />}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border/30 bg-linear-to-t from-muted/40 to-transparent">
        {tokenLimitError?.message ? (
          <p className="px-4 pt-4 text-center text-xs text-destructive">
            {tokenLimitError.message}
          </p>
        ) : null}
        <ChatInput onSend={sendMessage} disabled={isThinking || isTokenLimitReached} />
      </div>
    </div>
  );
}
