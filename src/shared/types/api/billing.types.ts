/**
 * Billing API types based on backend specification
 * Система лимитов токенов с гибридной моделью монетизации
 */

// Plan types
export type BillingPlan = "free" | "starter" | "growth" | "scale" | "enterprise";

// Usage summary response
export interface UsageSummary {
  plan: BillingPlan;
  plan_features: string[];
  period_start: string; // ISO date
  period_end: string;
  days_remaining: number;

  // Chat tokens
  chat_tokens_limit: number;
  chat_tokens_used: number;
  chat_tokens_remaining: number;
  chat_bonus_tokens: number;
  chat_usage_percent: number;

  // Embedding tokens
  embedding_tokens_limit: number;
  embedding_tokens_used: number;
  embedding_tokens_remaining: number;
  embedding_bonus_tokens: number;
  embedding_usage_percent: number;

  // Combined
  total_tokens_used: number;
  total_usage_percent: number;

  // Overage - токены сверх лимита плана (оплачиваются отдельно)
  chat_overage_tokens: number;
  embedding_overage_tokens: number;
  total_overage_tokens: number;
  overage_cost_usd: number;

  // Cost
  estimated_cost_usd: number;

  // Resource limits
  max_projects: number;
  max_avatars_per_project: number;
  max_documents_per_avatar: number;

  // Settings
  hard_limit_enabled: boolean;
  alert_threshold_percent: number;
  overage_allowed: boolean;
  overage_price_per_1k_chat: number | null;
  overage_price_per_1k_embedding: number | null;
}

// Daily usage data point
export interface DailyUsage {
  date: string; // ISO date
  chat_tokens: number;
  embedding_tokens: number;
  total_tokens: number;
  cost_usd: number;
  requests: number;
}

// Usage history response
export interface UsageHistory {
  days: number;
  data: DailyUsage[];
}

// Usage breakdown by project/avatar
export interface UsageBreakdownItem {
  project_id: string;
  project_name: string;
  avatar_id?: string;
  avatar_name?: string;
  chat_tokens: number;
  embedding_tokens: number;
  total_tokens: number;
  requests: number;
  cost_usd: number;
}

export interface UsageBreakdown {
  items: UsageBreakdownItem[];
  total_chat_tokens: number;
  total_embedding_tokens: number;
  total_tokens: number;
  total_requests: number;
  total_cost_usd: number;
}

// Plan info response
export interface PlanInfo {
  name: BillingPlan;
  monthly_chat_limit: number;
  monthly_embedding_limit: number;
  max_projects: number;
  max_avatars_per_project: number;
  max_documents_per_avatar: number;
  price_usd: number;
  overage_allowed: boolean;
  overage_price_per_1k_chat: number | null;
  overage_price_per_1k_embedding: number | null;
  features: string[];
}

// Limits response
export interface BillingLimits {
  plan: BillingPlan;
  chat_tokens_limit: number;
  embedding_tokens_limit: number;
  max_projects: number;
  max_avatars_per_project: number;
  max_documents_per_avatar: number;
  hard_limit_enabled: boolean;
  overage_allowed: boolean;
}

// ==================== Admin Types ====================

// Platform usage stats (admin)
export interface PlatformUsage {
  total_users_with_budgets: number;
  today: {
    tokens: number;
    cost_usd: number;
    requests: number;
  };
  this_month: {
    tokens: number;
    cost_usd: number;
    requests: number;
  };
  users_by_plan: Record<BillingPlan, number>;
}

// User usage for admin
export interface UserUsage {
  user_id: string;
  email: string;
  full_name: string | null;
  plan: BillingPlan;
  chat_tokens_used: number;
  chat_tokens_limit: number;
  chat_usage_percent: number;
  embedding_tokens_used: number;
  embedding_tokens_limit: number;
  embedding_usage_percent: number;
  total_usage_percent: number;
  period_start: string;
  period_end: string;
  days_remaining: number;
}

// Users usage list response (admin)
export interface UsersUsageResponse {
  items: UserUsage[];
  total: number;
  skip: number;
  limit: number;
}

// User budget (admin)
export interface UserBudget {
  user_id: string;
  plan: BillingPlan;
  chat_tokens_limit: number;
  chat_bonus_tokens: number;
  embedding_tokens_limit: number;
  embedding_bonus_tokens: number;
  hard_limit_enabled: boolean;
  overage_allowed: boolean;
  period_start: string;
  period_end: string;
}

// ==================== Request Types ====================

// Update user limits request (admin)
export interface UpdateUserLimitsRequest {
  chat_tokens_limit?: number;
  embedding_tokens_limit?: number;
  hard_limit_enabled?: boolean;
  overage_allowed?: boolean;
}

// Update user plan request (admin)
export interface UpdateUserPlanRequest {
  plan: BillingPlan;
}

// Add bonus tokens request (admin)
export interface AddBonusTokensRequest {
  chat_tokens?: number;
  embedding_tokens?: number;
  reason?: string;
}

// Users usage params (admin)
export interface UsersUsageParams {
  skip?: number;
  limit?: number;
  plan?: BillingPlan;
  sort_by?: "usage_percent" | "chat_tokens" | "embedding_tokens" | "email";
  sort_order?: "asc" | "desc";
}

// ==================== Error Types ====================

// Token limit exceeded error
export type TokenLimitErrorCode = "TOKEN_LIMIT_EXCEEDED" | "EMBEDDING_LIMIT_EXCEEDED";

export interface TokenLimitError {
  error: {
    code: TokenLimitErrorCode;
    message: string;
    field?: string;
    details?: {
      current_usage: number;
      limit: number;
      limit_type: string;
    };
  };
}

// ==================== WebSocket Events (optional) ====================

export interface TokensUsedEvent {
  type: "tokens_used";
  data: {
    chat_tokens_used: number;
    embedding_tokens_used: number;
    total_usage_percent: number;
  };
}

export interface LimitAlertEvent {
  type: "limit_alert";
  data: {
    threshold: 80 | 90 | 100;
    current_percent: number;
    limit_type: "chat" | "embedding" | "combined";
  };
}

export type BillingWebSocketEvent = TokensUsedEvent | LimitAlertEvent;

