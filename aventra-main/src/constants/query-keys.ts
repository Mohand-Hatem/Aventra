export const queryKeys = {
  ai: {
    usage: ["ai", "usage"] as const,
  },
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
  company: {
    searchHistory: ["company", "search-history"] as const,
    filteredCvs: (params: unknown) =>
      ["company", "filtered-cvs", params] as const,
  },
};
export const GOOGLE_LOGIN_PENDING_KEY = "googleLogin";
export const PAYMENT_PENDING_KEY = "paymentPending";
export const PAYMOB_ORDER_ID_KEY = "paymobOrderId";
