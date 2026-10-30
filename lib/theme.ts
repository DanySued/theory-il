/**
 * Theme preference. Contract (mirrored by the inline boot script in app/layout.tsx):
 *   - no stored value      → no data-theme attribute → CSS follows the OS preference
 *   - "light" | "dark"     → data-theme set → forced
 */
export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_KEY = "theory-il:theme";
export const THEME_EVENT = "theory-il:theme-change";

export function getThemeChoice(): ThemeChoice {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}

export function resolveTheme(choice: ThemeChoice = getThemeChoice()): ResolvedTheme {
  if (choice !== "system") return choice;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setThemeChoice(choice: ThemeChoice): void {
  const root = document.documentElement;
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // ignore quota / privacy-mode errors
  }
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: choice }));
}
