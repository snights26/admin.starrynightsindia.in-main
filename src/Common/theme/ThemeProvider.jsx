import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { darkTheme } from "./darkTheme";
import { lightTheme } from "./lightTheme";
import { getScheduledTheme, THEME_STORAGE_KEY, VALID_THEME_PREFERENCES } from "./themeConfig";

const ThemeContext = createContext(null);
const themes = { dark: darkTheme, light: lightTheme };

const getStoredPreference = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return VALID_THEME_PREFERENCES.includes(stored) ? stored : null;
  } catch {
    return null;
  }
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme.name;
  root.style.colorScheme = theme.colorScheme;
  Object.entries(theme.variables).forEach(([key, value]) => root.style.setProperty(key, value));
};

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(getStoredPreference);
  const [scheduledTheme, setScheduledTheme] = useState(getScheduledTheme);
  const activeThemeName = preference || scheduledTheme;
  const activeTheme = themes[activeThemeName] || darkTheme;

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    const refreshScheduledTheme = () => setScheduledTheme(getScheduledTheme());
    refreshScheduledTheme();
    const timer = window.setInterval(refreshScheduledTheme, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const setPreference = (nextPreference) => {
    setPreferenceState(nextPreference);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
    } catch {
      // Local storage can be unavailable in restricted browser contexts.
    }
  };

  const toggleTheme = () => {
    setPreference(activeThemeName === "dark" ? "light" : "dark");
  };

  const value = useMemo(() => ({
    preference,
    activeTheme: activeTheme.name,
    setPreference,
    toggleTheme,
    isScheduledTheme: !preference,
  }), [preference, activeTheme.name]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
};
