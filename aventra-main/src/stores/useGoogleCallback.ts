// hooks/useGoogleCallback.ts
import { useQuery } from "@tanstack/react-query";

import { useEffect } from "react";
import { useAuthStore } from "./auth-store";
import axiosInstance from "@/lib/axios";
import { useRouter } from "@/i18n/routing";
import { APP_ROUTES } from "@/constants/routes";
import { toast } from "react-hot-toast";


const fetchMe = async () => {
  const res = await axiosInstance.get(`/auth/me`).then((res) => res.data);

  return res.user;
};

export const useGoogleCallback = () => {
  const { setUserInfo } = useAuthStore();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setUserInfo(query.data);
      router.replace(APP_ROUTES.home);
    }

    if (query.isError) {
      toast.error("Failed to login with Google");
      router.replace(APP_ROUTES.login);
    }
  }, [query.data, query.isError]);

  return query;
};