/**
 * API endpoints constants
 * Based on OpenAPI specification for AI Avatar Platform
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    LOGOUT: "/api/v1/auth/logout",
    REFRESH: "/api/v1/auth/refresh",
    ME: "/api/v1/auth/me",
    UPDATE_ME: "/api/v1/auth/me",
    CHANGE_PASSWORD: "/api/v1/auth/me/password",
  },

  // Users (Admin only)
  USERS: {
    LIST: "/api/v1/auth/users",
    CREATE: "/api/v1/auth/users",
    BY_ID: (id: string) => `/api/v1/auth/users/${id}` as const,
    UPDATE: (id: string) => `/api/v1/auth/users/${id}` as const,
  },

  // Projects
  PROJECTS: {
    LIST: "/api/v1/projects",
    CREATE: "/api/v1/projects",
    BY_ID: (id: string) => `/api/v1/projects/${id}` as const,
    UPDATE: (id: string) => `/api/v1/projects/${id}` as const,
    DELETE: (id: string) => `/api/v1/projects/${id}` as const,
    SETTINGS: (id: string) => `/api/v1/projects/${id}/settings` as const,
    UPDATE_SETTINGS: (id: string) => `/api/v1/projects/${id}/settings` as const,
    MEMBERS: (id: string) => `/api/v1/projects/${id}/members` as const,
    ADD_MEMBER: (id: string) => `/api/v1/projects/${id}/members` as const,
    UPDATE_MEMBER: (projectId: string, userId: string) =>
      `/api/v1/projects/${projectId}/members/${userId}` as const,
    REMOVE_MEMBER: (projectId: string, userId: string) =>
      `/api/v1/projects/${projectId}/members/${userId}` as const,
  },

  // Avatars
  AVATARS: {
    LIST: (projectId: string) => `/api/v1/projects/${projectId}/avatars` as const,
    CREATE: (projectId: string) => `/api/v1/projects/${projectId}/avatars` as const,
    BY_ID: (projectId: string, avatarId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}` as const,
    UPDATE: (projectId: string, avatarId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}` as const,
    DELETE: (projectId: string, avatarId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}` as const,
    PUBLISH: (projectId: string, avatarId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}/publish` as const,
    UNPUBLISH: (projectId: string, avatarId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}/unpublish` as const,
    STATS: (projectId: string, avatarId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}/stats` as const,
  },

  // Documents
  DOCUMENTS: {
    LIST: (projectId: string, avatarId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}/documents` as const,
    UPLOAD: (projectId: string, avatarId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}/documents` as const,
    BY_ID: (projectId: string, avatarId: string, documentId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}/documents/${documentId}` as const,
    DELETE: (projectId: string, avatarId: string, documentId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}/documents/${documentId}` as const,
    REINDEX: (projectId: string, avatarId: string, documentId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}/documents/${documentId}/reindex` as const,
    CHUNKS: (projectId: string, avatarId: string, documentId: string) =>
      `/api/v1/projects/${projectId}/avatars/${avatarId}/documents/${documentId}/chunks` as const,
  },

  // Chat
  CHAT: {
    INFO: (avatarId: string) => `/api/v1/chat/${avatarId}/info` as const,
    CREATE_SESSION: (avatarId: string) => `/api/v1/chat/${avatarId}/sessions` as const,
    SEND_MESSAGE: (avatarId: string) => `/api/v1/chat/${avatarId}/message` as const,
    HISTORY: (avatarId: string) => `/api/v1/chat/${avatarId}/history` as const,
    FEEDBACK: (avatarId: string, messageId: string) =>
      `/api/v1/chat/${avatarId}/message/${messageId}/feedback` as const,
    // Admin endpoints (require auth)
    ADMIN_SESSIONS: "/api/v1/chat/admin/sessions",
    ADMIN_SESSION_BY_ID: (sessionId: string) =>
      `/api/v1/chat/admin/sessions/${sessionId}` as const,
  },

  // Analytics
  ANALYTICS: {
    PLATFORM: "/api/v1/analytics/platform",
    PLATFORM_AUDIT: "/api/v1/analytics/platform/audit",
    PROJECT_USAGE: (projectId: string) =>
      `/api/v1/analytics/projects/${projectId}/usage` as const,
    PROJECT_TREND: (projectId: string) =>
      `/api/v1/analytics/projects/${projectId}/trend` as const,
  },

  // Telegram
  TELEGRAM: {
    GET: (projectId: string) => `/api/v1/telegram/${projectId}` as const,
    CREATE: (projectId: string) => `/api/v1/telegram/${projectId}` as const,
    UPDATE: (projectId: string) => `/api/v1/telegram/${projectId}` as const,
    DELETE: (projectId: string) => `/api/v1/telegram/${projectId}` as const,
    GET_WEBHOOK_URL: (projectId: string) => `/api/v1/telegram/${projectId}/webhook-url` as const,
    SET_WEBHOOK: (projectId: string) => `/api/v1/telegram/${projectId}/webhook` as const,
    DELETE_WEBHOOK: (projectId: string) => `/api/v1/telegram/${projectId}/webhook` as const,
    // Analytics & Sessions
    STATS: (projectId: string) =>
      `/api/v1/telegram/${projectId}/stats` as const,
    SESSIONS: (projectId: string) =>
      `/api/v1/telegram/${projectId}/sessions` as const,
    SESSION_DETAIL: (projectId: string, sessionId: string) =>
      `/api/v1/telegram/${projectId}/sessions/${sessionId}` as const,
    SESSION_EXPORT: (projectId: string, sessionId: string) =>
      `/api/v1/telegram/${projectId}/sessions/${sessionId}/export` as const,
    EVENTS: (projectId: string) =>
      `/api/v1/telegram/${projectId}/events` as const,
  },

  // Platform Config (SAAS_ADMIN)
  PLATFORM_CONFIG: {
    LIST: "/api/v1/admin/platform/config",
    BY_KEY: (key: string) => `/api/v1/admin/platform/config/${key}` as const,
    CREATE: "/api/v1/admin/platform/config",
    UPDATE: (key: string) => `/api/v1/admin/platform/config/${key}` as const,
    DELETE: (key: string) => `/api/v1/admin/platform/config/${key}` as const,
    VALIDATE: (key: string) =>
      `/api/v1/admin/platform/config/${key}/validate` as const,
  },

  // Project Secrets (OWNER)
  PROJECT_SECRETS: {
    LIST: (projectId: string) => `/api/v1/projects/${projectId}/secrets` as const,
    BY_KEY: (projectId: string, key: string) =>
      `/api/v1/projects/${projectId}/secrets/${key}` as const,
    CREATE: (projectId: string) =>
      `/api/v1/projects/${projectId}/secrets` as const,
    UPDATE: (projectId: string, key: string) =>
      `/api/v1/projects/${projectId}/secrets/${key}` as const,
    DELETE: (projectId: string, key: string) =>
      `/api/v1/projects/${projectId}/secrets/${key}` as const,
    VALIDATE_TELEGRAM: (projectId: string) =>
      `/api/v1/projects/${projectId}/secrets/telegram/validate` as const,
  },

  // End Users (B2C)
  END_USERS: {
    LIST: (projectId: string) => `/api/v1/projects/${projectId}/end-users` as const,
    BY_ID: (projectId: string, endUserId: string) =>
      `/api/v1/projects/${projectId}/end-users/${endUserId}` as const,
    UPDATE: (projectId: string, endUserId: string) =>
      `/api/v1/projects/${projectId}/end-users/${endUserId}` as const,
    BLOCK: (projectId: string, endUserId: string) =>
      `/api/v1/projects/${projectId}/end-users/${endUserId}/block` as const,
    UNBLOCK: (projectId: string, endUserId: string) =>
      `/api/v1/projects/${projectId}/end-users/${endUserId}/block` as const,
    LIMITS: (projectId: string, endUserId: string) =>
      `/api/v1/projects/${projectId}/end-users/${endUserId}/limits` as const,
    CONVERSATIONS: (projectId: string, endUserId: string) =>
      `/api/v1/projects/${projectId}/end-users/${endUserId}/conversations` as const,
    SEND_MESSAGE: (projectId: string, endUserId: string) =>
      `/api/v1/projects/${projectId}/end-users/${endUserId}/send-message` as const,
  },

  // Conversations (project level)
  CONVERSATIONS: {
    LIST: (projectId: string) => `/api/v1/projects/${projectId}/conversations` as const,
    BY_ID: (projectId: string, conversationId: string) =>
      `/api/v1/projects/${projectId}/conversations/${conversationId}` as const,
    MESSAGES: (projectId: string, conversationId: string) =>
      `/api/v1/projects/${projectId}/conversations/${conversationId}/messages` as const,
    END: (projectId: string, conversationId: string) =>
      `/api/v1/projects/${projectId}/conversations/${conversationId}/end` as const,
  },

  // Plan Requests
  PLAN_REQUESTS: {
    LIST: "/api/v1/plan-requests",
    BY_ID: (id: string) => `/api/v1/plan-requests/${id}` as const,
  },

  // Notifications
  NOTIFICATIONS: {
    // OWNER endpoints
    STATUS: "/api/v1/notifications/telegram/status",
    LINK: "/api/v1/notifications/telegram/link",
    UNLINK: "/api/v1/notifications/telegram/link",
    TOGGLE: "/api/v1/notifications/telegram/notifications",

    // ADMIN endpoints
    CONFIG: "/api/v1/notifications/admin/telegram/config",
    ADMIN_BOT: "/api/v1/notifications/admin/telegram/admin-bot",
    USER_BOT: "/api/v1/notifications/admin/telegram/user-bot",
    TEST: "/api/v1/notifications/admin/telegram/test",
    LOGS: "/api/v1/notifications/admin/notifications/logs",
  },

  // Billing
  BILLING: {
    // OWNER endpoints
    USAGE_SUMMARY: "/api/v1/billing/usage/summary",
    USAGE_HISTORY: "/api/v1/billing/usage/history",
    USAGE_BREAKDOWN: "/api/v1/billing/usage/breakdown",
    LIMITS: "/api/v1/billing/limits",
    PLAN: "/api/v1/billing/plan",

    // ADMIN endpoints
    ADMIN_PLATFORM: "/api/v1/billing/admin/usage/platform",
    ADMIN_USERS: "/api/v1/billing/admin/usage/users",
    ADMIN_USER_USAGE: (userId: string) =>
      `/api/v1/billing/admin/users/${userId}/usage` as const,
    ADMIN_USER_BUDGET: (userId: string) =>
      `/api/v1/billing/admin/users/${userId}/budget` as const,
    ADMIN_USER_LIMITS: (userId: string) =>
      `/api/v1/billing/admin/users/${userId}/limits` as const,
    ADMIN_USER_PLAN: (userId: string) =>
      `/api/v1/billing/admin/users/${userId}/plan` as const,
    ADMIN_BONUS_TOKENS: (userId: string) =>
      `/api/v1/billing/admin/users/${userId}/bonus-tokens` as const,
    ADMIN_RESET_PERIOD: (userId: string) =>
      `/api/v1/billing/admin/users/${userId}/reset-period` as const,
  },
} as const;
