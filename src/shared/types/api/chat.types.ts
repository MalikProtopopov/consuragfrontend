/**
 * Chat API types based on OpenAPI specification
 */

// Message role
export type MessageRole = "user" | "assistant" | "system";

// Chat source
export type ChatSource = "web" | "telegram" | "api";

// Feedback type
export type FeedbackType = "positive" | "negative";

// Chat session
export interface ChatSession {
  id: string;
  avatar_id: string;
  source: ChatSource;
  is_active: boolean;
  messages_count: number;
  tokens_used: number;
  created_at: string;
  last_activity_at: string;
  metadata: Record<string, unknown>;
}

// Chat message
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  created_at: string;
  tokens_used?: number;
  feedback?: FeedbackType | null;
  sources?: MessageSource[];
}

// Message source (document reference from RAG)
export interface MessageSource {
  document_id: string;
  filename: string;
  chunk_text: string;
  relevance_score: number;
}

// Message pair (user question + assistant answer)
export interface MessagePair {
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}

// Avatar public info (for chat widget)
export interface AvatarPublicInfo {
  avatar_id: string;
  name: string;
  description: string | null;
  welcome_message: string | null;
  avatar_image_url: string | null;
  primary_color: string | null;
  is_available: boolean;
}

// Create session request
export interface CreateSessionRequest {
  source?: ChatSource;
  metadata?: Record<string, unknown>;
}

// Create session response
export interface CreateSessionResponse {
  id: string;
  avatar_id: string;
  client_id: string | null;
  source: string;
  is_active: boolean;
  created_at: string;
  last_message_at: string | null;
  messages_count: number;
  title: string | null;
  total_tokens_used: number;
}

// Send message request
export interface SendMessageRequest {
  content: string;
}

// Chat history response - API returns array of messages directly
export type ChatHistoryResponse = ChatMessage[];

// Chat history params
export interface ChatHistoryParams {
  session_id: string;
  limit?: number;
}

// Send feedback request
export interface SendFeedbackRequest {
  feedback: FeedbackType;
}

// Send feedback response
export interface SendFeedbackResponse {
  success: boolean;
  message_id: string;
  feedback: FeedbackType;
}

// Admin: Sessions list response
export interface SessionsListResponse {
  items: ChatSession[];
  total: number;
  skip: number;
  limit: number;
}

// Admin: Sessions list params
export interface SessionsListParams {
  avatar_id?: string;
  skip?: number;
  limit?: number;
  active_only?: boolean;
  source?: ChatSource;
}

// Admin: Session detail
export interface SessionDetail extends ChatSession {
  messages: ChatMessage[];
}

