"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function NavigationProgress() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;
      if (nextUrl.pathname === window.location.pathname) return;

      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-100 h-0.5 bg-primary transition-opacity duration-200 dark:bg-sky",
        isNavigating ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className={cn(
          "h-full w-full origin-left scale-x-0 bg-current transition-transform duration-300",
          isNavigating && "animate-pulse scale-x-100",
        )}
      />
    </div>
  );
}
