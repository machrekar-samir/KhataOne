import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "khataone-theme";
const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  try {
    const workspace = JSON.parse(
      window.localStorage.getItem("khataone-workspace-v1") || "{}",
    );
    return workspace.settings?.theme === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);