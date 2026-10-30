"use client";

import { useEffect, useState } from "react";
import { THEME_EVENT, getThemeChoice, setThemeChoice, type ThemeChoice } from "@/lib/theme";
import { isShuffleEnabled, setShuffleEnabled } from "@/lib/answerOrder";

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "בהיר" },
  { value: "dark", label: "כהה" },
  { value: "system", label: "לפי המכשיר" },
];

export default function PreferencesSection() {
  const [theme, setTheme] = useState<ThemeChoice | null>(null);
  const [shuffle, setShuffle] = useState(true);

  useEffect(() => {
    const sync = () => setTheme(getThemeChoice());
    sync();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShuffle(isShuffleEnabled());
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  return (
    <section className="w-full flex flex-col gap-4">
      <h2 className="th-section-h">העדפות</h2>

      <div className="p-4 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span id="theme-label" className="font-bold text-[var(--th-fg)]">ערכת צבעים</span>
          <span className="text-sm text-[var(--th-muted)]">
            &quot;לפי המכשיר&quot; עובר אוטומטית בין בהיר לכהה לפי הגדרות הטלפון או המחשב.
          </span>
        </div>
        <div
          role="radiogroup"
          aria-labelledby="theme-label"
          className="flex items-center gap-1 bg-[var(--th-muted-bg)] rounded-full p-1 self-start"
        >
          {THEME_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={theme === o.value}
              onClick={() => setThemeChoice(o.value)}
              className={`min-h-11 px-4 rounded-full text-sm font-semibold transition-colors ${
                theme === o.value
                  ? "bg-[var(--th-card)] text-[var(--th-fg)] shadow-sm"
                  : "text-[var(--th-muted)] hover:text-[var(--th-fg)]"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <span id="shuffle-label" className="font-bold text-[var(--th-fg)]">ערבוב סדר התשובות</span>
          <span id="shuffle-desc" className="text-sm text-[var(--th-muted)]">
            מציג את התשובות בסדר משתנה, כדי שתזכור את התוכן ולא את המיקום.
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={shuffle}
          aria-labelledby="shuffle-label"
          aria-describedby="shuffle-desc"
          onClick={() => {
            setShuffleEnabled(!shuffle);
            setShuffle(!shuffle);
          }}
          // 44px tap area on phones around the 28px track
          className="shrink-0 inline-flex items-center h-11 sm:h-auto"
        >
          <span
            aria-hidden
            className={`relative block w-12 h-7 rounded-full transition-colors ${
              shuffle ? "bg-[var(--th-accent)]" : "bg-[var(--th-border-strong)]"
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-[var(--th-card)] shadow-sm transition-all ${
                shuffle ? "start-6" : "start-1"
              }`}
            />
          </span>
        </button>
      </div>
    </section>
  );
}
