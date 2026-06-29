import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { fetchAuthUser, GOOGLE_LOGIN_PENDING_KEY } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/routing";
import { APP_ROUTES } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { AxiosError } from "axios";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 800;

export const useGoogleCallback = () => {
  const setUserInfo = useAuthStore((state) => state.setUserInfo);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double-invocation in React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    const pendingGoogle = sessionStorage.getItem(GOOGLE_LOGIN_PENDING_KEY);

    let attempt = 0;

    const tryFetch = async () => {
      while (attempt < MAX_RETRIES) {
        try {
          // Small delay on every attempt to give the backend session time to
          // propagate the cookie — especially important on first attempt.
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));

          const user = await fetchAuthUser();

          if (user) {
            sessionStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
            setUserInfo(user);
            queryClient.setQueryData(queryKeys.auth.user, user);
            if (pendingGoogle) {
              toast.success("Logged in successfully with Google!");
            }
            router.replace(APP_ROUTES.home);
            setIsPending(false);
            return;
          }
        } catch (err) {
          const axiosErr = err as AxiosError;
          const status = axiosErr?.response?.status;
          console.warn(
            `Google callback attempt ${attempt + 1}/${MAX_RETRIES} failed:`,
            status,
            axiosErr?.message
          );

          // If it's explicitly a 401 AND we've used up retries, give up.
          // For network errors or 5xx keep retrying.
          if (status === 401 && attempt >= MAX_RETRIES - 1) {
            break;
          }
        }

        attempt++;
      }

      // All retries exhausted
      sessionStorage.removeItem(GOOGLE_LOGIN_PENDING_KEY);
      if (pendingGoogle) {
        toast.error("Failed to login with Google. Please try again.");
      }
      setIsPending(false);
      router.replace(APP_ROUTES.login);
    };

    tryFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isPending };
};
