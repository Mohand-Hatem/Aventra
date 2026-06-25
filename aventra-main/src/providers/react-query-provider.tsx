"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Creates a new QueryClient per-request (recommended by TanStack for Next.js).
 * Centralising defaults here means every useQuery in the app benefits
 * from the same caching / retry strategy without repeating config.
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds before a background refetch
        staleTime: 60 * 1000,
        // Never retry failed requests automatically (adjust per-query if needed)
        retry: 1,
        // Keep data in cache for 5 minutes after the last subscriber unmounts
        gcTime: 5 * 60 * 1000,
      },
    },
  });
}

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * useState ensures a single QueryClient instance lives for the lifetime
   * of this component (i.e. the browser tab), rather than being recreated
   * on every render.
   */
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
