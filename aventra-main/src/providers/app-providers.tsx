

"use client";

import { ThemeProvider } from "next-themes";
import { ReactQueryProvider } from "@/providers/react-query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </ReactQueryProvider>
  );
}