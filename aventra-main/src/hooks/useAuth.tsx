import axiosInstance from "@/lib/axios";
import { parseAuthUserPayload } from "@/lib/auth-user";
import { queryKeys } from "@/constants/query-keys";
import { RegisterPayload } from "@/types/auth";
import type { AuthUser } from "@/types/auth";
import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { APP_ROUTES } from "@/constants/routes";
import { GOOGLE_LOGIN_PENDING_KEY } from "@/constants/query-keys";

export function fetchAuthUser(): Promise<AuthUser | null> {
  return axiosInstance
    .get("/users/me")
    .then((response) => parseAuthUserPayload(response.data))
    .catch((err: AxiosError) => {
      throw err;
    });
}

export function syncAuthUser(
  queryClient: QueryClient,
  user: AuthUser | null | undefined,
) {
  if (user) {
    queryClient.setQueryData(queryKeys.auth.user, user);
    useAuthStore.getState().setUserInfo(user);
    return;
  }

  queryClient.setQueryData(queryKeys.auth.user, null);
  useAuthStore.getState().clearAuth();
}

export const useGoogleLogin = () => {
  return {
    login: (role: "user" | "company" = "user") => {
      sessionStorage.setItem(GOOGLE_LOGIN_PENDING_KEY, "1");
      window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/google?role=${role}`;
    },
  };
};

type UseUserOptions = {
  enabled?: boolean;
};

export const useUser = (options?: UseUserOptions) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: async () => {
      const user = await fetchAuthUser();
      syncAuthUser(queryClient, user);
      return user;
    },
    initialData: () => useAuthStore.getState().userInfo ?? undefined,
    enabled: options?.enabled ?? true,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      axiosInstance.post("/auth/login", credentials).then((r) => r.data),
    onSuccess: async (data) => {
      const user = parseAuthUserPayload(data);
      syncAuthUser(queryClient, user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      toast.success("Logged Successfully: Welcome back!");
      router.push("/");
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message ??
          "Something went wrong. Please try again.",
      );
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (credentials: RegisterPayload) => {
      try {
        const response = await axiosInstance.post(
          "/auth/register",
          credentials,
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
    onSuccess: async ({ data, isExistingAccount }) => {
      const user = parseAuthUserPayload(data);
      syncAuthUser(queryClient, user);
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
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
          "Something went wrong. Please try again.",
      );
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      sessionStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
      toast.success("Logged out successfully");
      syncAuthUser(queryClient, null);
      router.push(APP_ROUTES.login);
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message ??
          "Something went wrong. Please try again.",
      );
    },
  });
};
