"use client";

import { AppToaster } from "@/components/shared/app-toaster";
import { ReactQueryProvider } from "./react-query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./AuthProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
    <ReactQueryProvider>
      <AuthProvider>
        {children}
        <AppToaster />
      </AuthProvider>
    </ReactQueryProvider>
  </ThemeProvider>
  );
}
