"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AiOutlineMoon, AiOutlineSun } from "react-icons/ai";
import { FaCloudMoonRain } from "react-icons/fa";


export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-9 w-20 rounded-full border border-border/60 bg-muted/40"
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative h-9 w-20 shrink-0 rounded-full border border-border/60 bg-muted/50 p-1 shadow-inner",
        "transition-colors duration-300 hover:border-border hover:bg-muted/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
      )}
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2.5 text-muted-foreground">
        <AiOutlineSun
          aria-hidden
          className={cn(
            "size-3.5 transition-opacity duration-300",
            isDark ? "opacity-40" : "opacity-0",
          )}
        />
        <AiOutlineMoon
          aria-hidden
          className={cn(
            "size-3.5 transition-opacity duration-300",
            isDark ? "opacity-0" : "opacity-40",
          )}
        />
      </span>

      <span
        aria-hidden
        className={cn(
          "flex size-7 items-center justify-center rounded-full bg-background text-sky shadow-md ring-1 ring-border/50",
          "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark ? "translate-x-10" : "translate-x-0",
        )}
      >
        <span
          className={cn(
            "absolute transition-all duration-300 ease-out",
            isDark
              ? "scale-0 rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100",
          )}
        >
          <AiOutlineSun className="size-5" />
        </span>
        <span
          className={cn(
            "absolute transition-all duration-300 ease-out",
            isDark
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 -rotate-90 opacity-0",
          )}
        >
          <AiOutlineMoon className="size-5" />
        </span>
      </span>
    </button>
  );
}
