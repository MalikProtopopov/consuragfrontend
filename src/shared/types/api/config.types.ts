/**
 * Configuration and Secrets API types
 * For managing platform API keys (SAAS_ADMIN) and project secrets (OWNER)
 */

// ==================== Platform Config Types (SAAS_ADMIN) ====================

/**
 * Types of platform configuration keys
 */
export type PlatformKeyType =
  | "openai_api_key"
  | "anthropic_api_key"
  | "langsmith_api_key"
  | "sentry_dsn"
  | "smtp_password";

/**
 * Platform configuration item
 */
export interface PlatformConfig {
  id: string;
  key: string;
  key_type: PlatformKeyType;
  display_name: string;
  description: string | null;
  masked_value: string; // "••••••••••••sk-1234"
  is_set: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

/**
 * Platform config list response
 */
export interface PlatformConfigListResponse {
  items: PlatformConfig[];
  total: number;
}

/**
 * Create platform config request
 */
export interface CreatePlatformConfigRequest {
  key: string;
  value: string;
  key_type: PlatformKeyType;
  display_name: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Update platform config request
 */
export interface UpdatePlatformConfigRequest {
  value?: string;
  display_name?: string;
  description?: string;
  is_active?: boolean;
}

// ==================== Project Secret Types (OWNER) ====================

/**
 * Types of project secret keys
 */
export type ProjectSecretType =
  | "telegram_bot_token"
  | "webhook_secret"
  | "custom_api_key";

/**
 * Project secret item
 */
export interface ProjectSecret {
  id: string;
  project_id: string;
  key: string;
  key_type: ProjectSecretType;
  display_name: string;
  description: string | null;
  masked_value: string; // "••••••••••:ABC"
  is_set: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

/**
 * Project secrets list response
 */
export interface ProjectSecretListResponse {
  items: ProjectSecret[];
  total: number;
}

/**
 * Create project secret request
 */
export interface CreateProjectSecretRequest {
  key: string;
  value: string;
  key_type: ProjectSecretType;
  display_name: string;
  description?: string;
  is_active?: boolean;
}

/**
 * Update project secret request
 */
export interface UpdateProjectSecretRequest {
  value?: string;
  display_name?: string;
  description?: string;
  is_active?: boolean;
}

// ==================== Validation Types ====================

/**
 * Generic validation result
 */
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Telegram bot validation result
 */
export interface TelegramValidationResult extends ValidationResult {
  bot_username?: string;
  bot_first_name?: string;
}

/**
 * Validate key request
 */
export interface ValidateKeyRequest {
  value: string;
}

// ==================== Error Types ====================

/**
 * Config error codes
 */
export type ConfigErrorCode =
  | "CONFIG_NOT_FOUND"
  | "CONFIG_ALREADY_EXISTS"
  | "CONFIG_INVALID_KEY_TYPE"
  | "CONFIG_ENCRYPTION_ERROR"
  | "CONFIG_KEY_VALIDATION_FAILED"
  | "CONFIG_ACCESS_DENIED"
  | "CONFIG_KEY_TYPE_NOT_ALLOWED";

// ==================== Category Types ====================

/**
 * Config category for grouping
 */
export interface ConfigCategory {
  id: string;
  name: string;
  icon: string;
  keys: string[];
}

