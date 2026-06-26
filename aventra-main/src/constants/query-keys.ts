

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  cv: {
    analysisById: (id: string) => ["cv", "analysis", id] as const,
    list: ["cv", "list"] as const,
  },
} as const;