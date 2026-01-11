import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  TelegramLinkStatus,
  TelegramLinkCode,
  ToggleNotificationsRequest,
  TelegramBotsConfig,
  UpdateAdminBotRequest,
  UpdateUserBotRequest,
  SendTestMessageRequest,
  NotificationLogsParams,
  NotificationLogsResponse,
} from "@/shared/types/api";

/**
 * Notification API methods
 */
export const notificationApi = {
  // ============================================
  // OWNER endpoints
  // ============================================

  /**
   * Get Telegram link status
   */
  getStatus: async (): Promise<TelegramLinkStatus> => {
    return apiClient.get<TelegramLinkStatus>(API_ENDPOINTS.NOTIFICATIONS.STATUS);
  },

  /**
   * Generate Telegram link code
   */
  generateLinkCode: async (): Promise<TelegramLinkCode> => {
    return apiClient.post<Record<string, never>, TelegramLinkCode>(
      API_ENDPOINTS.NOTIFICATIONS.LINK,
      {}
    );
  },

  /**
   * Unlink Telegram
   */
  unlink: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.UNLINK);
  },

  /**
   * Toggle notifications
   */
  toggleNotifications: async (enabled: boolean): Promise<void> => {
    await apiClient.put<ToggleNotificationsRequest, void>(
      API_ENDPOINTS.NOTIFICATIONS.TOGGLE,
      { enabled }
    );
  },

  // ============================================
  // ADMIN endpoints
  // ============================================

  /**
   * Get Telegram bots configuration
   */
  getBotsConfig: async (): Promise<TelegramBotsConfig> => {
    return apiClient.get<TelegramBotsConfig>(API_ENDPOINTS.NOTIFICATIONS.CONFIG);
  },

  /**
   * Update Admin Bot configuration
   */
  updateAdminBot: async (data: UpdateAdminBotRequest): Promise<void> => {
    await apiClient.put<UpdateAdminBotRequest, void>(
      API_ENDPOINTS.NOTIFICATIONS.ADMIN_BOT,
      data
    );
  },

  /**
   * Update User Bot configuration
   */
  updateUserBot: async (data: UpdateUserBotRequest): Promise<void> => {
    await apiClient.put<UpdateUserBotRequest, void>(
      API_ENDPOINTS.NOTIFICATIONS.USER_BOT,
      data
    );
  },

  /**
   * Send test message
   */
  sendTestMessage: async (botType: "admin" | "user"): Promise<void> => {
    await apiClient.post<SendTestMessageRequest, void>(
      API_ENDPOINTS.NOTIFICATIONS.TEST,
      { bot_type: botType }
    );
  },

  /**
   * Get notification logs
   */
  getLogs: async (params?: NotificationLogsParams): Promise<NotificationLogsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.type) queryParams.set("type", params.type);
    if (params?.recipient_type) queryParams.set("recipient_type", params.recipient_type);
    if (params?.status) queryParams.set("status", params.status);

    const query = queryParams.toString();
    const url = query
      ? `${API_ENDPOINTS.NOTIFICATIONS.LOGS}?${query}`
      : API_ENDPOINTS.NOTIFICATIONS.LOGS;

    return apiClient.get<NotificationLogsResponse>(url);
  },
};

