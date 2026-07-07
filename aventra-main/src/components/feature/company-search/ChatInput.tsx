// ChatInput.tsx
"use client";

import { useState } from "react";
import { IconSend2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const t = useTranslations("candidateSearch.assistant");

  const [message, setMessage] = useState("");

  function handleSend() {
    const text = message.trim();

    if (!text || disabled) return;

    void onSend(text);
    setMessage("");
  }

  return (
    <div className="space-y-3 p-4">

      <div className="flex items-center gap-2.5">

        <Input
          value={message}
          disabled={disabled}
          placeholder={t("placeholder")}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          className="h-11 rounded-xl border-border/40 bg-card/50 placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-card"
        />

        <Button
          size="icon"
          disabled={!message.trim() || disabled}
          onClick={handleSend}
          className="h-11 w-11 rounded-xl bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary dark:from-sky dark:to-sky/80 dark:hover:from-sky/90 dark:hover:to-sky"
        >
          <IconSend2 size={18} />
        </Button>

      </div>

      <p className="text-center text-[11px] font-medium text-muted-foreground/70">
        {t("poweredBy")}
      </p>

    </div>
  );
}