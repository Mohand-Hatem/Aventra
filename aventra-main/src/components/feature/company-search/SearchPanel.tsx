// Folder: src/components/feature/company-search
// File: SearchPanel.tsx
// Purpose: Chat interface — sends every message to LLM+RAG backend.

"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import ChatHeader from "./ChatHeader";
import WelcomeMessage from "./WelcomeMessage";
import SuggestedPrompts from "./SuggestedPrompts";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import { useRecruiterChat } from "@/hooks/useRecruiterChat";

interface SearchPanelProps {
  onSearch: (results: unknown[]) => void;
}

export default function SearchPanel({ onSearch }: SearchPanelProps) {
  const t = useTranslations("candidateSearch.assistant");

  const { messages, sendMessage, isThinking } = useRecruiterChat({ onSearch });

  const bottomRef = useRef<HTMLDivElement>(null);

  // Only scroll when user sends a message (last message is from user)
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1]?.role === "user") {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [messages]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/50 shadow-lg">

      <ChatHeader />

      <div className="flex-1 overflow-y-auto bg-card/40 p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center space-y-6">
            <WelcomeMessage />
            <div className="w-full">
              <SuggestedPrompts onSelect={sendMessage} />
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

      <div className="border-t border-border/30 bg-gradient-to-t from-muted/40 to-transparent">
        <ChatInput onSend={sendMessage} disabled={isThinking} />
      </div>
    </div>
  );
}
