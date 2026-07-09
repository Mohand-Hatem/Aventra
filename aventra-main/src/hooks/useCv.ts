import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import { useUser } from "@/hooks/useAuth";
import { getApiErrorMessage, getTokenLimitError } from "@/lib/ai-token-limit";
import type { CvAnalysis, CvProcessingStatus, CvScoreBreakdown } from "@/types/cv";
import type { TokenLimitErrorResponse } from "@/types/ai";

export function useUserCvs() {
  const { data: user, isLoading, isError, isFetching, refetch, error } =
    useUser();

  return {
    data: user?.cvs ?? [],
    isLoading,
    isError,
    isFetching,
    refetch,
    error,
  };
}

export type UploadCvResponse = {
  success?: boolean;
  message?: string;
  data?: {
    id?: string;
    url?: string;
    fileType?: string;
    fileName?: string;
    fileSize?: number;
    status?: CvProcessingStatus;
    uploadedAt?: string;
  };
};

export type AnalyzeCvResponse = {
  success?: boolean;
  message?: string;
  report?: {
    atsScore?: number;
    scoreBreakdown?: CvScoreBreakdown;
    parsedData?: unknown;
    aiAnalysis?: CvAnalysis;
  };
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    responseTimeMs?: number;
  };
};

export type DeleteCvResponse = {
  success?: boolean;
  message?: string;
};

async function uploadUserCv(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<UploadCvResponse>("/cv/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

async function analyzeUserCv(cvId: string) {
  const response = await axiosInstance.post<AnalyzeCvResponse>(
    `/analyze/${cvId}`,
    undefined,
    {
      // CV analysis can take tens of seconds; override the default 10s timeout.
      timeout: 120000,
    },
  );
  return response.data;
}

async function deleteUserCv(cvId: string) {
  const response = await axiosInstance.delete<DeleteCvResponse>(`/cv/${cvId}`);
  return response.data;
}

export function useUploadCv() {
  const queryClient = useQueryClient();
  const t = useTranslations("notifications");

  return useMutation({
    mutationFn: uploadUserCv,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      toast.success(t("cv.uploadSuccess"));
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? t("cv.uploadFailed"));
    },
  });
}

export function useAnalyzeCv() {
  const queryClient = useQueryClient();
  const t = useTranslations("notifications");
  const [tokenLimitError, setTokenLimitError] = useState<TokenLimitErrorResponse | null>(null);

  const mutation = useMutation({
    mutationFn: analyzeUserCv,
    onSuccess: async (payload) => {
      setTokenLimitError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user }),
        queryClient.invalidateQueries({ queryKey: queryKeys.ai.usage }),
      ]);
      toast.success(payload?.message ?? t("cv.analyzeStarted"));
    },
    onError: async (err) => {
      const tokenLimit = getTokenLimitError(err);
      setTokenLimitError(tokenLimit);

      if (tokenLimit) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.auth.user }),
          queryClient.invalidateQueries({ queryKey: queryKeys.ai.usage }),
        ]);
      }

      toast.error(getApiErrorMessage(err, t("cv.analyzeFailed")));
    },
  });

  return {
    ...mutation,
    isTokenLimitReached: !!tokenLimitError,
    tokenLimitError,
  };
}

export function useDeleteCv() {
  const queryClient = useQueryClient();
  const t = useTranslations("notifications");

  return useMutation({
    mutationFn: deleteUserCv,
    onSuccess: async (payload) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      toast.success(payload?.message ?? t("cv.deleteSuccess"));
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? t("cv.deleteFailed"));
    },
  });
}

export type CvDetailsResponse = {
  success: boolean;
  data: {
    _id: string;
    originalFile?: {
      url?: string;
      publicId?: string;
      fileType?: string;
      fileName?: string;
      fileSize?: number;
    };
    extractedText?: string;
    parsedData?: {
      contact?: { email?: string; phone?: string; linkedin?: string; github?: string; location?: string };
      skills?: { technical?: string[]; soft?: string[]; missingRecommended?: string[] };
      certifications?: { name?: string; issuer?: string; date?: string }[];
      experience?: { role?: string; company?: string; duration?: string; description?: string }[];
      education?: { degree?: string; institution?: string; graduationDate?: string }[];
      projects?: { title?: string; description?: string; technologies?: string[] }[];
    };
    aiAnalysis?: CvAnalysis;
    atsScore?: number;
  };
};

async function fetchCvDetails(cvId: string) {
  const response = await axiosInstance.get<CvDetailsResponse>(`/cv/${cvId}`);
  return response.data;
}

export function useCvDetails(cvId?: string) {
  return useQuery({
    queryKey: ["cv", cvId],
    queryFn: () => fetchCvDetails(cvId!),
    enabled: !!cvId,
    staleTime: 5 * 60 * 1000,
  });
}
