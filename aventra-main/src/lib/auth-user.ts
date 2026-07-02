import type { AuthUser } from "@/types/auth";
import { normalizeUserCvs } from "@/types/cv";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function normalizeAuthUser(raw: Record<string, unknown>): AuthUser {
  const maxToken = raw.maxToken ?? raw.max_token;
  const tokenUsage = raw.tokenUsage ?? raw.token_usage;

  return {
    ...(raw as AuthUser),
    id: String(raw.id ?? raw._id ?? ""),
    email: String(raw.email ?? ""),
    maxToken: typeof maxToken === "number" ? maxToken : undefined,
    tokenUsage: typeof tokenUsage === "number" ? tokenUsage : undefined,
    cvs: normalizeUserCvs(raw.cvs),
  };
}

export function parseAuthUserPayload(payload: unknown): AuthUser | null {
  if (!isRecord(payload)) return null;

  const nestedData = isRecord(payload.data) ? payload.data : null;
  const candidate =
    (isRecord(payload.user) ? payload.user : null) ??
    (nestedData && isRecord(nestedData.user) ? nestedData.user : null) ??
    nestedData;

  if (!isRecord(candidate) || !("email" in candidate)) return null;

  return normalizeAuthUser(candidate);
}
