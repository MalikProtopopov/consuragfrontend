import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { apiUrlManager } from "@/shared/lib/apiUrlManager";
import type { TokenResponse } from "@/shared/types/api";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const EXPIRES_AT_KEY = "auth_expires_at";

// Token limit error codes
const TOKEN_LIMIT_ERROR_CODES = ["TOKEN_LIMIT_EXCEEDED", "EMBEDDING_LIMIT_EXCEEDED"] as const;
type TokenLimitErrorCode = typeof TOKEN_LIMIT_ERROR_CODES[number];

// Event emitter for token limit errors
type TokenLimitErrorHandler = (error: {
  code: TokenLimitErrorCode;
  message: string;
  details?: {
    current_usage: number;
    limit: number;
    limit_type: string;
  };
}) => void;

const tokenLimitErrorHandlers: Set<TokenLimitErrorHandler> = new Set();

/**
 * Subscribe to token limit errors
 * Returns unsubscribe function
 */
export function onTokenLimitError(handler: TokenLimitErrorHandler): () => void {
  tokenLimitErrorHandlers.add(handler);
  return () => tokenLimitErrorHandlers.delete(handler);
}

/**
 * Emit token limit error to all subscribers
 */
function emitTokenLimitError(error: {
  code: TokenLimitErrorCode;
  message: string;
  details?: {
    current_usage: number;
    limit: number;
    limit_type: string;
  };
}): void {
  tokenLimitErrorHandlers.forEach((handler) => handler(error));
}

/**
 * Token management utilities
 */
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getExpiresAt: (): number | null => {
    if (typeof window === "undefined") return null;
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
    return expiresAt ? Number(expiresAt) : null;
  },

  setTokens: (accessToken: string, refreshToken?: string, expiresIn?: number): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (expiresIn) {
      const expiresAt = Date.now() + expiresIn * 1000;
      localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
    }
  },

  clearTokens: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  },

  hasToken: (): boolean => {
    return !!tokenManager.getAccessToken();
  },

  /**
   * Check if access token is expired or will expire soon (within 60 seconds)
   */
  isAccessTokenExpired: (): boolean => {
    const expiresAt = tokenManager.getExpiresAt();
    if (!expiresAt) return true;
    // Consider expired 60 seconds before actual expiration for proactive refresh
    return Date.now() > expiresAt - 60000;
  },
};

/**
 * Queue mechanism for handling parallel requests during token refresh
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * Refresh tokens using refresh_token in request body (not header)
 */
async function refreshTokens(refreshToken: string, baseURL: string): Promise<TokenResponse> {
  const response = await axios.post<TokenResponse>(
    `${baseURL}/api/v1/auth/refresh`,
    { refresh_token: refreshToken }
  );
  return response.data;
}

/**
 * API Error interface matching backend error format
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  code: string;
  field?: string;
  details?: Record<string, unknown>;
  status: number;

  constructor(response: ApiErrorResponse, status: number) {
    super(response.error.message);
    this.code = response.error.code;
    this.field = response.error.field;
    this.details = response.error.details;
    this.status = status;
    this.name = "ApiError";
  }
}

/**
 * API Client using Axios
 */
class ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      withCredentials: true, // Send cookies with cross-origin requests
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    const baseURL = this.instance.defaults.baseURL || "";

    // Request interceptor - add auth token with proactive refresh
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Skip auth for refresh endpoint to avoid infinite loop
        if (config.url?.includes("/auth/refresh")) {
          return config;
        }

        const token = tokenManager.getAccessToken();
        const refreshToken = tokenManager.getRefreshToken();

        // Proactive refresh if token is expired or expiring soon
        if (token && tokenManager.isAccessTokenExpired() && refreshToken) {
          if (!isRefreshing) {
            isRefreshing = true;
            try {
              const newTokens = await refreshTokens(refreshToken, baseURL);
              tokenManager.setTokens(
                newTokens.access_token,
                newTokens.refresh_token,
                newTokens.expires_in
              );
              processQueue(null, newTokens.access_token);
            } catch (error) {
              processQueue(error as Error, null);
              // If proactive refresh fails, continue with old token
              // Response interceptor will handle 401
            } finally {
              isRefreshing = false;
            }
          } else {
            // Wait for ongoing refresh to complete
            await new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).catch(() => {
              // Ignore errors, will retry with current token
            });
          }
        }

        // Add current token to request
        const currentToken = tokenManager.getAccessToken();
        if (currentToken && config.headers) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error: unknown) => Promise.reject(error)
    );

    // Response interceptor - handle errors globally with queue mechanism
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: unknown) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status ?? 500;
          const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

          // Handle 401 - try to refresh token or redirect to login
          if (
            status === 401 &&
            typeof window !== "undefined" &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh")
          ) {
            const refreshToken = tokenManager.getRefreshToken();

            if (!refreshToken) {
              // No refresh token - logout and redirect
              tokenManager.clearTokens();
              const isAuthRoute =
                window.location.pathname.startsWith("/login") ||
                window.location.pathname.startsWith("/register");
              if (!isAuthRoute) {
                window.location.href = "/login";
              }
              return Promise.reject(error);
            }

            // If already refreshing, add to queue
            if (isRefreshing) {
              return new Promise((resolve, reject) => {
                failedQueue.push({
                  resolve: (token: string) => {
                    if (originalRequest.headers) {
                      originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    resolve(this.instance(originalRequest));
                  },
                  reject: (err: Error) => reject(err),
                });
              });
            }

              originalRequest._retry = true;
            isRefreshing = true;

              try {
              const newTokens = await refreshTokens(refreshToken, baseURL);
              tokenManager.setTokens(
                newTokens.access_token,
                newTokens.refresh_token,
                newTokens.expires_in
              );
              processQueue(null, newTokens.access_token);
                
              // Retry original request with new token
                if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
                }
                return this.instance(originalRequest);
            } catch (refreshError) {
              processQueue(refreshError as Error, null);
                tokenManager.clearTokens();
                const isAuthRoute =
                  window.location.pathname.startsWith("/login") ||
                  window.location.pathname.startsWith("/register");
                if (!isAuthRoute) {
                  window.location.href = "/login";
                }
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          }

          // Transform error to ApiError if response has expected format
          if (error.response?.data?.error) {
            const apiError = error.response.data as ApiErrorResponse;
            
            // Check for token limit errors and emit event
            if (
              TOKEN_LIMIT_ERROR_CODES.includes(apiError.error.code as TokenLimitErrorCode)
            ) {
              emitTokenLimitError({
                code: apiError.error.code as TokenLimitErrorCode,
                message: apiError.error.message,
                details: apiError.error.details as {
                  current_usage: number;
                  limit: number;
                  limit_type: string;
                } | undefined,
              });
            }
            
            throw new ApiError(apiError, status);
          }

          // Generic error
          throw new ApiError(
            {
              error: {
                code: "UNKNOWN_ERROR",
                message: error.message || "An unknown error occurred",
              },
            },
            status
          );
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    const response = await this.instance.post<TResponse>(url, data, config);
    return response.data;
  }

  async put<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    const response = await this.instance.put<TResponse>(url, data, config);
    return response.data;
  }

  async patch<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    const response = await this.instance.patch<TResponse>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Upload file with multipart/form-data
   */
  async upload<TResponse>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<TResponse> {
    const response = await this.instance.post<TResponse>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Get raw Axios instance for custom use cases
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }
}

export const apiClient = new ApiClient(apiUrlManager.getApiUrl());

export { ApiClient };
