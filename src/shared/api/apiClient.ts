import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { apiUrlManager } from "@/shared/lib/apiUrlManager";

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";

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

  setTokens: (accessToken: string, refreshToken?: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearTokens: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasToken: (): boolean => {
    return !!tokenManager.getAccessToken();
  },
};

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
    // Request interceptor - add auth token
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: unknown) => Promise.reject(error)
    );

    // Response interceptor - handle errors globally
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: unknown) => {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status ?? 500;
          const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

          // Handle 401 - try to refresh token or redirect to login
          if (status === 401 && typeof window !== "undefined") {
            // If we already tried to refresh, redirect to login
            if (originalRequest._retry) {
              tokenManager.clearTokens();
              const isAuthRoute =
                window.location.pathname.startsWith("/login") ||
                window.location.pathname.startsWith("/register");
              if (!isAuthRoute) {
                window.location.href = "/login";
              }
              return Promise.reject(error);
            }

            // Try to refresh token
            const refreshToken = tokenManager.getRefreshToken();
            if (refreshToken) {
              originalRequest._retry = true;
              try {
                const response = await axios.post(
                  `${this.instance.defaults.baseURL}/api/v1/auth/refresh`,
                  {},
                  {
                    headers: {
                      Authorization: `Bearer ${refreshToken}`,
                    },
                  }
                );
                const { access_token, refresh_token } = response.data;
                tokenManager.setTokens(access_token, refresh_token);
                
                // Retry original request
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${access_token}`;
                }
                return this.instance(originalRequest);
              } catch {
                tokenManager.clearTokens();
                const isAuthRoute =
                  window.location.pathname.startsWith("/login") ||
                  window.location.pathname.startsWith("/register");
                if (!isAuthRoute) {
                  window.location.href = "/login";
                }
                return Promise.reject(error);
              }
            }

            // No refresh token, redirect to login
            tokenManager.clearTokens();
            const isAuthRoute =
              window.location.pathname.startsWith("/login") ||
              window.location.pathname.startsWith("/register");
            if (!isAuthRoute) {
              window.location.href = "/login";
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
