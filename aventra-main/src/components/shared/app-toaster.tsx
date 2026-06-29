"use client";

import { Toaster } from "react-hot-toast";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const toastStyle = {
  background: "var(--card)",
  color: "var(--card-foreground)",
  border: "1px solid var(--border)",
  boxShadow: "var(--shadow-card-value)",
  borderRadius: "var(--radius-lg)",
} as const;

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: toastStyle,
        success: {
          duration: 3000,
          className: "toast-success",
          icon: (
            <FiCheckCircle className="size-5 shrink-0 text-primary dark:text-sky" />
          ),
        },
        error: {
          duration: 3000,
          className: "toast-error",
          icon: (
            <FiXCircle className="size-5 shrink-0 text-destructive" />
          ),
        },
      }}
    />
  );
}
