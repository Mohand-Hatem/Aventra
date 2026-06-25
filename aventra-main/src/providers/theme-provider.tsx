"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * React 19 warns when it sees an inline <script> tag inside any client
 * component during hydration: "Scripts inside React components are never
 * executed when rendering on the client."
 *
 * next-themes intentionally injects such a script for FOUC prevention —
 * it runs correctly during SSR before React hydrates, so the warning is a
 * false positive.  We silence it here, in dev only, for this one message.
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const _orig = console.error.bind(console);
  console.error = (...args: Parameters<typeof console.error>) => {
    if (typeof args[0] === "string" && args[0].includes("script tag")) {
      return; // swallow the next-themes false-positive
    }
    _orig(...args);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
