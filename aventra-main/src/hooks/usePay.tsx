import axiosInstance from "@/lib/axios";
import { PayRequest, PayResponse } from "@/types/pricing";
import { useMutation } from "@tanstack/react-query";

export function usePayWithPaymob() {
    return useMutation({
      mutationFn: async (body: PayRequest) => {
        const { data } = await axiosInstance.post<PayResponse>(
          "/users/pay",
          body
        );
  
        return data;
      },
    });
  }