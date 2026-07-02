"use client";

import { AppToaster } from "@/components/shared/app-toaster";
import { NavigationProgress } from "@/components/shared/NavigationProgress";
import { ReactQueryProvider } from "./react-query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./AuthProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <AuthProvider>
          <NavigationProgress />
          {children}
          <AppToaster />
        </AuthProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
