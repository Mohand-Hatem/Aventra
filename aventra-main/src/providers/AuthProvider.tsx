"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { fetchAuthUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/auth-store";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const setUserInfo = useAuthStore((s) => s.setUserInfo);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    fetchAuthUser()
      .then((user) => {
        if (!user) {
          clearAuth();
          return;
        }
        setUserInfo(user);
        if (sessionStorage.getItem("googleLogin")) {
          sessionStorage.removeItem("googleLogin");
          toast.success("Logged Successfully: Welcome back!");
        }
      })
      .catch((error) => {
        sessionStorage.removeItem("googleLogin");
        console.log(error);
        clearAuth(); 
      });
  }, []);

  return <>{children}</>;
};