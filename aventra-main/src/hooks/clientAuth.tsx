import axiosInstance from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// ─── Get User ───────────────────────────────
export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => axiosInstance.get("/users/me").then((r) => r.data),
  });
};

// ─── Login ──────────────────────────────────
export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      axiosInstance.post("/auth/login", credentials).then((r) => r.data),

    onSuccess: (data) => {
      // ✅ setQueryData: السيرفر رجع اليوزر → حطه في الـ cache فوراً
      // مفيش request تاني لـ /auth/me
      queryClient.setQueryData(["user"], data.user);
      router.push("/profile");
    },
  });
};

// ─── Update Profile ─────────────────────────
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      axiosInstance.put("/user/profile", data).then((r) => r.data),

    onSuccess: (data) => {
      // ✅ setQueryData: السيرفر رجع الداتا الجديدة → حدّث الـ cache
      // مفيش request تاني
      queryClient.setQueryData(["user"], data.user);
    },
  });
};

// ─── Logout ─────────────────────────────────
export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      // ✅ setQueryData: مسح اليوزر من الـ cache
      queryClient.setQueryData(["user"], null);
      router.push("/login");
    },
  });
};
