"use client";
import { IconArrowUp } from "@tabler/icons-react";

function ScrollTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      Back to top <IconArrowUp className="size-3.5" />
    </button>
  );
}

export default ScrollTop;
