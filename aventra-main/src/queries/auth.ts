/**
 * Folder: src/queries
 * File: auth.ts
 * Purpose:
 * - TanStack Query hooks for authentication.
 * - useLoginMutation  → POST /auth/login
 * - useRegisterMutation → POST /auth/register
 * - useCurrentUserQuery → GET /auth/me
 * - useLogoutMutation → POST /auth/logout
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/axios";
import type { LoginPayload, RegisterPayload, AuthResponse } from "@/types/auth";

// ── Query Keys ─────────────────────────────────────────
export const authKeys = {
  me: ["auth", "me"] as const,
};

// ── GET /auth/me ────────────────────────────────────────
export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const res = await apiClient.get<AuthResponse>("/auth/me");
      return res.data.data.user;
    },
    retry: false, // لو مش عامل login مش هيحاول تاني
    staleTime: 5 * 60 * 1000, // بيفضل cached 5 دقايق
  });
}

// ── POST /auth/login ────────────────────────────────────
export function useLoginMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await apiClient.post<AuthResponse>("/auth/login", payload);
      return res.data.data.user;
    },
    onSuccess: (user) => {
      // بيحفظ بيانات الـ user في الـ cache
      queryClient.setQueryData(authKeys.me, user);
      // بيروح للـ dashboard بناءً على الـ role
      if (user.role === "admin") {
        router.push("/dashboard");
      } else if (user.role === "company") {
        router.push("/company/search");
      } else {
        router.push("/user/upload-cv");
      }
    },
  });
}

// ── POST /auth/register ─────────────────────────────────
export function useRegisterMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const res = await apiClient.post<AuthResponse>("/auth/register", payload);
      return res.data.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
      if (user.role === "company") {
        router.push("/company/search");
      } else {
        router.push("/user/upload-cv");
      }
    },
  });
}

// ── POST /auth/logout ───────────────────────────────────
export function useLogoutMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSuccess: () => {
      // بيمسح كل الـ cache
      queryClient.clear();
      router.push("/login");
    },
  });
}
