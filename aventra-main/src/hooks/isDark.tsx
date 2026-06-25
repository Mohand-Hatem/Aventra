"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useIsDark() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return false;
  
  return resolvedTheme === "dark";
}