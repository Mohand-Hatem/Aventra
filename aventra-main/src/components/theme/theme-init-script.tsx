import Script from "next/script";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";

export function ThemeInitScript() {
  return (
    <Script
      id="theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}