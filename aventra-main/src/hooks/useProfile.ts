import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import { fetchAuthUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/types/auth";
import type { UpdateProfilePayload } from "@/schemas/profile";

const PROFILE_UPLOAD_TIMEOUT_MS = 120_000;

function extractUpdatedUser(data: unknown): AuthUser | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (record.user && typeof record.user === "object") {
    return record.user as AuthUser;
  }
  if (record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>;
    if (nested.user && typeof nested.user === "object") {
      return nested.user as AuthUser;
    }
  }
  if ("id" in record && "email" in record) {
    return record as unknown as AuthUser;
  }

  return null;
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
    ...extracted,
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

  const response = await axiosInstance.put("/users/update-profile", {
    name: payload.name,
  });

  return response.data;
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const setUserInfo = useAuthStore((state) => state.setUserInfo);
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
      const current = queryClient.getQueryData<AuthUser | null>(queryKeys.auth.user);
      let user = extractUpdatedUser(data);

      if (current) {
        user = mergeProfileIntoUser(current, payload, data);
      }

      if (payload.avatar) {
        try {
          const refetched = await fetchAuthUser();
          if (refetched) {
            user = refetched;
          }
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
        queryClient.setQueryData(queryKeys.auth.user, user);
        setUserInfo(user);
      } else {
        await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      }

      toast.success("Profile updated successfully");
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;

      if (axiosErr.code === "ECONNABORTED") {
        toast.error(
          "Upload timed out. If your profile was updated, refresh the page.",
        );
        return;
      }

      toast.error(
        axiosErr.response?.data?.message ??
          "Could not update profile. Please try again.",
      );
    },
  });

  return { ...mutation, uploadProgress };
}
