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

  if (!response.ok) {
    let errorMessage = "Failed to send message";
    try {
      const data = (await response.json()) as ContactResponse;
      errorMessage = data.message ?? errorMessage;
    } catch {
      // ignore JSON parse error for non-JSON responses
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as ContactResponse;
}

export function useContact() {
  const t = useTranslations("notifications.contact");

  return useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => {
      toast.success(t("successSent"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("errorFailed"));
    },
  });
}
