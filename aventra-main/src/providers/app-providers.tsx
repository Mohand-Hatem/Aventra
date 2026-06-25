"use client";

import { ReactQueryProvider } from "./react-query-provider";
import { ThemeProvider } from "./theme-provider";

/**
 * AppProviders — single entry-point for all root providers.
 * Add new providers here so layout.tsx stays clean.
 *
 * Order matters: ThemeProvider is outermost so every component
 * (including query-fetching ones) can read the current theme.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        {children}
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
