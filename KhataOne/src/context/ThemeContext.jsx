import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../config/firebase.js";

import {
  getSettings,
  saveSettings,
} from "../services/settingsService.js";

const STORAGE_KEY = "khataone-theme";

const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved =
    window.localStorage.getItem(STORAGE_KEY);

  return saved === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] =
    useState(getInitialTheme);

  const [user, setUser] =
    useState(null);

  /* ================= AUTH ================= */

  useEffect(() => {
    return onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
      },
    );
  }, []);

  /* ================= LOAD FIREBASE THEME ================= */

  useEffect(() => {
    if (!user?.uid) return;

    let active = true;

    const loadTheme = async () => {
      try {
        const settings =
          await getSettings(user.uid);

        if (!active) return;

        const dark =
          settings?.preferences?.darkMode ===
          true;

        setTheme(
          dark ? "dark" : "light",
        );
      } catch (error) {
        console.error(
          "Theme load error:",
          error,
        );
      }
    };

    loadTheme();

    return () => {
      active = false;
    };
  }, [user?.uid]);

  /* ================= APPLY THEME ================= */

  useEffect(() => {
    const dark =
      theme === "dark";

    document.documentElement.classList.toggle(
      "dark",
      dark,
    );

    window.localStorage.setItem(
      STORAGE_KEY,
      theme,
    );
  }, [theme]);

  /* ================= CHANGE THEME ================= */

  const setThemeAndSave = async (
    nextTheme,
  ) => {
    setTheme(nextTheme);

    if (!user?.uid) return;

    try {
      await saveSettings(
        user.uid,
        {
          preferences: {
            darkMode:
              nextTheme === "dark",
          },
        },
      );
    } catch (error) {
      console.error(
        "Theme save error:",
        error,
      );
    }
  };

  const toggleTheme = () => {
    setThemeAndSave(
      theme === "light"
        ? "dark"
        : "light",
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme: setThemeAndSave,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () =>
  useContext(ThemeContext);