import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  Avatar,
  AvatarStats,
  AvatarsListResponse,
  AvatarsListParams,
  CreateAvatarRequest,
  UpdateAvatarRequest,
  PublishResponse,
  DeleteResponse,
} from "@/shared/types/api";

/**
 * Avatar API methods
 */
export const avatarApi = {
  /**
   * Get avatars list for project
   */
  list: async (
    projectId: string,
    params?: AvatarsListParams
  ): Promise<AvatarsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.status) queryParams.set("status", params.status);
    if (params?.search) queryParams.set("search", params.search);

    const query = queryParams.toString();
    const baseUrl = API_ENDPOINTS.AVATARS.LIST(projectId);
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    return apiClient.get<AvatarsListResponse>(url);
  },

  /**
   * Get avatar by ID
   */
  getById: async (projectId: string, avatarId: string): Promise<Avatar> => {
    return apiClient.get<Avatar>(API_ENDPOINTS.AVATARS.BY_ID(projectId, avatarId));
  },

  /**
   * Create new avatar
   */
  create: async (projectId: string, data: CreateAvatarRequest): Promise<Avatar> => {
    return apiClient.post<CreateAvatarRequest, Avatar>(
      API_ENDPOINTS.AVATARS.CREATE(projectId),
      data
    );
  },

  /**
   * Update avatar
   */
  update: async (
    projectId: string,
    avatarId: string,
    data: UpdateAvatarRequest
  ): Promise<Avatar> => {
    return apiClient.put<UpdateAvatarRequest, Avatar>(
      API_ENDPOINTS.AVATARS.UPDATE(projectId, avatarId),
      data
    );
  },

  /**
   * Delete avatar
   */
  delete: async (projectId: string, avatarId: string): Promise<DeleteResponse> => {
    return apiClient.delete<DeleteResponse>(
      API_ENDPOINTS.AVATARS.DELETE(projectId, avatarId)
    );
  },

  /**
   * Publish avatar
   */
  publish: async (projectId: string, avatarId: string): Promise<PublishResponse> => {
    return apiClient.post<void, PublishResponse>(
      API_ENDPOINTS.AVATARS.PUBLISH(projectId, avatarId)
    );
  },

  /**
   * Unpublish avatar
   */
  unpublish: async (projectId: string, avatarId: string): Promise<PublishResponse> => {
    return apiClient.post<void, PublishResponse>(
      API_ENDPOINTS.AVATARS.UNPUBLISH(projectId, avatarId)
    );
  },

  /**
   * Get avatar stats
   */
  getStats: async (projectId: string, avatarId: string): Promise<AvatarStats> => {
    return apiClient.get<AvatarStats>(API_ENDPOINTS.AVATARS.STATS(projectId, avatarId));
  },
};

