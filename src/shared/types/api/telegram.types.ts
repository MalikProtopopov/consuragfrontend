/**
 * Telegram integration API types based on OpenAPI specification
 */

// Telegram integration status
export type TelegramIntegrationStatus = "active" | "inactive" | "error";

// Avatar summary (embedded in integration response)
export interface TelegramAvatarSummary {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "inactive" | "training";
  is_published: boolean;
  avatar_image_url: string | null;
  primary_color: string | null;
}

// Telegram integration
export interface TelegramIntegration {
  id: string;
  project_id: string;
  bot_username: string | null;
  default_avatar_id: string | null;
  default_avatar: TelegramAvatarSummary | null; // Full avatar object
  welcome_message: string | null;
  is_active: boolean;
  webhook_url: string | null;
  is_webhook_active: boolean;
  created_at: string;
  // Advanced settings
  session_timeout_hours: number; // default: 12
  user_rate_limit: number; // default: 10 (per minute)
  bot_rate_limit: number; // default: 100 (per minute)
  rate_limit_window: number; // default: 60 (seconds)
  enable_history_command: boolean; // default: true
  enable_clear_command: boolean; // default: true
}

// Create telegram integration request
export interface CreateTelegramRequest {
  bot_token: string;
  default_avatar_id?: string;
  welcome_message?: string;
  is_active?: boolean;
  // Advanced settings (optional)
  session_timeout_hours?: number; // 1-168
  user_rate_limit?: number; // 1-100
  bot_rate_limit?: number; // 10-1000
  rate_limit_window?: number; // 10-300
  enable_history_command?: boolean;
  enable_clear_command?: boolean;
}

// Update telegram integration request
export interface UpdateTelegramRequest {
  bot_token?: string; // Optional - only send if user wants to change the token
  default_avatar_id?: string;
  welcome_message?: string;
  is_active?: boolean;
  // Advanced settings (optional)
  session_timeout_hours?: number; // 1-168
  user_rate_limit?: number; // 1-100
  bot_rate_limit?: number; // 10-1000
  rate_limit_window?: number; // 10-300
  enable_history_command?: boolean;
  enable_clear_command?: boolean;
}

// Webhook response
export interface WebhookResponse {
  success: boolean;
  webhook_url: string | null;
  message: string;
}

// Webhook URL response (for GET /webhook-url endpoint)
export interface WebhookUrlResponse {
  webhook_url: string;
  is_configured: boolean;
  message: string | null;
}

// Set webhook request
export interface SetWebhookRequest {
  webhook_url: string;
}

// ============================================
// Statistics types
// ============================================

export interface TelegramStats {
  total_users: number;
  active_sessions: number;
  inactive_sessions: number;
  total_messages_today: number;
  total_messages_week: number;
  total_messages_month: number;
  avg_response_time_ms: number | null;
  rate_limit_events_today: number;
  error_events_today: number;
  stats_from: string; // ISO datetime
  stats_to: string; // ISO datetime
}

// ============================================
// Session types
// ============================================

export interface TelegramSession {
  id: string;
  telegram_user_id: number;
  telegram_username: string | null;
  telegram_first_name: string | null;
  telegram_chat_id: number;
  project_id: string;
  chat_session_id: string | null;
  selected_avatar_id: string | null;
  is_active: boolean;
  messages_count: number;
  created_at: string;
  last_message_at: string;
}

export type TelegramSessionStatus = "all" | "active" | "inactive";

export interface TelegramSessionsListParams {
  status?: TelegramSessionStatus;
  search?: string;
  skip?: number;
  limit?: number;
}

export interface TelegramSessionsListResponse {
  items: TelegramSession[];
  total: number;
  skip: number;
  limit: number;
}

export interface TelegramChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens_used: number;
  created_at: string;
}

export interface TelegramSessionDetailResponse {
  session: TelegramSession;
  messages: TelegramChatMessage[];
}

export interface TelegramSessionExportResponse {
  session: {
    id: string;
    telegram_user_id: number;
    telegram_username: string | null;
    created_at: string;
    last_message_at: string;
    messages_count: number;
  };
  messages: {
    role: string;
    content: string;
    tokens_used: number;
    created_at: string;
  }[];
  exported_at: string;
}

// ============================================
// Event types
// ============================================

export type TelegramEventType =
  | "message_received"
  | "message_sent"
  | "command_received"
  | "rate_limited"
  | "error"
  | "session_created"
  | "session_cleared"
  | "webhook_invalid";

export interface TelegramEvent {
  id: string;
  event_type: TelegramEventType;
  telegram_user_id: number | null;
  telegram_chat_id: number | null;
  message_text: string | null;
  response_text: string | null;
  response_time_ms: number | null;
  tokens_used: number | null;
  error_message: string | null;
  error_code: string | null;
  created_at: string;
}

export interface TelegramEventsListParams {
  event_type?: TelegramEventType;
  skip?: number;
  limit?: number;
}

export interface TelegramEventsListResponse {
  items: TelegramEvent[];
  total: number;
  skip: number;
  limit: number;
}

