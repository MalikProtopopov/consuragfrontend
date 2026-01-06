import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  TelegramIntegration,
  CreateTelegramRequest,
  UpdateTelegramRequest,
  WebhookResponse,
  WebhookUrlResponse,
  SetWebhookRequest,
  DeleteResponse,
  TelegramStats,
  TelegramSessionsListParams,
  TelegramSessionsListResponse,
  TelegramSessionDetailResponse,
  TelegramSessionExportResponse,
  TelegramEventsListParams,
  TelegramEventsListResponse,
} from "@/shared/types/api";

/**
 * Telegram integration API methods
 */
export const telegramApi = {
  /**
   * Get telegram integration for project
   */
  get: async (projectId: string): Promise<TelegramIntegration> => {
    return apiClient.get<TelegramIntegration>(API_ENDPOINTS.TELEGRAM.GET(projectId));
  },

  /**
   * Create telegram integration
   */
  create: async (
    projectId: string,
    data: CreateTelegramRequest
  ): Promise<TelegramIntegration> => {
    return apiClient.post<CreateTelegramRequest, TelegramIntegration>(
      API_ENDPOINTS.TELEGRAM.CREATE(projectId),
      data
    );
  },

  /**
   * Update telegram integration
   */
  update: async (
    projectId: string,
    data: UpdateTelegramRequest
  ): Promise<TelegramIntegration> => {
    return apiClient.put<UpdateTelegramRequest, TelegramIntegration>(
      API_ENDPOINTS.TELEGRAM.UPDATE(projectId),
      data
    );
  },

  /**
   * Delete telegram integration
   */
  delete: async (projectId: string): Promise<DeleteResponse> => {
    return apiClient.delete<DeleteResponse>(API_ENDPOINTS.TELEGRAM.DELETE(projectId));
  },

  /**
   * Get webhook URL for setting up webhook
   */
  getWebhookUrl: async (projectId: string): Promise<WebhookUrlResponse> => {
    return apiClient.get<WebhookUrlResponse>(
      API_ENDPOINTS.TELEGRAM.GET_WEBHOOK_URL(projectId)
    );
  },

  /**
   * Set webhook with URL
   */
  setWebhook: async (
    projectId: string,
    webhookUrl: string
  ): Promise<WebhookResponse> => {
    return apiClient.post<SetWebhookRequest, WebhookResponse>(
      API_ENDPOINTS.TELEGRAM.SET_WEBHOOK(projectId),
      { webhook_url: webhookUrl }
    );
  },

  /**
   * Delete webhook
   */
  deleteWebhook: async (projectId: string): Promise<WebhookResponse> => {
    return apiClient.delete<WebhookResponse>(
      API_ENDPOINTS.TELEGRAM.DELETE_WEBHOOK(projectId)
    );
  },

  // ============================================
  // Analytics & Sessions
  // ============================================

  /**
   * Get telegram statistics
   */
  getStats: async (projectId: string): Promise<TelegramStats> => {
    return apiClient.get<TelegramStats>(API_ENDPOINTS.TELEGRAM.STATS(projectId));
  },

  /**
   * Get telegram sessions list
   */
  getSessions: async (
    projectId: string,
    params?: TelegramSessionsListParams
  ): Promise<TelegramSessionsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status && params.status !== "all") {
      queryParams.set("status", params.status);
    }
    if (params?.search) queryParams.set("search", params.search);
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));

    const query = queryParams.toString();
    const baseUrl = API_ENDPOINTS.TELEGRAM.SESSIONS(projectId);
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    return apiClient.get<TelegramSessionsListResponse>(url);
  },

  /**
   * Get telegram session detail with messages
   */
  getSessionDetail: async (
    projectId: string,
    sessionId: string,
    messagesLimit = 50
  ): Promise<TelegramSessionDetailResponse> => {
    const url = `${API_ENDPOINTS.TELEGRAM.SESSION_DETAIL(projectId, sessionId)}?messages_limit=${messagesLimit}`;
    return apiClient.get<TelegramSessionDetailResponse>(url);
  },

  /**
   * Export session history
   */
  exportSession: async (
    projectId: string,
    sessionId: string
  ): Promise<TelegramSessionExportResponse> => {
    return apiClient.get<TelegramSessionExportResponse>(
      API_ENDPOINTS.TELEGRAM.SESSION_EXPORT(projectId, sessionId)
    );
  },

  /**
   * Get telegram events list
   */
  getEvents: async (
    projectId: string,
    params?: TelegramEventsListParams
  ): Promise<TelegramEventsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.event_type) queryParams.set("event_type", params.event_type);
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));

    const query = queryParams.toString();
    const baseUrl = API_ENDPOINTS.TELEGRAM.EVENTS(projectId);
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    return apiClient.get<TelegramEventsListResponse>(url);
  },
};

