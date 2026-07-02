import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { fetchAuthUser, syncAuthUser } from "@/hooks/useAuth";
import { useRouter } from "@/i18n/routing";
import { useQueryClient } from "@tanstack/react-query";
import {
  PAYMENT_PENDING_KEY,
  PAYMOB_ORDER_ID_KEY,
} from "@/constants/query-keys";
import { APP_ROUTES } from "@/constants/routes";
import { AxiosError } from "axios";

const POLL_INTERVAL_MS = 2000;
const AUTH_MAX_RETRIES = 5;
const AUTH_RETRY_DELAY_MS = 800;
const MAX_POLLS = 45;

type PaymentUrlHints = {
  urlSuccess: boolean;
  urlFailed: boolean;
  urlPending: boolean;
};

function getPaymentUrlHints(): PaymentUrlHints {
  const params = new URLSearchParams(window.location.search);
  const success = params.get("success");
  const pending = params.get("pending");

  return {
    urlSuccess: success === "true" || success === "1",
    urlFailed: success === "false" || success === "0",
    urlPending: pending === "true" || pending === "1",
  };
}

function resolveOrderId(): string | null {
  const params = new URLSearchParams(window.location.search);
  const fromUrl =
    params.get("id") ?? params.get("order_id") ?? params.get("orderId");
  const fromStorage = localStorage.getItem(PAYMOB_ORDER_ID_KEY);
  const orderId = fromStorage ?? fromUrl;

  if (fromUrl && !fromStorage) {
    localStorage.setItem(PAYMOB_ORDER_ID_KEY, fromUrl);
  }

  return orderId;
}

function normalizePaymentStatus(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  const direct = record.status ?? record.paymentStatus ?? record.payment_status;

  if (typeof direct === "string") return direct.toLowerCase();

  if (record.data && typeof record.data === "object") {
    const nested = record.data as Record<string, unknown>;
    const nestedStatus =
      nested.status ?? nested.paymentStatus ?? nested.payment_status;
    if (typeof nestedStatus === "string") return nestedStatus.toLowerCase();
  }

  return null;
}

function isPaidStatus(status: string | null): boolean {
  return (
    status === "paid" ||
    status === "success" ||
    status === "successful" ||
    status === "completed"
  );
}

function isFailedStatus(status: string | null): boolean {
  return (
    status === "failed" ||
    status === "failure" ||
    status === "declined" ||
    status === "cancelled" ||
    status === "canceled"
  );
}

async function restoreAuthWithRetries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  for (let attempt = 0; attempt < AUTH_MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, AUTH_RETRY_DELAY_MS));
      }
      const user = await fetchAuthUser();
      if (user) {
        syncAuthUser(queryClient, user);
        return true;
      }
    } catch (err) {
      const status = (err as AxiosError)?.response?.status;
      console.warn(
        `Payment auth restore attempt ${attempt + 1}/${AUTH_MAX_RETRIES} failed:`,
        status,
      );
    }
  }
  return false;
}

export function usePaymentCallback() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const urlHints = getPaymentUrlHints();
    const orderId = resolveOrderId();

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let pollCount = 0;
    let completed = false;

    const finish = () => {
      if (intervalId) clearInterval(intervalId);
      localStorage.removeItem(PAYMOB_ORDER_ID_KEY);
      sessionStorage.removeItem(PAYMENT_PENDING_KEY);
    };

    const completeSuccess = async () => {
      if (completed || cancelled) return;
      completed = true;
      finish();
      toast.success("Payment successful!");

      const restored = await restoreAuthWithRetries(queryClient);
      if (!restored) {
        toast.error(
          "Payment confirmed but session expired. Please sign in again.",
        );
        setIsPending(false);
        router.replace(APP_ROUTES.login);
        return;
      }

      setIsPending(false);
      router.replace(APP_ROUTES.home);
    };

    const completeFailure = () => {
      if (completed || cancelled) return;
      completed = true;
      finish();
      toast.error("Payment failed.");
      setIsPending(false);
      router.replace(APP_ROUTES.pricing);
    };

    const shouldTrustUrlSuccess = () =>
      urlHints.urlSuccess && !urlHints.urlFailed && !urlHints.urlPending;

    const checkStatus = async () => {
      if (completed || cancelled) return;

      pollCount += 1;

      if (urlHints.urlFailed) {
        completeFailure();
        return;
      }

      if (!orderId) {
        if (shouldTrustUrlSuccess()) {
          await completeSuccess();
          return;
        }
        completed = true;
        finish();
        toast.error("Payment session not found.");
        setIsPending(false);
        router.replace(APP_ROUTES.pricing);
        return;
      }

      try {
        const { data } = await axiosInstance.get(
          `/users/payment-status/${orderId}`,
        );

        if (cancelled || completed) return;

        const status = normalizePaymentStatus(data);

        if (isPaidStatus(status)) {
          await completeSuccess();
          return;
        }

        if (isFailedStatus(status)) {
          completeFailure();
          return;
        }

        if (shouldTrustUrlSuccess()) {
          await completeSuccess();
          return;
        }

        if (pollCount >= MAX_POLLS) {
          if (shouldTrustUrlSuccess()) {
            await completeSuccess();
          } else {
            completed = true;
            finish();
            toast.error("Payment confirmation timed out. Please try again.");
            setIsPending(false);
            router.replace(APP_ROUTES.pricing);
          }
        }
      } catch (err) {
        console.warn("Payment status poll failed:", err);

        if (shouldTrustUrlSuccess()) {
          await completeSuccess();
          return;
        }

        if (pollCount >= MAX_POLLS) {
          if (shouldTrustUrlSuccess()) {
            await completeSuccess();
          } else {
            completed = true;
            finish();
            toast.error("Unable to confirm payment. Please contact support.");
            setIsPending(false);
            router.replace(APP_ROUTES.pricing);
          }
        }
      }
    };

    void checkStatus();
    intervalId = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [queryClient, router]);

  return { isPending };
}
