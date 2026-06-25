/**
 * Folder: src/constants
 * File: query-keys.ts
 * Purpose:
 * - Central place for React Query key definitions.
 * - Prevents key duplication and typos.
 *
 * Example (when implementing later):
 * - queryKeys.auth.me = ["auth", "me"]
 * - queryKeys.cv.analysisById(id) = ["cv", "analysis", id]
 */
export const queryKeys = {
  candidates: {
    all: ["candidates"] as const,
    top: () => ["candidates", "top"] as const,
    detail: (id: string) => [...queryKeys.candidates.all, { id }] as const,
  },
};
