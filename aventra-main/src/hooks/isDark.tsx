"use client";
import { useTheme } from "@/providers/theme-provider";

export function useIsDark() {
  const { resolvedTheme } = useTheme();

  return resolvedTheme === "dark";
}
