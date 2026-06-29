"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "aventra-theme";
const THEMES = ["light", "dark", "system"] as const;

export type ThemeSetting = (typeof THEMES)[number];
export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeSetting | undefined;
  setTheme: (value: ThemeSetting | ((prev: ThemeSetting) => ThemeSetting)) => void;
  resolvedTheme: ResolvedTheme | undefined;
  systemTheme: ResolvedTheme | undefined;
  themes: ThemeSetting[];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeSetting | undefined>(undefined);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme | undefined>(
    undefined,
  );

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    setSystemTheme(getSystemTheme());

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

  useEffect(() => {
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
