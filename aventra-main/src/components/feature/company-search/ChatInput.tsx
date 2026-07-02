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
    <div className="border-t border-border bg-background p-4">

      <div className="flex items-center gap-2">

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
          className="h-11"
        />

        <Button
          size="icon"
          disabled={!message.trim() || disabled}
          onClick={handleSend}
        >
          <IconSend2 size={18} />
        </Button>

      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {t("poweredBy")}
      </p>

    </div>
  );
}