import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { fetchAuthUser, GOOGLE_LOGIN_PENDING_KEY } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/routing";
import { APP_ROUTES } from "@/constants/routes";
import { queryKeys } from "@/constants/query-keys";
import { logAuth, logAuthError, logAuthWarn } from "@/lib/auth-debug";
import { AxiosError } from "axios";

export const useGoogleCallback = () => {
  const setUserInfo = useAuthStore((state) => state.setUserInfo);
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.auth.googleCallback,
    queryFn: fetchAuthUser,
    retry: false,
  });

  useEffect(() => {
    logAuth("googleCallback", "query state", {
      isPending: query.isPending,
      isSuccess: query.isSuccess,
      isError: query.isError,
      data: query.data
        ? { id: query.data.id, email: query.data.email }
        : query.data,
      error: query.isError
        ? {
            status: (query.error as AxiosError)?.response?.status,
            data: (query.error as AxiosError)?.response?.data,
            message: (query.error as AxiosError)?.message,
          }
        : null,
      pendingGoogle: sessionStorage.getItem(GOOGLE_LOGIN_PENDING_KEY),
    });

    if (query.isPending) return;

    const pendingGoogle = sessionStorage.getItem(GOOGLE_LOGIN_PENDING_KEY);

    if (query.data) {
      logAuth("googleCallback", "success — redirecting home", {
        user: { id: query.data.id, email: query.data.email },
      });
      sessionStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
      setUserInfo(query.data);
      queryClient.setQueryData(queryKeys.auth.user, query.data);
      if (pendingGoogle) {
        toast.success("Logged Successfully: Welcome back!");
      }
      router.replace(APP_ROUTES.home);
      return;
    }

    if (query.isError || query.isSuccess) {
      if (query.isError) {
        logAuthError("googleCallback", "failed with error — redirecting to login", {
          error: query.error,
        });
      } else {
        logAuthWarn(
          "googleCallback",
          "success but no user (likely 401) — redirecting to login"
        );
      }
      sessionStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
      if (pendingGoogle) {
        toast.error("Failed to login with Google");
      }
      router.replace(APP_ROUTES.login);
    }
  }, [
    query.data,
    query.isError,
    query.isSuccess,
    query.isPending,
    queryClient,
    router,
    setUserInfo,
  ]);

  return query;
};
