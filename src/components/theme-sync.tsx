import { useEffect } from "react";
import { useHasHydrated, useLaloba } from "@/lib/store";

export function ThemeSync() {
  const theme = useLaloba((s) => s.theme);
  const hydrated = useHasHydrated();

  useEffect(() => {
    if (!hydrated) return;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = theme === "dark" || (theme === "system" && systemDark);
    document.documentElement.classList.toggle("light", !dark);
    document.documentElement.classList.toggle("dark", dark);
  }, [theme, hydrated]);

  return null;
}
