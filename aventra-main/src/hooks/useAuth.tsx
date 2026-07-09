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
import { useTranslations } from "next-intl";
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
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: fetchAuthUser,
    initialData: () => useAuthStore.getState().userInfo ?? undefined,
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("notifications");
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      axiosInstance.post("/auth/login", credentials).then((r) => r.data),
    onSuccess: async (data) => {
      const user = parseAuthUserPayload(data);
      syncAuthUser(queryClient, user);
      toast.success(t("auth.loginSuccess"));
      router.push("/");
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? t("genericError"));
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("notifications");
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
      if (isExistingAccount) {
        toast.success(t("auth.registerExistingAccount"));
      } else {
        toast.success(t("auth.registerSuccess"));
      }
      router.push("/");
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? t("genericError"));
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("notifications");

  return useMutation({
    mutationFn: () => axiosInstance.post("/auth/logout"),
    onSuccess: () => {
      sessionStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
      toast.success(t("auth.logoutSuccess"));
      syncAuthUser(queryClient, null);
      router.push(APP_ROUTES.login);
    },
    onError: (err) => {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? t("genericError"));
    },
  });
};
