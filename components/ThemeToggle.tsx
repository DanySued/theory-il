"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_EVENT, resolveTheme, setThemeChoice, type ResolvedTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ResolvedTheme | null>(null);

  useEffect(() => {
    const sync = () => setTheme(resolveTheme());
    sync();
    // Stay in sync with the Settings control and with OS changes while on "system".
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    window.addEventListener(THEME_EVENT, sync);
    mq.addEventListener("change", sync);
    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      mq.removeEventListener("change", sync);
    };
  }, []);

  // Avoid a hydration mismatch: render a same-size placeholder until mounted.
  if (theme === null) {
    return <span className="shrink-0 w-9 h-9" aria-hidden />;
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setThemeChoice(isDark ? "light" : "dark")}
      aria-label={isDark ? "מצב בהיר" : "מצב כהה"}
      title={isDark ? "מצב בהיר" : "מצב כהה"}
      className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-[var(--th-radius-sm)] text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
