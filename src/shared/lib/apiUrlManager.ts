/**
 * API URL Manager
 * Allows switching between dev and prod API endpoints
 */

const API_URL_STORAGE_KEY = "api_url_override";

// Available API environments
export const API_ENVIRONMENTS = [
  { label: "Dev (localhost:8000)", value: "http://localhost:8000" },
  { label: "Prod (api.parmenid.tech)", value: "https://api.parmenid.tech" },
] as const;

export type ApiEnvironment = (typeof API_ENVIRONMENTS)[number]["value"];

/**
 * Get default API URL from environment variables
 */
function getDefaultApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
}

/**
 * API URL Manager for switching between environments
 */
export const apiUrlManager = {
  /**
   * Get current API URL (with localStorage override support)
   */
  getApiUrl: (): string => {
    if (typeof window === "undefined") {
      return getDefaultApiUrl();
    }

    // Check localStorage for override
    const override = localStorage.getItem(API_URL_STORAGE_KEY);
    if (override) {
      return override;
    }

    return getDefaultApiUrl();
  },

  /**
   * Set API URL override (saves to localStorage and reloads page)
   */
  setApiUrl: (url: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(API_URL_STORAGE_KEY, url);
    // Reload page to apply changes
    window.location.reload();
  },

  /**
   * Clear override and use default from .env
   */
  clearOverride: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(API_URL_STORAGE_KEY);
    window.location.reload();
  },

  /**
   * Check if there's an active override
   */
  hasOverride: (): boolean => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(API_URL_STORAGE_KEY) !== null;
  },

  /**
   * Get default URL from .env (ignoring override)
   */
  getDefaultUrl: (): string => {
    return getDefaultApiUrl();
  },
};

