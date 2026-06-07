/**
 * Auth API types.
 *
 * ── Паттерн миграции на сгенерированные типы (T-24) ──────────────────────────
 * Базовые типы — алиасы на `components["schemas"][...]` из `generated.ts`
 * (сгенерирован `npm run codegen:api` из `docs/openapi.json`). Внешние имена
 * типов (`User`, `TokenResponse`, `LoginRequest`, …) НЕ меняются — остальные
 * файлы продолжают импортировать их как раньше.
 *
 * Где спецификация openapi отстаёт от фактического контракта бэкенда (поля
 * `avatar_url`, `updated_at`, `last_login_ip`, `projects_count`, ответы
 * verify/resend email — в openapi отсутствуют, но реально используются UI),
 * сгенерированный тип РАСШИРЯЕТСЯ пересечением (`& { … }`) с пометкой
 * `// not in openapi`. После обновления спеки расширения убираются.
 *
 * Эта entity — образец. Остальные `*.types.ts` мигрируются по одной (backlog).
 */
import type { components } from "./generated";

// User roles
export type UserRole = components["schemas"]["UserRole"];

// User status
export type UserStatus = components["schemas"]["UserStatus"];

// User response from API
// openapi: UserResponse не содержит avatar_url/updated_at — добавлены контрактом бэкенда
export type User = components["schemas"]["UserResponse"] & {
  avatar_url: string | null; // not in openapi
  updated_at: string; // not in openapi
};

// Detailed user response (admin)
// openapi: UserDetailResponse не содержит last_login_ip/projects_count/avatar_url
export type UserDetail = components["schemas"]["UserDetailResponse"] & {
  avatar_url: string | null; // not in openapi
  last_login_ip: string | null; // not in openapi
  projects_count: number; // not in openapi
};

// Login request
export type LoginRequest = components["schemas"]["UserLogin"];

// Login response
export type TokenResponse = components["schemas"]["TokenResponse"];

// Register request
export type RegisterRequest = components["schemas"]["UserCreate"];

// Update profile request
export type UpdateProfileRequest = components["schemas"]["UserUpdate"];

// Change password request
export type ChangePasswordRequest = components["schemas"]["PasswordChange"];

// Email verification response (нет схемы в openapi — ручной тип)
export interface VerifyEmailResponse {
  message: string;
  email: string;
}

// Resend verification request (нет схемы в openapi — ручной тип)
export interface ResendVerificationRequest {
  email: string;
}

// Resend verification response (нет схемы в openapi — ручной тип)
export interface ResendVerificationResponse {
  message: string;
}

// Resend verification error details (for cooldown)
export interface ResendVerificationErrorDetails {
  wait_seconds: number;
}

// Admin: Create user request
// openapi AdminUserCreate не описывает is_email_verified, но бэкенд его принимает
export type AdminCreateUserRequest = components["schemas"]["AdminUserCreate"] & {
  is_email_verified?: boolean; // not in openapi
};

// Admin: Update user request
export type AdminUpdateUserRequest = components["schemas"]["AdminUserUpdate"];

// Users list response
// openapi UserListResponse.items: UserResponse[] — UI рендерит расширенный UserDetail
export type UsersListResponse = Omit<
  components["schemas"]["UserListResponse"],
  "items"
> & {
  items: UserDetail[];
};

// Users list query params
export interface UsersListParams {
  skip?: number;
  limit?: number;
  role?: UserRole;
  user_status?: UserStatus;
  search?: string;
}
