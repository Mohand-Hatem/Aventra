// MessageBubble.tsx
"use client";

import { IconRobot, IconUser } from "@tabler/icons-react";
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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 dark:bg-sky/10">
          <IconRobot
            size={18}
            className="text-primary dark:text-sky"
          />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%]",
          isUser && "flex flex-col items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm",
            isUser
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-border bg-card"
          )}
        >
          {content}
        </div>

        <span className="mt-1 px-1 text-[10px] text-muted-foreground">
          {time}
        </span>
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <IconUser size={18} />
        </div>
      )}
    </div>
  );
}