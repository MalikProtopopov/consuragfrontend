import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  UsageSummary,
  UsageHistory,
  UsageBreakdown,
  PlanInfo,
  BillingLimits,
  PlatformUsage,
  UsersUsageResponse,
  UsersUsageParams,
  UserUsage,
  UserBudget,
  UpdateUserLimitsRequest,
  UpdateUserPlanRequest,
  AddBonusTokensRequest,
} from "@/shared/types/api";

/**
 * Billing API methods
 */
export const billingApi = {
  // ==================== OWNER endpoints ====================

  /**
   * Get usage summary for current period
   */
  getUsageSummary: async (): Promise<UsageSummary> => {
    return apiClient.get<UsageSummary>(API_ENDPOINTS.BILLING.USAGE_SUMMARY);
  },

  /**
   * Get usage history by days
   */
  getUsageHistory: async (days: number = 30): Promise<UsageHistory> => {
    const url = `${API_ENDPOINTS.BILLING.USAGE_HISTORY}?days=${days}`;
    return apiClient.get<UsageHistory>(url);
  },

  /**
   * Get usage breakdown by projects/avatars
   */
  getUsageBreakdown: async (): Promise<UsageBreakdown> => {
    return apiClient.get<UsageBreakdown>(API_ENDPOINTS.BILLING.USAGE_BREAKDOWN);
  },

  /**
   * Get current limits and plan
   */
  getLimits: async (): Promise<BillingLimits> => {
    return apiClient.get<BillingLimits>(API_ENDPOINTS.BILLING.LIMITS);
  },

  /**
   * Get current plan info
   */
  getPlanInfo: async (): Promise<PlanInfo> => {
    return apiClient.get<PlanInfo>(API_ENDPOINTS.BILLING.PLAN);
  },

  // ==================== ADMIN endpoints ====================

  /**
   * Get platform usage stats (admin only)
   */
  getPlatformUsage: async (): Promise<PlatformUsage> => {
    return apiClient.get<PlatformUsage>(API_ENDPOINTS.BILLING.ADMIN_PLATFORM);
  },

  /**
   * Get users usage list (admin only)
   */
  getUsersUsage: async (params?: UsersUsageParams): Promise<UsersUsageResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.plan) queryParams.set("plan", params.plan);
    if (params?.sort_by) queryParams.set("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.set("sort_order", params.sort_order);

    const query = queryParams.toString();
    const url = query
      ? `${API_ENDPOINTS.BILLING.ADMIN_USERS}?${query}`
      : API_ENDPOINTS.BILLING.ADMIN_USERS;

    return apiClient.get<UsersUsageResponse>(url);
  },

  /**
   * Get specific user usage (admin only)
   */
  getUserUsage: async (userId: string): Promise<UserUsage> => {
    return apiClient.get<UserUsage>(API_ENDPOINTS.BILLING.ADMIN_USER_USAGE(userId));
  },

  /**
   * Get specific user budget (admin only)
   */
  getUserBudget: async (userId: string): Promise<UserBudget> => {
    return apiClient.get<UserBudget>(API_ENDPOINTS.BILLING.ADMIN_USER_BUDGET(userId));
  },

  /**
   * Update user limits (admin only)
   */
  updateUserLimits: async (
    userId: string,
    data: UpdateUserLimitsRequest
  ): Promise<UserBudget> => {
    return apiClient.put<UpdateUserLimitsRequest, UserBudget>(
      API_ENDPOINTS.BILLING.ADMIN_USER_LIMITS(userId),
      data
    );
  },

  /**
   * Update user plan (admin only)
   */
  updateUserPlan: async (
    userId: string,
    data: UpdateUserPlanRequest
  ): Promise<UserBudget> => {
    return apiClient.put<UpdateUserPlanRequest, UserBudget>(
      API_ENDPOINTS.BILLING.ADMIN_USER_PLAN(userId),
      data
    );
  },

  /**
   * Add bonus tokens to user (admin only)
   */
  addBonusTokens: async (
    userId: string,
    data: AddBonusTokensRequest
  ): Promise<UserBudget> => {
    return apiClient.post<AddBonusTokensRequest, UserBudget>(
      API_ENDPOINTS.BILLING.ADMIN_BONUS_TOKENS(userId),
      data
    );
  },

  /**
   * Reset user period (admin only)
   */
  resetUserPeriod: async (userId: string): Promise<UserBudget> => {
    return apiClient.post<undefined, UserBudget>(
      API_ENDPOINTS.BILLING.ADMIN_RESET_PERIOD(userId),
      undefined
    );
  },
};

