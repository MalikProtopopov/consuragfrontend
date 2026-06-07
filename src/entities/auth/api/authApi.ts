import { apiClient, tokenManager } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  User,
  LoginRequest,
  TokenResponse,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
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
    
    // Сохраняем токены: tokenManager синхронно пишет и localStorage, и cookie
    // access_token (для middleware) с одинаковым сроком жизни (T-23).
    tokenManager.setTokens(response.access_token, response.refresh_token, response.expires_in);

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
   * @param logoutFromAllDevices - If true, logout from all devices. If false, logout only from current device.
   */
  logout: async (logoutFromAllDevices = false): Promise<void> => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      // Send refresh_token to logout from single device, or empty body to logout from all
      await apiClient.post<{ refresh_token?: string } | undefined, void>(
        API_ENDPOINTS.AUTH.LOGOUT,
        logoutFromAllDevices ? undefined : { refresh_token: refreshToken ?? undefined }
      );
    } finally {
      // Always clear tokens — tokenManager чистит и localStorage, и cookie (T-23)
      tokenManager.clearTokens();
    }
  },

  /**
   * Refresh access token
   */
  refresh: async (): Promise<TokenResponse> => {
    const response = await apiClient.post<void, TokenResponse>(API_ENDPOINTS.AUTH.REFRESH);
    // tokenManager.setTokens синхронно обновляет и localStorage, и cookie (T-23)
    tokenManager.setTokens(response.access_token, response.refresh_token, response.expires_in);

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

  /**
   * Verify email with token from email link
   */
  verifyEmail: async (token: string): Promise<VerifyEmailResponse> => {
    return apiClient.post<void, VerifyEmailResponse>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL(token)
    );
  },

  /**
   * Resend verification email
   */
  resendVerification: async (email: string): Promise<ResendVerificationResponse> => {
    return apiClient.post<ResendVerificationRequest, ResendVerificationResponse>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      { email }
    );
  },
};
