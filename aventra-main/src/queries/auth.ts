import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import api from "@/lib/axios";
import type { RegisterPayload, RegisterResponse } from "@/types/auth";

type ApiErrorResponse = {
  success?: boolean;
  message?: string;
  errors?: {
    message?: string;
  }[];
};

export async function registerRequest(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  try {
    const { data } = await api.post<RegisterResponse>(
      "/auth/register",
      payload
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Registration failed. Please try again.";

      throw new Error(backendMessage);
    }

    throw new Error("Registration failed. Please try again.");
  }
}

export function useRegister() {
  return useMutation({
    mutationFn: registerRequest,
  });
}