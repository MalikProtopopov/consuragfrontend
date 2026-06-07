"use client";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Light-only: приложение использует единственную светлую тему.
 * Провайдер оставлен как passthrough, чтобы не править все call-sites.
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return <>{children}</>;
};
