import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  AvatarPublicInfo,
  CreateSessionResponse,
  MessagePair,
  ChatHistoryResponse,
  ChatHistoryParams,
  SendFeedbackRequest,
  SendFeedbackResponse,
  SessionsListResponse,
  SessionsListParams,
  SessionDetail,
  ChatSource,
  FeedbackType,
} from "@/shared/types/api";

/**
 * Chat API methods
 */
export const chatApi = {
  /**
   * Get avatar public info (no auth required)
   */
  getInfo: async (avatarId: string): Promise<AvatarPublicInfo> => {
    return apiClient.get<AvatarPublicInfo>(API_ENDPOINTS.CHAT.INFO(avatarId));
  },

  /**
   * Create chat session (no auth required)
   */
  createSession: async (
    avatarId: string,
    source: ChatSource = "web"
  ): Promise<CreateSessionResponse> => {
    const url = `${API_ENDPOINTS.CHAT.CREATE_SESSION(avatarId)}?source=${source}`;
    const response = await apiClient.post<void, CreateSessionResponse>(url);
    return response;
  },

  /**
   * Send message (no auth required).
   * `sessionToken` обязателен — бэкенд проверяет его как owner-токен анонимной сессии.
   */
  sendMessage: async (
    avatarId: string,
    sessionId: string,
    sessionToken: string,
    content: string
  ): Promise<MessagePair> => {
    const query = new URLSearchParams({ session_id: sessionId, session_token: sessionToken });
    const url = `${API_ENDPOINTS.CHAT.SEND_MESSAGE(avatarId)}?${query.toString()}`;
    return apiClient.post<{ content: string }, MessagePair>(url, { content });
  },

  /**
   * Get chat history (no auth required)
   */
  getHistory: async (
    avatarId: string,
    params: ChatHistoryParams
  ): Promise<ChatHistoryResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.set("session_id", params.session_id);
    if (params.session_token) queryParams.set("session_token", params.session_token);
    if (params.limit !== undefined) queryParams.set("limit", String(params.limit));

    const url = `${API_ENDPOINTS.CHAT.HISTORY(avatarId)}?${queryParams.toString()}`;
    const response = await apiClient.get<ChatHistoryResponse>(url);
    return response;
  },

  /**
   * Send feedback on message (no auth required).
   * `sessionToken` прокидывается для авторизации в рамках анонимной сессии.
   */
  sendFeedback: async (
    avatarId: string,
    messageId: string,
    feedback: FeedbackType,
    sessionToken?: string
  ): Promise<SendFeedbackResponse> => {
    const base = API_ENDPOINTS.CHAT.FEEDBACK(avatarId, messageId);
    const url = sessionToken
      ? `${base}?session_token=${encodeURIComponent(sessionToken)}`
      : base;
    return apiClient.post<SendFeedbackRequest, SendFeedbackResponse>(url, { feedback });
  },

  // Admin endpoints (require auth)

  /**
   * Get sessions list (admin)
   */
  getSessions: async (params?: SessionsListParams): Promise<SessionsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.avatar_id) queryParams.set("avatar_id", params.avatar_id);
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.active_only !== undefined) queryParams.set("active_only", String(params.active_only));
    if (params?.source) queryParams.set("source", params.source);

    const query = queryParams.toString();
    const url = query
      ? `${API_ENDPOINTS.CHAT.ADMIN_SESSIONS}?${query}`
      : API_ENDPOINTS.CHAT.ADMIN_SESSIONS;

    return apiClient.get<SessionsListResponse>(url);
  },

  /**
   * Get session detail (admin)
   */
  getSession: async (sessionId: string): Promise<SessionDetail> => {
    return apiClient.get<SessionDetail>(
      API_ENDPOINTS.CHAT.ADMIN_SESSION_BY_ID(sessionId)
    );
  },
};

