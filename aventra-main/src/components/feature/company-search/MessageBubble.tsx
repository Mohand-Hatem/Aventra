// MessageBubble.tsx
"use client";

import { IconUser } from "@tabler/icons-react";
import Image from "next/image";
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
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 dark:from-sky/20 dark:to-sky/10">
          <Image
            src="/mobile-logo.png"
            alt="Aventra Logo"
            width={18}
            height={18}
            className="object-contain"
          />
        </div>
      )}

      <div
        className={cn(
          "max-w-xs sm:max-w-sm lg:max-w-md",
          isUser && "flex flex-col items-end"
        )}
      >
        <div
          className={cn(
            "rounded-xl px-4 py-2.5 text-sm leading-6 shadow-sm",
            isUser
              ? "rounded-br-md bg-gradient-to-r from-primary to-primary/90 text-primary-foreground"
              : "rounded-bl-md border border-border/40 bg-card/60 text-foreground"
          )}
        >
          {content}
        </div>

        <span className="mt-1.5 px-1 text-[10px] font-medium text-muted-foreground/60">
          {time}
        </span>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/10">
          <IconUser size={16} className="text-primary dark:text-sky" />
        </div>
      )}
    </div>
  );
}