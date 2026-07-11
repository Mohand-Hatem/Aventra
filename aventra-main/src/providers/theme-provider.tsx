"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  startTransition,
  type ReactNode,
} from "react";

const STORAGE_KEY = "aventra-theme";
const RESOLVED_THEME_COOKIE_KEY = "aventra-resolved-theme";
const THEMES = ["light", "dark", "system"] as const;

export type ThemeSetting = (typeof THEMES)[number];
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeSetting | undefined;
  setTheme: (
    value: ThemeSetting | ((prev: ThemeSetting) => ThemeSetting),
  ) => void;
  resolvedTheme: ResolvedTheme | undefined;
  systemTheme: ResolvedTheme | undefined;
  themes: ThemeSetting[];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
  document.cookie = `${RESOLVED_THEME_COOKIE_KEY}=${resolved}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function readStoredTheme(): ThemeSetting {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return "system";
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

let globalHasMounted = false;

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Synchronously initialize the theme state on subsequent mounts (client-side transitions)
  // to avoid rendering a layout with an undefined/incorrect theme class.
  const [theme, setThemeState] = useState<ThemeSetting | undefined>(() => {
    if (globalHasMounted) {
      return readStoredTheme();
    }
    return undefined;
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme | undefined>(() => {
    if (globalHasMounted) {
      return getSystemTheme();
    }
    return undefined;
  });

  useEffect(() => {
    globalHasMounted = true;
    const stored = readStoredTheme();
    const system = getSystemTheme();
    startTransition(() => {
      setThemeState((prev) => prev ?? stored);
      setSystemTheme((prev) => prev ?? system);
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => setSystemTheme(getSystemTheme());
    media.addEventListener("change", onSystemChange);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setThemeState(readStoredTheme());
    };
    window.addEventListener("storage", onStorage);

    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const resolvedTheme: ResolvedTheme | undefined =
    theme === undefined
      ? undefined
      : theme === "system"
        ? systemTheme
        : theme;

  // Use isomorphic useLayoutEffect to synchronously add/remove the class list
  // before the browser paints, preventing light-mode flash during client-side locale segment changes.
  useIsomorphicLayoutEffect(() => {
    if (!resolvedTheme) return;
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (value: ThemeSetting | ((prev: ThemeSetting) => ThemeSetting)) => {
      setThemeState((prev) => {
        const current = prev ?? readStoredTheme();
        const next = typeof value === "function" ? value(current) : value;
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [],
  );

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
      themes: [...THEMES],
    }),
    [theme, setTheme, resolvedTheme, systemTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
