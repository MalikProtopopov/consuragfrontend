/**
 * Analytics API types based on OpenAPI specification
 */

// Platform analytics (admin only)
export interface PlatformAnalytics {
  // Users
  total_users: number;
  active_users_today: number;
  active_users_week: number;
  active_users_month: number;
  new_users_today?: number; // Optional - may not be in response

  // Projects
  total_projects: number;
  active_projects: number;

  // Avatars
  total_avatars: number;
  published_avatars: number;

  // Usage - field names match API response
  total_messages_today: number;
  total_messages_month: number;
  total_tokens_today: number;
  total_tokens_month: number;

  // Documents
  total_documents: number;
  total_chunks: number;
}

// Audit log action
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "upload"
  | "publish"
  | "unpublish";

// Audit log resource type
export type AuditResourceType =
  | "user"
  | "project"
  | "avatar"
  | "document"
  | "session"
  | "member"
  | "telegram";

// Audit log entry
export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_email: string;
  action: AuditAction;
  resource_type: AuditResourceType;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Audit logs response
export interface AuditLogsResponse {
  items: AuditLogEntry[];
  total: number;
  skip: number;
  limit: number;
}

// Audit logs params
export interface AuditLogsParams {
  skip?: number;
  limit?: number;
  user_id?: string;
  action?: AuditAction;
  resource_type?: AuditResourceType;
  start_date?: string;
  end_date?: string;
}

// Project usage analytics
export interface ProjectUsage {
  period_start: string;
  period_end: string;

  // Messages
  total_messages: number;
  user_messages: number;
  assistant_messages: number;

  // Tokens
  total_tokens: number;

  // Sessions
  total_sessions: number;
  unique_clients: number;

  // Documents
  documents_uploaded: number;
  documents_indexed: number;

  // Feedback
  positive_feedback: number;
  negative_feedback: number;
  feedback_score: number;
}

// Project trend data point
export interface TrendDataPoint {
  date: string;
  sessions: number;
  messages: number;
  tokens: number;
}

// Project trend response
export interface ProjectTrendResponse {
  project_id: string;
  period: "day" | "week" | "month";
  data: TrendDataPoint[];
}

// Project trend params
export interface ProjectTrendParams {
  period?: "day" | "week" | "month";
  start_date?: string;
  end_date?: string;
}

