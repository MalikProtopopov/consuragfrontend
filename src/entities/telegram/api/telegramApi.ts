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
};

