"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { en } from "./en";
import { pt } from "./pt";
import type { Translations } from "./en";

export type Language = "en" | "pt";

const translations: Record<Language, Translations> = { en, pt };

type LanguageContextValue = {
  lang: Language;
  t: Translations;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  t: en,
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  const toggle = useCallback(() => {
    setLang((l) => (l === "en" ? "pt" : "en"));
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
