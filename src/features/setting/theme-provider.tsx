"use client";

import type * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  attribute?: string | string[];
  storageKey?: string;
  enableColorScheme?: boolean;
};

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const SYSTEM_QUERY = "(prefers-color-scheme: dark)";
const THEME_STORAGE_KEY = "theme";

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia(SYSTEM_QUERY).matches ? "dark" : "light";
};

const applyThemeToAttribute = (
  element: HTMLElement,
  attribute: string,
  resolvedTheme: "light" | "dark",
) => {
  if (attribute === "class") {
    element.classList.remove("light", "dark");
    element.classList.add(resolvedTheme);
    return;
  }
  element.setAttribute(attribute, resolvedTheme);
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  attribute = "data-theme",
  storageKey = THEME_STORAGE_KEY,
  enableColorScheme = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (!enableSystem) return;

    const mediaQuery = window.matchMedia(SYSTEM_QUERY);
    const onChange = () => setSystemTheme(getSystemTheme());
    onChange();
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, [enableSystem]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === "light" || saved === "dark" || saved === "system") {
        setThemeState(saved);
      } else {
        setThemeState(defaultTheme);
      }
    } catch {
      setThemeState(defaultTheme);
    }
  }, [defaultTheme, storageKey]);

  const resolvedTheme = useMemo<"light" | "dark">(() => {
    if (theme === "system") {
      return enableSystem ? systemTheme : "light";
    }
    return theme;
  }, [enableSystem, systemTheme, theme]);

  useEffect(() => {
    const root = document.documentElement;
    const attributes = Array.isArray(attribute) ? attribute : [attribute];
    for (const key of attributes) {
      applyThemeToAttribute(root, key, resolvedTheme);
    }
    if (enableColorScheme) {
      root.style.colorScheme = resolvedTheme;
    }
  }, [attribute, enableColorScheme, resolvedTheme]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      try {
        window.localStorage.setItem(storageKey, nextTheme);
      } catch {
        // noop
      }
    },
    [storageKey],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
