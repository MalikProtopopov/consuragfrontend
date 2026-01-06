/**
 * Project API types based on OpenAPI specification
 */

import type { UserRole } from "./auth.types";

// Project status
export type ProjectStatus = "active" | "inactive" | "archived";

// TOV formality options
export type TovFormality = "formal" | "professional" | "casual" | "friendly";

// TOV personality options
export type TovPersonality = "helpful" | "expert" | "friendly" | "strict";

// Project response
export interface Project {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: ProjectStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
  avatars_count: number;
  members_count: number;
}

// Project detail with settings
export interface ProjectDetail extends Project {
  settings: ProjectSettings;
}

// Project settings
export interface ProjectSettings {
  // TOV (Tone of Voice)
  tov_formality: TovFormality;
  tov_personality: TovPersonality;
  tov_language: string;

  // LLM settings
  llm_model: string;
  llm_temperature: number;
  llm_max_tokens: number;

  // RAG settings
  rag_chunk_size: number;
  rag_chunk_overlap: number;
  rag_top_k: number;
  embedding_model: string;
  custom_system_prompt: string | null;
}

// Create project request
export interface CreateProjectRequest {
  name: string;
  description?: string;
  slug?: string;
}

// Update project request
export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  slug?: string;
  status?: ProjectStatus;
}

// Update project settings request
export interface UpdateProjectSettingsRequest {
  tov_formality?: TovFormality;
  tov_personality?: TovPersonality;
  tov_language?: string;
  llm_model?: string;
  llm_temperature?: number;
  llm_max_tokens?: number;
  rag_chunk_size?: number;
  rag_chunk_overlap?: number;
  rag_top_k?: number;
  embedding_model?: string;
  custom_system_prompt?: string | null;
}

// Project member
export interface ProjectMember {
  user_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  can_manage_settings: boolean;
  can_manage_members: boolean;
  can_manage_avatars: boolean;
  can_manage_documents: boolean;
  can_view_analytics: boolean;
  joined_at: string;
}

// Add member request
export interface AddMemberRequest {
  user_id?: string;
  email?: string;
  role: UserRole;
  can_manage_settings?: boolean;
  can_manage_members?: boolean;
  can_manage_avatars?: boolean;
  can_manage_documents?: boolean;
  can_view_analytics?: boolean;
}

// Update member request
export interface UpdateMemberRequest {
  role?: UserRole;
  can_manage_settings?: boolean;
  can_manage_members?: boolean;
  can_manage_avatars?: boolean;
  can_manage_documents?: boolean;
  can_view_analytics?: boolean;
}

// Projects list response
export interface ProjectsListResponse {
  items: Project[];
  total: number;
  skip: number;
  limit: number;
}

// Projects list params
export interface ProjectsListParams {
  skip?: number;
  limit?: number;
  status?: ProjectStatus;
  search?: string;
}

// Members list response
export interface MembersListResponse {
  items: ProjectMember[];
  total: number;
}

