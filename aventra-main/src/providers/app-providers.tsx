"use client";

import { ReactNode } from "react";
import { ReactQueryProvider } from "./react-query-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "react-hot-toast";
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    
    <ReactQueryProvider>
      <ThemeProvider>{children}
        <Toaster
    position="top-right"
    reverseOrder={false}
    toastOptions={{
      duration: 4000,
      style: {
        borderRadius: "14px",
      },
    }}
  />
      </ThemeProvider>
    </ReactQueryProvider>
  );
}