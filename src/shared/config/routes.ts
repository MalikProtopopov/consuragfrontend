/**
 * Application routes constants
 * Use these instead of hardcoded strings for type safety
 */
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  DESIGN_SYSTEM: "/design-system",

  // Auth routes
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",

  // Admin routes (SAAS_ADMIN only)
  ADMIN: {
    USERS: "/admin/users",
    USER_CREATE: "/admin/users/new",
    USER_DETAIL: (id: string) => `/admin/users/${id}` as const,
    ANALYTICS: "/admin/analytics",
    AUDIT: "/admin/audit",
    BILLING: "/admin/billing",
    PLATFORM_SETTINGS: "/admin/settings/platform",
  },

  // Projects
  PROJECTS: "/projects",
  PROJECT_CREATE: "/projects/new",
  PROJECT_DETAIL: (id: string) => `/projects/${id}` as const,
  PROJECT_SETTINGS: (id: string) => `/projects/${id}/settings` as const,
  PROJECT_MEMBERS: (id: string) => `/projects/${id}/members` as const,
  PROJECT_ANALYTICS: (id: string) => `/projects/${id}/analytics` as const,

  // Avatars (nested under projects)
  AVATARS: (projectId: string) => `/projects/${projectId}/avatars` as const,
  AVATAR_CREATE: (projectId: string) => `/projects/${projectId}/avatars/new` as const,
  AVATAR_DETAIL: (projectId: string, avatarId: string) =>
    `/projects/${projectId}/avatars/${avatarId}` as const,
  AVATAR_DOCUMENTS: (projectId: string, avatarId: string) =>
    `/projects/${projectId}/avatars/${avatarId}/documents` as const,
  AVATAR_CHAT: (projectId: string, avatarId: string) =>
    `/projects/${projectId}/avatars/${avatarId}/chat` as const,
  AVATAR_SESSIONS: (projectId: string, avatarId: string) =>
    `/projects/${projectId}/avatars/${avatarId}/sessions` as const,

  // Integrations
  TELEGRAM_INTEGRATION: (projectId: string) =>
    `/projects/${projectId}/integrations/telegram` as const,
  TELEGRAM_STATS: (projectId: string) =>
    `/projects/${projectId}/integrations/telegram/stats` as const,
  TELEGRAM_SESSIONS: (projectId: string) =>
    `/projects/${projectId}/integrations/telegram/sessions` as const,
  TELEGRAM_SESSION_DETAIL: (projectId: string, sessionId: string) =>
    `/projects/${projectId}/integrations/telegram/sessions/${sessionId}` as const,

  // Project Secrets
  PROJECT_SECRETS: (projectId: string) =>
    `/projects/${projectId}/settings/secrets` as const,

  // User settings
  SETTINGS: {
    PROFILE: "/settings/profile",
    PASSWORD: "/settings/password",
    USAGE: "/settings/usage",
  },
} as const;

export type AppRoute = typeof ROUTES;

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  "/projects",
  "/admin",
  "/settings",
  "/dashboard",
];

/**
 * Admin-only routes (require SAAS_ADMIN role)
 */
export const ADMIN_ROUTES = ["/admin"];

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/"];
