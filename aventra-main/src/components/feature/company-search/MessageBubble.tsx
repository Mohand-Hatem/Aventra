"use client";

import Image from "next/image";
import { IconUser } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  time: string;
}

export default function MessageBubble({
  role,
  content,
  time,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full items-end gap-2.5",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {/* AI avatar */}
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-primary/8 shadow-sm dark:from-sky/20 dark:to-sky/8">
          <Image
            src="/mobile-logo.png"
            alt="Aventra AI"
            width={16}
            height={16}
            className="object-contain"
          />
        </div>
      )}

      {/* Bubble + timestamp */}
      <div
        className={cn("flex max-w-[78%] flex-col gap-1", isUser && "items-end")}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm",
            isUser
              ? "rounded-br-sm bg-linear-to-br from-primary to-primary/85 text-primary-foreground"
              : "rounded-bl-sm border border-border/40 bg-card/80 text-foreground backdrop-blur-sm",
          )}
        >
          {content}
        </div>

        <span className="px-1 text-[10px] text-muted-foreground/50">
          {time}
        </span>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/12 shadow-sm dark:bg-primary/15">
          <IconUser size={14} className="text-primary dark:text-sky" />
        </div>
      )}
    </div>
  );
}
