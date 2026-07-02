// useRecruiterChat.ts
import { useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
export interface RecruiterReplies {
  greeting: string;
  identity: string;
  search: string;
  outOfScope: string;
}

interface UseRecruiterChatProps {
  onSearch: (query: string) => Promise<void> | void;

  replies: RecruiterReplies;
}

type Intent =
  | "greeting"
  | "identity"
  | "search"
  | "out_of_scope";

const SEARCH_KEYWORDS = [
  "find",
  "search",
  "looking for",
  "need",
  "candidate",
  "developer",
  "engineer",
  "frontend",
  "backend",
  "react",
  "next",
  "next.js",
  "node",
  "node.js",
  "express",
  "flutter",
  "android",
  "ios",
  "python",
  "java",
  "php",
  "laravel",
  "sql",
  "mongodb",
  "aws",
  "docker",
  "devops",
  "cv",
  "resume",
  "مطور",

"مبرمج",

"ابحث",

"ابحث عن",

"فلاتر",

"رياكت",

"واجهة",

"باك",

"مرشح",

"سيرة",

"سي في",
"مهندس",

"وظيفة",

"خبرة",

"بايثون",

"جافا" ,

"نود", 
];

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function detectIntent(message: string): Intent {
  const lower = message.toLowerCase().trim();
      const greetingRegex =
/^(hi|hello|hey|good morning|good evening)[!. ]*$/i;
  if (greetingRegex.test(lower)) {
    return "greeting";
  }

  if (
    lower.includes("who are you") ||
    lower.includes("what are you")
  ) {
    return "identity";
  }

  const isSearch = SEARCH_KEYWORDS.some((keyword) =>
    lower.includes(keyword)
  );

  if (isSearch) {
    return "search";
  }

  return "out_of_scope";
}

export function useRecruiterChat({
  onSearch,
  replies,
}: UseRecruiterChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setIsThinking(true);

    const intent = detectIntent(text);

    let reply = "";

    switch (intent) {
      case "greeting":
        reply =
          replies.greeting;
        break;

      case "identity":
        reply =
          replies.identity;
        break;

      case "search":
        reply =
          replies.search;
        break;

      default:
        reply =
          replies.outOfScope;
        break;
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        createdAt: getCurrentTime(),
      },
    ]);

   if (intent === "search") {
  try {
    await onSearch(text);
  } catch {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong while searching.",
        createdAt: getCurrentTime(),
      },
    ]);
  }
}

    setIsThinking(false);
  }

  return {
    messages,
    sendMessage,
    isThinking,
  };
}