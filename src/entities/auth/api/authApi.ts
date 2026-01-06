import { apiClient, tokenManager } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  User,
  LoginRequest,
  TokenResponse,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/shared/types/api";

/**
 * Auth API methods
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<LoginRequest, TokenResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    
    // Save tokens to localStorage
    tokenManager.setTokens(response.access_token, response.refresh_token);
    
    return response;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<User> => {
    return apiClient.post<RegisterRequest, User>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post<void, void>(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Always clear tokens, even if API call fails
      tokenManager.clearTokens();
    }
  },

  /**
   * Refresh access token
   */
  refresh: async (): Promise<TokenResponse> => {
    const response = await apiClient.post<void, TokenResponse>(API_ENDPOINTS.AUTH.REFRESH);
    // Save new tokens
    tokenManager.setTokens(response.access_token, response.refresh_token);
    return response;
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<User> => {
    return apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
  },

  /**
   * Update current user profile
   */
  updateMe: async (data: UpdateProfileRequest): Promise<User> => {
    return apiClient.put<UpdateProfileRequest, User>(
      API_ENDPOINTS.AUTH.UPDATE_ME,
      data
    );
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post<ChangePasswordRequest, void>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      data
    );
  },
};
