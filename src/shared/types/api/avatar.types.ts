/**
 * Avatar API types based on OpenAPI specification
 */

// Avatar status
export type AvatarStatus = "active" | "draft" | "training" | "inactive";

// Avatar response
export interface Avatar {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: AvatarStatus;
  is_published: boolean;

  // Prompts
  system_prompt: string | null;
  welcome_message: string | null;
  fallback_message: string | null;

  // Appearance
  avatar_image_url: string | null;
  primary_color: string | null;

  // LLM settings (optional overrides)
  llm_model: string | null;
  llm_temperature: number | null;
  rag_top_k: number | null;

  // Metadata
  documents_count: number;
  sessions_count: number;
  created_at: string;
  updated_at: string;
}

// Avatar stats
export interface AvatarStats {
  total_sessions: number;
  total_messages: number;
  total_tokens: number;
  average_messages_per_session: number;
  positive_feedback_count: number;
  negative_feedback_count: number;
  sessions_today: number;
  messages_today: number;
}

// Create avatar request
export interface CreateAvatarRequest {
  name: string;
  description?: string;
  system_prompt?: string;
  welcome_message?: string;
  fallback_message?: string;
  avatar_image_url?: string;
  primary_color?: string;
  llm_model?: string;
  llm_temperature?: number;
  rag_top_k?: number;
}

// Update avatar request
export interface UpdateAvatarRequest {
  name?: string;
  description?: string;
  status?: AvatarStatus;
  system_prompt?: string;
  welcome_message?: string;
  fallback_message?: string;
  avatar_image_url?: string;
  primary_color?: string;
  llm_model?: string;
  llm_temperature?: number;
  rag_top_k?: number;
}

// Avatars list response
export interface AvatarsListResponse {
  items: Avatar[];
  total: number;
  skip: number;
  limit: number;
}

// Avatars list params
export interface AvatarsListParams {
  skip?: number;
  limit?: number;
  status?: AvatarStatus;
  search?: string;
}

// Publish/Unpublish response
export interface PublishResponse {
  id: string;
  is_published: boolean;
  status: AvatarStatus;
}

