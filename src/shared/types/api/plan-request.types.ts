/**
 * Plan Request types
 * For managing plan upgrade, demo, and contact sales requests
 */

export type PlanRequestType = "plan_upgrade" | "demo_request" | "contact_sales";
export type PlanRequestStatus = "new" | "in_progress" | "completed" | "rejected";

export interface PlanRequestUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
}

export interface PlanRequestBudget {
  plan: string;
  chat_tokens_used: number;
  chat_tokens_limit: number;
  embedding_tokens_used: number;
  embedding_tokens_limit: number;
  usage_percent: number;
  period_start: string;
  period_end: string;
}

export interface PlanRequestDetail {
  id: string;
  request_type: PlanRequestType;
  status: PlanRequestStatus;
  requested_plan: string | null;
  created_at: string;
  updated_at: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_telegram: string | null;
  user: PlanRequestUser | null;
  current_budget: PlanRequestBudget | null;
  message: string | null;
  admin_notes: string | null;
  processed_at: string | null;
  processed_by: string | null;
  ip_address: string | null;
}

export interface PlanRequestListResponse {
  total: number;
  skip: number;
  limit: number;
  requests: PlanRequestDetail[];
}

export interface PlanRequestListParams {
  skip?: number;
  limit?: number;
  status?: PlanRequestStatus;
  request_type?: PlanRequestType;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface UpdatePlanRequestData {
  status?: PlanRequestStatus;
  admin_notes?: string;
}

// Response when creating a plan request (public endpoint)
export interface CreatePlanRequestData {
  request_type: PlanRequestType;
  requested_plan?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_telegram?: string;
  message?: string;
}

export interface PlanRequestCreatedResponse {
  id: string;
  request_type: PlanRequestType;
  status: PlanRequestStatus;
  requested_plan: string | null;
  created_at: string;
}

