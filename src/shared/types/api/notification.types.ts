/**
 * Notification API types
 * Types for Telegram notifications system
 */

// ============================================
// OWNER endpoints types
// ============================================

/**
 * Telegram link status response
 * GET /api/v1/notifications/telegram/status
 */
export interface TelegramLinkStatus {
  linked: boolean;
  username?: string;
  notifications_enabled: boolean;
  linked_at?: string;
}

/**
 * Telegram link code response
 * POST /api/v1/notifications/telegram/link
 */
export interface TelegramLinkCode {
  code: string;
  expires_in: number;
  bot_username: string;
  bot_link: string;
}

/**
 * Toggle notifications request
 * PUT /api/v1/notifications/telegram/notifications
 */
export interface ToggleNotificationsRequest {
  enabled: boolean;
}

// ============================================
// ADMIN endpoints types
// ============================================

/**
 * Telegram bots configuration response
 * GET /api/v1/notifications/admin/telegram/config
 */
export interface TelegramBotsConfig {
  admin_bot_configured: boolean;
  admin_bot_username?: string;
  admin_chat_id_configured: boolean;
  user_bot_configured: boolean;
  user_bot_username?: string;
  webhook_configured: boolean;
  webhook_url?: string;
}

/**
 * Admin bot configuration request
 * PUT /api/v1/notifications/admin/telegram/admin-bot
 */
export interface UpdateAdminBotRequest {
  bot_token: string;
  chat_id: string;
}

/**
 * User bot configuration request
 * PUT /api/v1/notifications/admin/telegram/user-bot
 */
export interface UpdateUserBotRequest {
  bot_token: string;
}

/**
 * Test message request
 * POST /api/v1/notifications/admin/telegram/test
 */
export interface SendTestMessageRequest {
  bot_type: "admin" | "user";
}

/**
 * Notification log item
 */
export interface NotificationLog {
  id: string;
  notification_type: NotificationType;
  recipient_type: "admin" | "user";
  recipient_id?: string;
  channel: string;
  status: NotificationStatus;
  message_preview: string;
  error_message?: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

/**
 * Notification status
 */
export type NotificationStatus = "pending" | "sent" | "failed";

/**
 * Notification types for users
 */
export type UserNotificationType =
  | "limit_warning_80"
  | "limit_warning_90"
  | "limit_exceeded"
  | "subscription_expiring_7d"
  | "subscription_expiring_3d"
  | "subscription_expiring_1d"
  | "subscription_expired"
  | "plan_changed"
  | "bonus_tokens_added";

/**
 * Notification types for admin
 */
export type AdminNotificationType =
  | "new_plan_request"
  | "new_user_registered"
  | "user_limit_exceeded"
  | "daily_report"
  | "weekly_report";

/**
 * All notification types
 */
export type NotificationType = UserNotificationType | AdminNotificationType;

/**
 * Notification logs list params
 * GET /api/v1/notifications/admin/notifications/logs
 */
export interface NotificationLogsParams {
  skip?: number;
  limit?: number;
  type?: NotificationType;
  recipient_type?: "admin" | "user";
  status?: NotificationStatus;
}

/**
 * Notification logs list response
 */
export interface NotificationLogsResponse {
  items: NotificationLog[];
  total: number;
  skip: number;
  limit: number;
}

