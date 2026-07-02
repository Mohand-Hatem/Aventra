import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import type { ContactSchema } from "@/schemas/contact";

type ContactResponse = {
  success: boolean;
  message?: string;
};

async function sendContactMessage(
  payload: ContactSchema
): Promise<ContactResponse> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ContactResponse;

  if (!response.ok) {
    throw new Error(data.message ?? "Failed to send message");
  }

  return data;
}

export function useContact() {
  const t = useTranslations("contact");

  return useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => {
      toast.success(t("notifications.successSent"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("notifications.errorFailed"));
    },
  });
}
