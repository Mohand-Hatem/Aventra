
export const queryKeys = {
  auth: {
    user: ["user"] as const,
    googleCallback: ["auth", "google-callback"] as const,
  },
  candidates: {
    all: ["candidates"] as const,
    top: () => ["candidates", "top"] as const,
    detail: (id: string) => [...queryKeys.candidates.all, { id }] as const,
  },
};
