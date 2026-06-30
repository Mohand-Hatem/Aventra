import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import type { UserCv } from "@/types/cv";

export async function fetchUserCvs(): Promise<UserCv[]> {
  const response = await axiosInstance.get("/cv/my-cvs");
  const data = response.data?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(response.data?.cvs)) return response.data.cvs;

  return [];
}

export function useUserCvs() {
  return useQuery({
    queryKey: queryKeys.cv.mine,
    queryFn: fetchUserCvs,
  });
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

  return useMutation({
    mutationFn: uploadUserCv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cv.mine });
      toast.success("CV uploaded successfully");
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message ??
          "Could not upload CV. Please try again.",
      );
    },
  });
}
