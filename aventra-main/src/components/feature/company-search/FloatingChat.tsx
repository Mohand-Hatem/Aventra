// Folder: src/components/feature/company-search
// File: FloatingChat.tsx
// Purpose: Floating chat widget (bottom-right corner) with chat toggle button, chat drawer containing conversation history, input, and bot logo tooltip.

"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { FaMessage, FaXmark } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import WelcomeMessage from "./WelcomeMessage";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import type { ChatMessage } from "@/hooks/useRecruiterChat";
import type { TokenLimitErrorResponse } from "@/types/ai";
import { useTranslations } from "next-intl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconBrandNextjs,
  IconBrandAngular,
  IconBrandTypescript,
  IconDatabase,
  IconServer,
  IconCode,
  IconCpu,
  IconInfinity,
} from "@tabler/icons-react";

interface FloatingChatProps {
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  isThinking: boolean;
  isTokenLimitReached: boolean;
  tokenLimitError: TokenLimitErrorResponse | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  inline?: boolean;
}

const suggestionsTech = [
  {
    label: "Next.js",
    query: "Find candidates with Next.js experience",
    icon: IconBrandNextjs,
  },
  {
    label: "Angular",
    query: "Search for Angular developers",
    icon: IconBrandAngular,
  },
  {
    label: "TypeScript",
    query: "Looking for TypeScript developers",
    icon: IconBrandTypescript,
  },
  { label: "SQL", query: "Find SQL database specialists", icon: IconDatabase },
  { label: "NoSQL", query: "Find NoSQL database experts", icon: IconServer },
];

const suggestionsTrack = [
  { label: "Frontend", query: "Search for Frontend engineers", icon: IconCode },
  { label: "Backend", query: "Find Backend developers", icon: IconCpu },
  { label: "DevOps", query: "Search for DevOps engineers", icon: IconInfinity },
];

export default function FloatingChat({
  messages,
  sendMessage,
  isThinking,
  isTokenLimitReached,
  tokenLimitError,
  isOpen,
  setIsOpen,
  inline = false,
}: FloatingChatProps) {
  const t = useTranslations("candidateSearch.assistant");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 80);
    }
  }, [messages, isOpen, isThinking]);

  return (
    <>
      <aside
        className={cn(
          "shrink-0 flex flex-col bg-canvas border border-border/60 rounded-2xl transition-all duration-300 ease-in-out overflow-hidden shadow-xs w-full",
          inline
            ? "relative h-[700px]"
            : cn(
                "fixed   right-5 h-[700px] ml-4 border-l",
                isOpen ? "w-[380px] opacity-100" : "w-0 opacity-0 border-none",
              ),
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas border border-border/80 shadow-xs cursor-pointer hover:scale-115 active:scale-95 transition-transform duration-300">
                    <Image
                      src="/mobile-logo.png"
                      alt="Aventra bot logo"
                      width={28}
                      height={28}
                      priority
                      className="rounded-lg h-auto w-auto"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span
                        className={cn(
                          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                          isThinking ? "bg-emerald-400" : "bg-sky-400",
                        )}
                      ></span>
                      <span
                        className={cn(
                          "relative inline-flex rounded-full h-2.5 w-2.5",
                          isThinking ? "bg-emerald-500" : "bg-sky-500",
                        )}
                      ></span>
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p className="text-xs font-bold">Aventra Recruiter AI</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div>
              <p className="text-sm font-bold text-foreground leading-tight">
                {t("title")}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <FaXmark size={14} />
          </button>
        </div>

        {/* Conversation Body */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-muted/10 p-4 space-y-4 scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4 space-y-4">
              <WelcomeMessage />
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Describe the candidate you're looking for, and Aventra AI will
                query vector databases to find matches instantly!
              </p>
            </div>
          ) : (
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
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="border-t border-border/40 bg-canvas/20 py-2.5 flex flex-col gap-1">
          {/* Suggestion Chips */}
          <div className="flex flex-col gap-3 px-2">
            {/* Row 1: Tech */}
            <div className="flex justify-center items-center gap-1.5 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
              {suggestionsTech.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() =>
                      !isThinking &&
                      !isTokenLimitReached &&
                      sendMessage(s.query)
                    }
                    disabled={isThinking || isTokenLimitReached}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all duration-200 cursor-pointer select-none whitespace-nowrap shadow-xs",
                      "border-primary/25 bg-primary/5 text-primary hover:bg-primary/10 active:scale-95",
                      "dark:border-sky/25 dark:bg-transparent dark:text-sky dark:hover:bg-sky/15",
                      (isThinking || isTokenLimitReached) &&
                        "opacity-50 pointer-events-none",
                    )}
                  >
                    <Icon size={15} className="shrink-0" />
                    {s.label}
                  </button>
                );
              })}
            </div>
            {/* Row 2: Track */}
            <div className="flex justify-center items-center gap-1.5 overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth">
              {suggestionsTrack.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() =>
                      !isThinking &&
                      !isTokenLimitReached &&
                      sendMessage(s.query)
                    }
                    disabled={isThinking || isTokenLimitReached}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all duration-200 cursor-pointer select-none whitespace-nowrap shadow-xs",
                      "border-primary/25 bg-primary/5 text-primary hover:bg-primary/10 active:scale-95",
                      "dark:border-sky/25 dark:bg-transparent dark:text-sky dark:hover:bg-sky/15",
                      (isThinking || isTokenLimitReached) &&
                        "opacity-50 pointer-events-none",
                    )}
                  >
                    <Icon size={15} className="shrink-0" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {tokenLimitError?.message ? (
            <p className="px-4 text-center text-xs font-semibold text-destructive">
              {tokenLimitError.message}
            </p>
          ) : null}
          <ChatInput
            onSend={sendMessage}
            disabled={isThinking || isTokenLimitReached}
          />
        </div>
      </aside>

      {!inline && (
        <div
          className={cn(
            "fixed bottom-3 z-50 transition-all duration-300 ease-in-out",
            isOpen ? "right-[410px]" : "right-6",
          )}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-border/40",
              "bg-canva text-zinc-900",
              "dark:bg-background dark:text-foreground",
            )}
            title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            {isOpen ? (
              <FaXmark size={20} />
            ) : (
              <Image
                src="/mobile-logo.png"
                alt="Open"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
            )}
          </button>
        </div>
      )}
    </>
  );
}
