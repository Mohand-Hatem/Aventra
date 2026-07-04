import type { AxiosError } from "axios";
import type { TokenLimitErrorResponse } from "@/types/ai";

interface ApiErrorResponse {
  success?: boolean;
  code?: string;
  message?: string;
  tokenUsage?: number;
  maxToken?: number;
}

export function getTokenLimitError(error: unknown): TokenLimitErrorResponse | null {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const payload = axiosError.response?.data;

  if (axiosError.response?.status !== 403 || payload?.code !== "TOKEN_LIMIT_REACHED") {
    return null;
  }

  return {
    success: false,
    code: "TOKEN_LIMIT_REACHED",
    message:
      payload.message ??
      "Token limit reached. Your monthly token quota has been exhausted.",
    tokenUsage: typeof payload.tokenUsage === "number" ? payload.tokenUsage : 0,
    maxToken: typeof payload.maxToken === "number" ? payload.maxToken : 0,
  };
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message ?? fallback;
}
