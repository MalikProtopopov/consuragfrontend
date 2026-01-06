import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  AvatarPublicInfo,
  CreateSessionResponse,
  MessagePair,
  ChatHistoryResponse,
  ChatHistoryParams,
  SendFeedbackRequest,
  SessionsListResponse,
  SessionsListParams,
  SessionDetail,
  ChatSource,
  FeedbackType,
  SuccessResponse,
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
    return apiClient.post<void, CreateSessionResponse>(url);
  },

  /**
   * Send message (no auth required)
   */
  sendMessage: async (
    avatarId: string,
    sessionId: string,
    content: string
  ): Promise<MessagePair> => {
    const url = `${API_ENDPOINTS.CHAT.SEND_MESSAGE(avatarId)}?session_id=${sessionId}`;
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
    if (params.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params.limit !== undefined) queryParams.set("limit", String(params.limit));

    const url = `${API_ENDPOINTS.CHAT.HISTORY(avatarId)}?${queryParams.toString()}`;
    return apiClient.get<ChatHistoryResponse>(url);
  },

  /**
   * Send feedback on message (no auth required)
   */
  sendFeedback: async (
    avatarId: string,
    messageId: string,
    feedback: FeedbackType,
    comment?: string
  ): Promise<SuccessResponse> => {
    return apiClient.post<SendFeedbackRequest, SuccessResponse>(
      API_ENDPOINTS.CHAT.FEEDBACK(avatarId, messageId),
      { feedback, comment }
    );
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

