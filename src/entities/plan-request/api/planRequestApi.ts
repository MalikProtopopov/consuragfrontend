import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  PlanRequestListResponse,
  PlanRequestListParams,
  PlanRequestDetail,
  UpdatePlanRequestData,
  CreatePlanRequestData,
  PlanRequestCreatedResponse,
} from "@/shared/types/api";

/**
 * Plan Request API methods
 */
export const planRequestApi = {
  /**
   * Get list of plan requests (admin only)
   */
  getList: async (params?: PlanRequestListParams): Promise<PlanRequestListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.status) queryParams.set("status", params.status);
    if (params?.request_type) queryParams.set("request_type", params.request_type);
    if (params?.sort_by) queryParams.set("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.set("sort_order", params.sort_order);

    const query = queryParams.toString();
    const url = query
      ? `${API_ENDPOINTS.PLAN_REQUESTS.LIST}?${query}`
      : API_ENDPOINTS.PLAN_REQUESTS.LIST;

    return apiClient.get<PlanRequestListResponse>(url);
  },

  /**
   * Get plan request by ID (admin only)
   */
  getById: async (id: string): Promise<PlanRequestDetail> => {
    return apiClient.get<PlanRequestDetail>(API_ENDPOINTS.PLAN_REQUESTS.BY_ID(id));
  },

  /**
   * Update plan request (admin only)
   */
  update: async (id: string, data: UpdatePlanRequestData): Promise<PlanRequestDetail> => {
    return apiClient.patch<UpdatePlanRequestData, PlanRequestDetail>(
      API_ENDPOINTS.PLAN_REQUESTS.BY_ID(id),
      data
    );
  },

  /**
   * Delete plan request (admin only)
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.PLAN_REQUESTS.BY_ID(id));
  },

  /**
   * Create a plan request (public - works with or without auth)
   */
  create: async (data: CreatePlanRequestData): Promise<PlanRequestCreatedResponse> => {
    return apiClient.post<CreatePlanRequestData, PlanRequestCreatedResponse>(
      API_ENDPOINTS.PLAN_REQUESTS.LIST,
      data
    );
  },
};

