/**
 * API types re-exports
 */

// Auth
export * from "./auth.types";

// Project
export * from "./project.types";

// Avatar
export * from "./avatar.types";

// Document
export * from "./document.types";

// Chat
export * from "./chat.types";

// Analytics
export * from "./analytics.types";

// Telegram
export * from "./telegram.types";

// Billing
export * from "./billing.types";

// Config (API Keys & Secrets)
export * from "./config.types";

// End Users (B2C)
export * from "./end-user.types";

// Plan Requests
export * from "./plan-request.types";

// Notifications
export * from "./notification.types";

// Common list response type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// Common list params
export interface PaginationParams {
  skip?: number;
  limit?: number;
}

// API success message response
export interface SuccessResponse {
  message: string;
}

// Delete response
export interface DeleteResponse {
  deleted: boolean;
  id: string;
}

