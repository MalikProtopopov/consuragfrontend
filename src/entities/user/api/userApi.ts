import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  UserDetail,
  UsersListResponse,
  UsersListParams,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
} from "@/shared/types/api";

/**
 * User API methods (Admin only)
 */
export const userApi = {
  /**
   * Get users list
   */
  list: async (params?: UsersListParams): Promise<UsersListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.role) queryParams.set("role", params.role);
    if (params?.user_status) queryParams.set("user_status", params.user_status);
    if (params?.search) queryParams.set("search", params.search);

    const query = queryParams.toString();
    const url = query ? `${API_ENDPOINTS.USERS.LIST}?${query}` : API_ENDPOINTS.USERS.LIST;

    return apiClient.get<UsersListResponse>(url);
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<UserDetail> => {
    return apiClient.get<UserDetail>(API_ENDPOINTS.USERS.BY_ID(id));
  },

  /**
   * Create new user
   */
  create: async (data: AdminCreateUserRequest): Promise<UserDetail> => {
    return apiClient.post<AdminCreateUserRequest, UserDetail>(
      API_ENDPOINTS.USERS.CREATE,
      data
    );
  },

  /**
   * Update user
   */
  update: async (id: string, data: AdminUpdateUserRequest): Promise<UserDetail> => {
    return apiClient.put<AdminUpdateUserRequest, UserDetail>(
      API_ENDPOINTS.USERS.UPDATE(id),
      data
    );
  },
};

