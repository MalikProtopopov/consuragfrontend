/**
 * Auth API types based on OpenAPI specification
 */

// User roles
export type UserRole =
  | "saas_admin"
  | "owner"
  | "manager"
  | "content_manager"
  | "client";

// User status
export type UserStatus = "active" | "inactive" | "suspended" | "pending";

// User response from API
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  is_email_verified: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

// Detailed user response (admin)
export interface UserDetail extends User {
  last_login_ip: string | null;
  projects_count: number;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
}

// Login response
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
}

// Register request
export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

// Update profile request
export interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string;
}

// Change password request
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Admin: Create user request
export interface AdminCreateUserRequest {
  email: string;
  password: string;
  full_name?: string;
  role: UserRole;
  status?: UserStatus;
  is_email_verified?: boolean;
}

// Admin: Update user request
export interface AdminUpdateUserRequest {
  full_name?: string;
  role?: UserRole;
  status?: UserStatus;
  is_email_verified?: boolean;
}

// Users list response
export interface UsersListResponse {
  items: UserDetail[];
  total: number;
  skip: number;
  limit: number;
}

// Users list query params
export interface UsersListParams {
  skip?: number;
  limit?: number;
  role?: UserRole;
  user_status?: UserStatus;
  search?: string;
}

