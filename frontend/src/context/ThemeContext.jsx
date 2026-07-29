import { createContext, useContext, useEffect, useState } from "react";

// Supports "light" | "dark" | "system". The inline script in index.html
// already applied the right class before React mounted (avoids a flash);
// this context just keeps it in sync when the user changes their choice.

const ThemeContext = createContext(null);

function applyTheme(pref) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = pref === "dark" || (pref === "system" && systemDark);
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem("theme") || "system");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => theme === "system" && applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (value) => {
    setThemeState(value);
    localStorage.setItem("theme", value);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
