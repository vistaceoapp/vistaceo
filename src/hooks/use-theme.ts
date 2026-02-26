import { useEffect, useState } from "react";
import { safeLocalStorage } from "@/lib/safe-storage";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = safeLocalStorage.getItem("vistaceo-theme") as Theme | null;
    if (stored === "dark" || stored === "light") return stored;
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    safeLocalStorage.setItem("vistaceo-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { theme, setTheme, toggleTheme };
}
