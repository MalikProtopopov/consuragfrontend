import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  PlatformAnalytics,
  AuditLogsResponse,
  AuditLogsParams,
  ProjectUsage,
  ProjectTrendResponse,
  ProjectTrendParams,
} from "@/shared/types/api";

/**
 * Analytics API methods
 */
export const analyticsApi = {
  /**
   * Get platform analytics (admin only)
   */
  getPlatformStats: async (): Promise<PlatformAnalytics> => {
    return apiClient.get<PlatformAnalytics>(API_ENDPOINTS.ANALYTICS.PLATFORM);
  },

  /**
   * Get audit logs (admin only)
   */
  getAuditLogs: async (params?: AuditLogsParams): Promise<AuditLogsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.user_id) queryParams.set("user_id", params.user_id);
    if (params?.action) queryParams.set("action", params.action);
    if (params?.resource_type) queryParams.set("resource_type", params.resource_type);
    if (params?.start_date) queryParams.set("start_date", params.start_date);
    if (params?.end_date) queryParams.set("end_date", params.end_date);

    const query = queryParams.toString();
    const url = query
      ? `${API_ENDPOINTS.ANALYTICS.PLATFORM_AUDIT}?${query}`
      : API_ENDPOINTS.ANALYTICS.PLATFORM_AUDIT;

    return apiClient.get<AuditLogsResponse>(url);
  },

  /**
   * Get project usage analytics
   */
  getProjectUsage: async (projectId: string): Promise<ProjectUsage> => {
    return apiClient.get<ProjectUsage>(
      API_ENDPOINTS.ANALYTICS.PROJECT_USAGE(projectId)
    );
  },

  /**
   * Get project trend data
   */
  getProjectTrend: async (
    projectId: string,
    params?: ProjectTrendParams
  ): Promise<ProjectTrendResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.set("period", params.period);
    if (params?.start_date) queryParams.set("start_date", params.start_date);
    if (params?.end_date) queryParams.set("end_date", params.end_date);

    const query = queryParams.toString();
    const baseUrl = API_ENDPOINTS.ANALYTICS.PROJECT_TREND(projectId);
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    return apiClient.get<ProjectTrendResponse>(url);
  },
};

