/**
 * Telegram integration API types based on OpenAPI specification
 */

// Telegram integration status
export type TelegramIntegrationStatus = "active" | "inactive" | "error";

// Telegram integration
export interface TelegramIntegration {
  id: string;
  project_id: string;
  bot_username: string;
  masked_bot_token: string | null; // "•••••:ABC" - masked token for display
  avatar_id: string | null;
  welcome_message: string | null;
  is_active: boolean;
  webhook_url: string | null;
  webhook_status: "set" | "not_set" | "error";
  webhook_set: boolean;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Create telegram integration request
export interface CreateTelegramRequest {
  bot_token: string;
  avatar_id?: string;
  welcome_message?: string;
  is_active?: boolean;
}

// Update telegram integration request
export interface UpdateTelegramRequest {
  bot_token?: string; // Optional - only send if user wants to change the token
  avatar_id?: string;
  welcome_message?: string;
  is_active?: boolean;
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

