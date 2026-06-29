import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { fetchAuthUser } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/routing";
import { APP_ROUTES } from "@/constants/routes";
import { queryKeys } from "@/constants/query-keys";

export const useGoogleCallback = () => {
  const setUserInfo = useAuthStore((state) => state.setUserInfo);
  const router = useRouter();

  const query = useQuery({
    queryKey: queryKeys.auth.googleCallback,
    queryFn: fetchAuthUser,
    retry: false,
    
  });
  

  useEffect(() => {
    if (query.data) {
      setUserInfo(query.data);
      router.replace(APP_ROUTES.home);
    }

    if (query.isError) {
      router.replace(APP_ROUTES.login);
    }
  }, [query.data, query.isError, router, setUserInfo]);

  return query;
};