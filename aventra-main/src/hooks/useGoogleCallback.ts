import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { fetchAuthUser, GOOGLE_LOGIN_PENDING_KEY } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/routing";
import { APP_ROUTES } from "@/constants/routes";
import { queryKeys } from "@/constants/query-keys";



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
    if (query.isPending) return;
    const pendingGoogle = sessionStorage.getItem(GOOGLE_LOGIN_PENDING_KEY);
    if (query.data) {
      sessionStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
      console.log("query.data", query.data);
      setUserInfo(query.data);
      queryClient.setQueryData(queryKeys.auth.user, query.data);
      if (pendingGoogle) {
        toast.success("Logged Successfully: Welcome back!");
      }
      router.replace(APP_ROUTES.home);
      return;
    }


    if (query.isError || query.isSuccess) {
      sessionStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
      if (pendingGoogle) {
        toast.error("Failed to login with Google");
        console.log(query.error);
      }
      router.replace(APP_ROUTES.login);
    }

  }, [

    query.data,
    query.isError,
    query.isSuccess,
    query.isPending,
    query.error,
    queryClient,
    router,
    setUserInfo,
  ]);
  return query;

};

