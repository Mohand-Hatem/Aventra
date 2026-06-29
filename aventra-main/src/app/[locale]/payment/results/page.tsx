"use client";

import { useEffect } from "react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useRouter } from "@/i18n/routing";
import { queryKeys } from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";

export default function PaymentResult() {
    const router = useRouter();
    const queryClient = useQueryClient();
    useEffect(() => {
        const orderId = localStorage.getItem("paymobOrderId");
        if (!orderId) return;
        const interval = setInterval(async () => {
            const { data } = await axiosInstance.get(
                `/users/payment-status/${orderId}`
            );
            if (data.status === "Paid") {
                clearInterval(interval);
                localStorage.removeItem("paymobOrderId");
                toast.success("Payment Successful");
                await queryClient.invalidateQueries({
                    queryKey: queryKeys.auth.user,
                });
                router.push("/user/profile");
            }
            if (data.status === "Failed") {
                clearInterval(interval);
                localStorage.removeItem("paymobOrderId");
                toast.error("Payment Failed");
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-screen items-center justify-center">
            Confirming payment...
        </div>
    );
}