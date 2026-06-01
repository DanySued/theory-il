"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Locale } from "./i18n";

interface LangContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LangContext = createContext<LangContextValue>({
  locale: "he",
  setLocale: () => {},
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("he");

  useEffect(() => {
    const saved = localStorage.getItem("theory-il:lang") as Locale | null;
    if (saved === "en" || saved === "he") setLocaleState(saved);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("theory-il:lang", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "en" ? "ltr" : "rtl";
  }

  return <LangContext.Provider value={{ locale, setLocale }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
