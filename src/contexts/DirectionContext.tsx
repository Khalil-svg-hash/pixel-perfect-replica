import React, { createContext, useContext, useState, useEffect } from "react";

type Direction = "ltr" | "rtl";
type Language = "en" | "ar";

interface DirectionContextType {
  dir: Direction;
  lang: Language;
  setLanguage: (lang: Language) => void;
}

const DirectionContext = createContext<DirectionContextType>({
  dir: "ltr",
  lang: "en",
  setLanguage: () => {},
});

export const useDirection = () => useContext(DirectionContext);

export const DirectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("app-lang") as Language) || "en";
  });

  const dir: Direction = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem("app-lang", lang);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang, dir]);

  return (
    <DirectionContext.Provider value={{ dir, lang, setLanguage: setLang }}>
      {children}
    </DirectionContext.Provider>
  );
};
