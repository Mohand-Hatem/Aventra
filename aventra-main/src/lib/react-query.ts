/**
 * Folder: src/lib
 * File: react-query.ts
 * Purpose:
 * - Central React Query client configuration.
 * - Defines defaults like stale time, retries, and gc behavior.
 *
 * Example (when implementing later):
 * - export function createQueryClient() { return new QueryClient({...}) }
 */


import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}