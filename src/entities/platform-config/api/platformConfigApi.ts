import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  PlatformConfig,
  PlatformConfigListResponse,
  CreatePlatformConfigRequest,
  UpdatePlatformConfigRequest,
  ValidationResult,
  ValidateKeyRequest,
} from "@/shared/types/api";

/**
 * Platform Config API methods (SAAS_ADMIN only)
 */
export const platformConfigApi = {
  /**
   * Get list of all platform configurations
   */
  list: async (): Promise<PlatformConfigListResponse> => {
    return apiClient.get<PlatformConfigListResponse>(
      API_ENDPOINTS.PLATFORM_CONFIG.LIST
    );
  },

  /**
   * Get platform configuration by key
   */
  getByKey: async (key: string): Promise<PlatformConfig> => {
    return apiClient.get<PlatformConfig>(
      API_ENDPOINTS.PLATFORM_CONFIG.BY_KEY(key)
    );
  },

  /**
   * Create new platform configuration
   */
  create: async (data: CreatePlatformConfigRequest): Promise<PlatformConfig> => {
    return apiClient.post<CreatePlatformConfigRequest, PlatformConfig>(
      API_ENDPOINTS.PLATFORM_CONFIG.CREATE,
      data
    );
  },

  /**
   * Update existing platform configuration
   */
  update: async (
    key: string,
    data: UpdatePlatformConfigRequest
  ): Promise<PlatformConfig> => {
    return apiClient.put<UpdatePlatformConfigRequest, PlatformConfig>(
      API_ENDPOINTS.PLATFORM_CONFIG.UPDATE(key),
      data
    );
  },

  /**
   * Delete platform configuration
   */
  delete: async (key: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.PLATFORM_CONFIG.DELETE(key));
  },

  /**
   * Validate API key
   */
  validate: async (key: string, value: string): Promise<ValidationResult> => {
    return apiClient.post<ValidateKeyRequest, ValidationResult>(
      API_ENDPOINTS.PLATFORM_CONFIG.VALIDATE(key),
      { value }
    );
  },
};

