export const queryKeys = {
  auth: {
    user: ["user"] as const,
  },
  cv: {
    mine: ["cv", "mine"] as const, // deprecated: CVs now come from queryKeys.auth.user
  },
  profile: {
    update: ["profile", "update"] as const,
  },
  candidates: {
    all: ["candidates"] as const,
    top: () => ["candidates", "top"] as const,
    detail: (id: string) => [...queryKeys.candidates.all, { id }] as const,
  },
};
export const GOOGLE_LOGIN_PENDING_KEY = "googleLogin";
