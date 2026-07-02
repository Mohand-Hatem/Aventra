import {
  normalizeLocalizedName,
  type AuthUser,
  type LocalizedName,
} from "@/types/auth";
import { normalizeUserCvs } from "@/types/cv";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isLocalizedName(value: unknown): value is LocalizedName {
  return (
    isRecord(value) &&
    typeof value.en === "string" &&
    typeof value.ar === "string"
  );
}

function normalizeAuthUserName(value: unknown): string | LocalizedName {
  if (typeof value === "string") return value;
  if (isLocalizedName(value)) return normalizeLocalizedName(value);
  return "";
}

function normalizeAuthUserRole(
  value: unknown,
): AuthUser["role"] {
  if (value === "user" || value === "company" || value === "admin") {
    return value;
  }
  return "user";
}

export function normalizeAuthUser(raw: Record<string, unknown>): AuthUser {
  const maxToken = raw.maxToken ?? raw.max_token;
  const tokenUsage = raw.tokenUsage ?? raw.token_usage;
  const avatar = raw.avatar;
  const googleId = raw.googleId;

  return {
    id: String(raw.id ?? raw._id ?? ""),
    name: normalizeAuthUserName(raw.name),
    email: String(raw.email ?? ""),
    role: normalizeAuthUserRole(raw.role),
    avatar:
      typeof avatar === "string" || avatar === null ? avatar : undefined,
    plan: typeof raw.plan === "string" ? raw.plan : undefined,
    maxToken: typeof maxToken === "number" ? maxToken : undefined,
    tokenUsage: typeof tokenUsage === "number" ? tokenUsage : undefined,
    googleId:
      typeof googleId === "string" || googleId === null ? googleId : undefined,
    cvs: normalizeUserCvs(raw.cvs),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
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
