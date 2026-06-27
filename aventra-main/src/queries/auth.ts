
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import type {
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  MeResponse,
} from "@/types/auth";

const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await apiClient.post<LoginResponse>("/auth/login", data);
  return res.data;
};

const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  const res = await apiClient.post<ForgotPasswordResponse>("/auth/forgot-password", data);
  return res.data;
};

const verifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  const res = await apiClient.post<VerifyOtpResponse>("/auth/verify-otp", data);
  return res.data;
};

const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const res = await apiClient.post<ResetPasswordResponse>("/auth/reset-password", data);
  return res.data;
};

const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout");
};

const getCurrentUser = async (): Promise<MeResponse> => {
  const res = await apiClient.get<MeResponse>("/me");
  return res.data;
};

const refreshToken = async (): Promise<void> => {
  await apiClient.post("/auth/refresh");
};

export function useLoginMutation() {
  return useMutation({ mutationFn: login ,onSuccess: (data) => console.log (data)});
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: forgotPassword });
}

export function useVerifyOtpMutation() {
  return useMutation({ mutationFn: verifyOtp });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: resetPassword });
}

export function useLogoutMutation() {
  return useMutation({ mutationFn: logout });
}

export function useCurrentUserQuery(enabled = false) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: getCurrentUser,
    enabled,
    retry: false,
  });
}

export function useRefreshTokenMutation() {
  return useMutation({ mutationFn: refreshToken });
}