import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import { fetchAuthUser, syncAuthUser } from "@/hooks/useAuth";
import type { AuthUser } from "@/types/auth";
import type { UpdateProfilePayload } from "@/schemas/profile";

const PROFILE_UPLOAD_TIMEOUT_MS = 120_000;

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

import { parseAuthUserPayload } from "@/lib/auth-user";

function extractUpdatedUser(data: unknown): AuthUser | null {
  return parseAuthUserPayload(data);
}

function extractAvatarUrl(data: unknown): string | null | undefined {
  if (!data || typeof data !== "object") return undefined;
  const record = data as Record<string, unknown>;

  if (typeof record.avatar === "string") return record.avatar;

  if (record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>;
    if (typeof nested.avatar === "string") return nested.avatar;
    if (nested.user && typeof nested.user === "object") {
      return (nested.user as AuthUser).avatar;
    }
  }

  if (record.user && typeof record.user === "object") {
    return (record.user as AuthUser).avatar;
  }

  return undefined;
}

function mergeProfileIntoUser(
  current: AuthUser,
  payload: UpdateProfilePayload,
  response: unknown,
): AuthUser {
  const extracted = extractUpdatedUser(response);
  const avatarUrl = extractAvatarUrl(response);

  return {
    ...current,
    ...(extracted || {}),
    // Safe fallbacks for fields that the update endpoint might not return or populate
    cvs: extracted?.cvs && extracted.cvs.length > 0 ? extracted.cvs : current.cvs,
    plan: extracted?.plan ?? current.plan,
    maxToken: extracted?.maxToken ?? current.maxToken,
    tokenUsage: extracted?.tokenUsage ?? current.tokenUsage,
    searchCount: extracted?.searchCount ?? current.searchCount,
    googleId: extracted?.googleId ?? current.googleId,
    createdAt: extracted?.createdAt ?? current.createdAt,
    updatedAt: extracted?.updatedAt ?? current.updatedAt,
    // Explicit overrides for the fields we know we just updated
    name: payload.name ?? extracted?.name ?? current.name,
    avatar: avatarUrl ?? extracted?.avatar ?? current.avatar,
  };
}

async function updateUserProfile(
  payload: UpdateProfilePayload,
  onUploadProgress?: (percent: number) => void,
) {
  if (payload.avatar) {
    const formData = new FormData();

    if (payload.name) {
      formData.append("name", JSON.stringify(payload.name));
    }

    formData.append("avatar", payload.avatar);

    const response = await axiosInstance.put("/users/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: PROFILE_UPLOAD_TIMEOUT_MS,
      onUploadProgress: (event) => {
        if (!event.total) return;
        onUploadProgress?.(
          Math.min(100, Math.round((event.loaded * 100) / event.total)),
        );
      },
    });

    return response.data;
  }

  console.log("[DEBUG] Sending profile update payload to backend:", {
    name: payload.name,
    hasAvatar: !!payload.avatar,
  });

  const response = await axiosInstance.put("/users/update-profile", {
    name: payload.name,
  });

  console.log("[DEBUG] Backend JSON response:", response.data);
  return response.data;
}

// ── useUpdateUserProfile ────────────────────────────────────────────────────
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const t = useTranslations("notifications.profile");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      if (payload.avatar) {
        setUploadProgress(0);
      } else {
        setUploadProgress(null);
      }
      return updateUserProfile(payload, setUploadProgress);
    },
    onSettled: () => {
      setUploadProgress(null);
    },
    onSuccess: async (data, payload) => {
      console.log("[DEBUG] Mutation onSuccess triggered. Data:", data, "Payload:", payload);
      const current = queryClient.getQueryData<AuthUser | null>(queryKeys.auth.user);
      let user = extractUpdatedUser(data);
      console.log("[DEBUG] Extracted user from backend response:", user);

      if (current) {
        user = mergeProfileIntoUser(current, payload, data);
        console.log("[DEBUG] Merged user state:", user);
      }

      if (payload.avatar) {
        try {
          const refetched = await fetchAuthUser();
          if (refetched) user = refetched;
        } catch {
          // Keep merged user if refetch fails.
        }
      } else if (!user) {
        try {
          user = await fetchAuthUser();
        } catch {
          // Ignore refetch errors.
        }
      }

      if (user) {
        syncAuthUser(queryClient, user);
      }
      
      // Always invalidate to ensure backend state is strictly synced
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });

      toast.success(t("updateSuccess"));
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      if (axiosErr.code === "ECONNABORTED") {
        toast.error(t("uploadTimeout"));
        return;
      }
      toast.error(axiosErr.response?.data?.message ?? t("updateFailed"));
    },
  });

  return { ...mutation, uploadProgress };
}

// ── useDeleteAvatar ─────────────────────────────────────────────────────────
export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const t = useTranslations("notifications.profile");

  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete("/users/avatar");
      return response.data;
    },
    onSuccess: async () => {
      // Update cache immediately with default avatar
      const current = queryClient.getQueryData<AuthUser | null>(queryKeys.auth.user);
      if (current) {
        syncAuthUser(queryClient, { ...current, avatar: DEFAULT_AVATAR });
      }

      // Refetch to get fresh data from server
      try {
        const refetched = await fetchAuthUser();
        if (refetched) syncAuthUser(queryClient, refetched);
      } catch {
        await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      }

      toast.success(t("deletePhotoSuccess"));
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? t("deletePhotoFailed"));
    },
  });
}
