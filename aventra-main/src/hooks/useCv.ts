import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import { useUser } from "@/hooks/useAuth";

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

async function uploadUserCv(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post("/users/upload-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

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
