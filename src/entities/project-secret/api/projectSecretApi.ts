import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  ProjectSecret,
  ProjectSecretListResponse,
  CreateProjectSecretRequest,
  UpdateProjectSecretRequest,
  TelegramValidationResult,
  ValidateKeyRequest,
} from "@/shared/types/api";

/**
 * Project Secret API methods (OWNER only)
 */
export const projectSecretApi = {
  /**
   * Get list of project secrets
   */
  list: async (projectId: string): Promise<ProjectSecretListResponse> => {
    return apiClient.get<ProjectSecretListResponse>(
      API_ENDPOINTS.PROJECT_SECRETS.LIST(projectId)
    );
  },

  /**
   * Get project secret by key
   */
  getByKey: async (projectId: string, key: string): Promise<ProjectSecret> => {
    return apiClient.get<ProjectSecret>(
      API_ENDPOINTS.PROJECT_SECRETS.BY_KEY(projectId, key)
    );
  },

  /**
   * Create new project secret
   */
  create: async (
    projectId: string,
    data: CreateProjectSecretRequest
  ): Promise<ProjectSecret> => {
    return apiClient.post<CreateProjectSecretRequest, ProjectSecret>(
      API_ENDPOINTS.PROJECT_SECRETS.CREATE(projectId),
      data
    );
  },

  /**
   * Update existing project secret
   */
  update: async (
    projectId: string,
    key: string,
    data: UpdateProjectSecretRequest
  ): Promise<ProjectSecret> => {
    return apiClient.put<UpdateProjectSecretRequest, ProjectSecret>(
      API_ENDPOINTS.PROJECT_SECRETS.UPDATE(projectId, key),
      data
    );
  },

  /**
   * Delete project secret
   */
  delete: async (projectId: string, key: string): Promise<void> => {
    await apiClient.delete(
      API_ENDPOINTS.PROJECT_SECRETS.DELETE(projectId, key)
    );
  },

  /**
   * Validate Telegram bot token
   */
  validateTelegram: async (
    projectId: string,
    value: string
  ): Promise<TelegramValidationResult> => {
    return apiClient.post<ValidateKeyRequest, TelegramValidationResult>(
      API_ENDPOINTS.PROJECT_SECRETS.VALIDATE_TELEGRAM(projectId),
      { value }
    );
  },
};

