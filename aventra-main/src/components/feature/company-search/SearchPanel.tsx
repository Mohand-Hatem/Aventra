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
  onSearch: (query: string) => Promise<void> | void;
}

export default function SearchPanel({ onSearch }: SearchPanelProps) {
  const t = useTranslations("candidateSearch.assistant");

  // كل رسالة بتروح للباك مباشرةً — مش في keyword detection
  const { messages, sendMessage, isThinking } = useRecruiterChat({ onSearch });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">

      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-5">
        {messages.length === 0 && (
          <>
            <WelcomeMessage />
            <div className="mt-6">
              <SuggestedPrompts onSelect={sendMessage} />
            </div>
          </>
        )}

        {messages.length > 0 && (
          <div className="space-y-5">
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

      <ChatInput onSend={sendMessage} disabled={isThinking} />
    </div>
  );
}
