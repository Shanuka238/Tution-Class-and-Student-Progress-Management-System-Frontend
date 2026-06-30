import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem("edutracker_theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Default to light mode, or detect system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("edutracker_theme", isDarkMode ? "dark" : "light");
    // Update document class for potential CSS usage
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "dark" : "light"
    );
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
