"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theory-il:theme";

function resolveInitial(): Theme {
  // Mirror the inline boot script: stored choice wins, else follow the OS.
  if (document.documentElement.dataset.theme === "dark") return "dark";
  if (document.documentElement.dataset.theme === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolveInitial());
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore quota / privacy-mode errors
    }
  };

  // Avoid a hydration mismatch: render a same-size placeholder until mounted.
  if (theme === null) {
    return <span className="shrink-0 w-9 h-9" aria-hidden />;
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "מצב בהיר" : "מצב כהה"}
      title={isDark ? "מצב בהיר" : "מצב כהה"}
      className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-[var(--th-radius-sm)] text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
