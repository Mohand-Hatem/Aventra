import axiosInstance from "@/lib/axios";
import { queryKeys } from "@/constants/query-keys";
import {  RegisterPayload } from "@/types/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { APP_ROUTES } from "@/constants/routes";

export const GOOGLE_LOGIN_PENDING_KEY = "googleLogin";

export function fetchAuthUser() {
  return axiosInstance
    .get("/auth/me")
    .then((r) => r.data.data?.user ?? null)
    .catch((err: AxiosError) => {
      throw err;
      
    });
}

export const useGoogleLogin = () => {
  return {
    login: (role: "user" | "company" = "user") => {
      sessionStorage.setItem(GOOGLE_LOGIN_PENDING_KEY, "1");
      window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google?role=${role}`;
    },
  };
};

export const useUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: fetchAuthUser,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setUserInfo = useAuthStore((state) => state.setUserInfo);
  const router = useRouter();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      axiosInstance.post("/auth/login", credentials).then((r) => r.data),
    onSuccess: (data) => {
      const user = data?.data?.user;
      queryClient.setQueryData(queryKeys.auth.user, user);
      toast.success("Logged Successfully: Welcome back!");
      setUserInfo(user);
      router.push("/");
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message ??
          "Something went wrong. Please try again."
      );
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const setUserInfo = useAuthStore((state) => state.setUserInfo);
  const router = useRouter();
  return useMutation({
    mutationFn: async (credentials: RegisterPayload) => {
      try {
        const response = await axiosInstance.post(
          "/auth/register",
          credentials
        );
        return { data: response.data, isExistingAccount: false as const };
      } catch (error) {
        const axiosErr = error as AxiosError<{ message?: string }>;
        console.log(axiosErr);
        const response = await axiosInstance.post("/auth/login", {
          email: credentials.email,
          password: credentials.password,
        });
        return { data: response.data, isExistingAccount: true as const };
      }
    },
    onSuccess: ({ data, isExistingAccount }) => {
      const user = data?.data?.user;
      queryClient.setQueryData(queryKeys.auth.user, user);
      setUserInfo(user);
      if (isExistingAccount) {
        toast.success("Welcome back! Signed in with your existing account.");
      } else {
        toast.success("Account created successfully");
      }
      router.push("/");
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message ??
          "Something went wrong. Please try again."
      );
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      axiosInstance.put("/user/profile", data).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.auth.user, data);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      useAuthStore.getState().clearAuth();
      sessionStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
      toast.success("Logged out successfully");
      queryClient.removeQueries({ queryKey: queryKeys.auth.user });
      router.push(APP_ROUTES.login);
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message ??
          "Something went wrong. Please try again."
      );
    },
  });
};
