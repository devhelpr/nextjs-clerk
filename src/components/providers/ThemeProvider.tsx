"use client";

import { useEffect, useState } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set up system theme preference listener
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const root = window.document.documentElement;

    // Function to update theme based on system preference
    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      root.classList.remove("light", "dark");
      root.classList.add(e.matches ? "dark" : "light");
    };

    // Initial setup
    updateTheme(mediaQuery);
    setMounted(true);

    // Listen for system theme changes
    mediaQuery.addEventListener("change", updateTheme);

    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, []);

  // Prevent flash of incorrect theme
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
