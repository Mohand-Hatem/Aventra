export interface TokenLimitErrorResponse {
  success: false;
  code: "TOKEN_LIMIT_REACHED";
  message: string;
  tokenUsage: number;
  maxToken: number;
}

export interface AiUsageBreakdown {
  embeddingTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalTokensSpent: number;
}

export interface AiUsageData {
  plan: string;
  tokenUsage: number;
  maxToken: number;
  tokenUsagePercent: number;
  aiCallsCount: number;
  breakdown: AiUsageBreakdown;
  avgResponseTimeMs: number;
  analyzedCVs: number;
  totalCVs: number;
}

export interface AiUsageResponse {
  success: boolean;
  data: AiUsageData;
}
