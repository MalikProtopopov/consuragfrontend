/**
 * End Users (B2C) API types
 * Based on End Users System documentation
 */

// ==================== Status Types ====================

export type EndUserStatus = "active" | "blocked" | "archived";
export type IdentityProvider = "telegram" | "web" | "whatsapp" | "email" | "api";
export type ConversationStatus = "active" | "ended" | "archived";
export type MessageDirection = "in" | "out";
export type EndUserMessageRole = "user" | "assistant" | "admin" | "system";
export type MessageContentType = "text" | "image" | "document";
export type MessageFeedback = "positive" | "negative" | null;

// ==================== User Identity ====================

export interface UserIdentity {
  id: string;
  provider: IdentityProvider;
  external_id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  language_code: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
  is_reachable: boolean;
  last_activity_at: string | null;
  created_at: string;
}

// ==================== End User ====================

export interface EndUser {
  id: string;
  project_id: string;
  display_name: string | null;
  avatar_url: string | null;
  status: EndUserStatus;
  blocked_at: string | null;
  blocked_reason: string | null;
  first_seen_at: string;
  last_seen_at: string;
  tags: string[];
  consent_flags: Record<string, boolean>;
  custom_attributes: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// List item (simplified for list view)
export interface EndUserListItem {
  id: string;
  display_name: string | null;
  status: EndUserStatus;
  primary_channel: IdentityProvider | null;
  first_seen_at: string;
  last_seen_at: string;
  tags: string[];
  conversations_count: number;
  messages_count: number;
}

// ==================== End User Stats ====================

export interface EndUserStats {
  total_conversations: number;
  total_messages: number;
  total_tokens_used: number;
  first_seen_at: string;
  last_seen_at: string;
  days_active: number;
}

// ==================== End User Limits ====================

export interface EndUserLimits {
  daily_tokens_limit: number | null;
  monthly_tokens_limit: number | null;
  daily_messages_limit: number | null;
  monthly_messages_limit: number | null;
  tokens_used_today: number;
  tokens_used_month: number;
  messages_sent_today: number;
  messages_sent_month: number;
  rate_limit_per_minute: number;
}

// ==================== End User Detail Response ====================

export interface EndUserDetailResponse extends EndUser {
  identities: UserIdentity[];
  stats: EndUserStats;
  limits: EndUserLimits;
}

// ==================== Conversation ====================

export interface Conversation {
  id: string;
  project_id: string;
  end_user_id: string;
  avatar_id: string | null;
  avatar_name: string | null;
  channel: IdentityProvider;
  status: ConversationStatus;
  started_at: string;
  ended_at: string | null;
  last_activity_at: string;
  messages_count: number;
  user_messages_count: number;
  assistant_messages_count: number;
  total_tokens: number;
  metadata: Record<string, unknown>;
}

// ==================== Conversation Message ====================

export interface MessageAttachment {
  type: string;
  url: string;
  filename: string | null;
  size: number | null;
}

export interface ConversationMessage {
  id: string;
  direction: MessageDirection;
  role: EndUserMessageRole;
  content: string;
  content_type: MessageContentType;
  attachments: MessageAttachment[] | null;
  provider_message_id: string | null;
  model_used: string | null;
  total_tokens: number;
  feedback: MessageFeedback;
  feedback_comment: string | null;
  created_at: string;
}

// ==================== Request Types ====================

// List params
export interface EndUsersListParams {
  skip?: number;
  limit?: number;
  status?: EndUserStatus;
  search?: string;
  channel?: IdentityProvider;
  order_by?: "last_seen_at" | "first_seen_at" | "display_name" | "created_at";
  order_desc?: boolean;
}

// Update end user request
export interface UpdateEndUserRequest {
  display_name?: string;
  tags?: string[];
  notes?: string;
  custom_attributes?: Record<string, unknown>;
}

// Block user request
export interface BlockEndUserRequest {
  reason?: string;
}

// Update limits request
export interface UpdateEndUserLimitsRequest {
  daily_tokens_limit?: number | null;
  monthly_tokens_limit?: number | null;
  daily_messages_limit?: number | null;
  monthly_messages_limit?: number | null;
  rate_limit_per_minute?: number;
}

// Send message request
export interface SendMessageToEndUserRequest {
  channel: IdentityProvider;
  text: string;
  identity_id?: string;
}

// Conversations list params
export interface ConversationsListParams {
  skip?: number;
  limit?: number;
  status?: ConversationStatus;
  end_user_id?: string;
  channel?: IdentityProvider;
}

// Messages list params
export interface ConversationMessagesParams {
  skip?: number;
  limit?: number;
}

// ==================== Response Types ====================

// Paginated list response
export interface EndUsersListResponse {
  items: EndUserListItem[];
  total: number;
  skip: number;
  limit: number;
}

// Block/Unblock response
export interface BlockEndUserResponse {
  success: boolean;
  message: string;
  blocked_at?: string;
}

export interface UnblockEndUserResponse {
  success: boolean;
  message: string;
}

// Send message response
export interface SendMessageResponse {
  success: boolean;
  message_id: string | null;
  error: string | null;
}

// Conversations list response
export interface ConversationsListResponse {
  items: Conversation[];
  total: number;
  skip: number;
  limit: number;
}

// Messages list response
export interface ConversationMessagesResponse {
  items: ConversationMessage[];
  total: number;
  skip: number;
  limit: number;
}

// End conversation response
export interface EndConversationResponse {
  success: boolean;
  message: string;
}

// ==================== Error Types ====================

export type EndUserErrorCode =
  | "END_USER_NOT_FOUND"
  | "CONVERSATION_NOT_FOUND"
  | "END_USER_BLOCKED"
  | "END_USER_LIMIT_EXCEEDED"
  | "IDENTITY_ALREADY_EXISTS";

