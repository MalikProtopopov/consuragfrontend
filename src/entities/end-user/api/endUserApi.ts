import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  EndUsersListParams,
  EndUsersListResponse,
  EndUserDetailResponse,
  UpdateEndUserRequest,
  BlockEndUserRequest,
  BlockEndUserResponse,
  UnblockEndUserResponse,
  EndUserLimits,
  UpdateEndUserLimitsRequest,
  ConversationsListParams,
  ConversationsListResponse,
  Conversation,
  ConversationMessagesParams,
  ConversationMessagesResponse,
  SendMessageToEndUserRequest,
  SendMessageResponse,
  EndConversationResponse,
} from "@/shared/types/api";

/**
 * End Users API methods
 */
export const endUserApi = {
  // ============================================
  // End Users CRUD
  // ============================================

  /**
   * Get paginated list of end users for a project
   */
  getList: async (
    projectId: string,
    params?: EndUsersListParams
  ): Promise<EndUsersListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.status) queryParams.set("status", params.status);
    if (params?.search) queryParams.set("search", params.search);
    if (params?.channel) queryParams.set("channel", params.channel);
    if (params?.order_by) queryParams.set("order_by", params.order_by);
    if (params?.order_desc !== undefined) queryParams.set("order_desc", String(params.order_desc));

    const query = queryParams.toString();
    const baseUrl = API_ENDPOINTS.END_USERS.LIST(projectId);
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    return apiClient.get<EndUsersListResponse>(url);
  },

  /**
   * Get end user details by ID
   */
  getById: async (
    projectId: string,
    endUserId: string
  ): Promise<EndUserDetailResponse> => {
    return apiClient.get<EndUserDetailResponse>(
      API_ENDPOINTS.END_USERS.BY_ID(projectId, endUserId)
    );
  },

  /**
   * Update end user profile
   */
  update: async (
    projectId: string,
    endUserId: string,
    data: UpdateEndUserRequest
  ): Promise<EndUserDetailResponse> => {
    return apiClient.patch<UpdateEndUserRequest, EndUserDetailResponse>(
      API_ENDPOINTS.END_USERS.UPDATE(projectId, endUserId),
      data
    );
  },

  // ============================================
  // Moderation
  // ============================================

  /**
   * Block an end user
   */
  block: async (
    projectId: string,
    endUserId: string,
    data?: BlockEndUserRequest
  ): Promise<BlockEndUserResponse> => {
    return apiClient.post<BlockEndUserRequest | undefined, BlockEndUserResponse>(
      API_ENDPOINTS.END_USERS.BLOCK(projectId, endUserId),
      data
    );
  },

  /**
   * Unblock an end user
   */
  unblock: async (
    projectId: string,
    endUserId: string
  ): Promise<UnblockEndUserResponse> => {
    return apiClient.delete<UnblockEndUserResponse>(
      API_ENDPOINTS.END_USERS.UNBLOCK(projectId, endUserId)
    );
  },

  // ============================================
  // Limits
  // ============================================

  /**
   * Get end user limits
   */
  getLimits: async (
    projectId: string,
    endUserId: string
  ): Promise<EndUserLimits> => {
    return apiClient.get<EndUserLimits>(
      API_ENDPOINTS.END_USERS.LIMITS(projectId, endUserId)
    );
  },

  /**
   * Update end user limits
   */
  updateLimits: async (
    projectId: string,
    endUserId: string,
    data: UpdateEndUserLimitsRequest
  ): Promise<EndUserLimits> => {
    return apiClient.put<UpdateEndUserLimitsRequest, EndUserLimits>(
      API_ENDPOINTS.END_USERS.LIMITS(projectId, endUserId),
      data
    );
  },

  // ============================================
  // Conversations
  // ============================================

  /**
   * Get conversations for a specific end user
   */
  getUserConversations: async (
    projectId: string,
    endUserId: string,
    params?: ConversationsListParams
  ): Promise<ConversationsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.status) queryParams.set("status", params.status);

    const query = queryParams.toString();
    const baseUrl = API_ENDPOINTS.END_USERS.CONVERSATIONS(projectId, endUserId);
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    return apiClient.get<ConversationsListResponse>(url);
  },

  /**
   * Get all conversations for a project
   */
  getProjectConversations: async (
    projectId: string,
    params?: ConversationsListParams
  ): Promise<ConversationsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.status) queryParams.set("status", params.status);
    if (params?.end_user_id) queryParams.set("end_user_id", params.end_user_id);
    if (params?.channel) queryParams.set("channel", params.channel);

    const query = queryParams.toString();
    const baseUrl = API_ENDPOINTS.CONVERSATIONS.LIST(projectId);
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    return apiClient.get<ConversationsListResponse>(url);
  },

  /**
   * Get conversation by ID
   */
  getConversation: async (
    projectId: string,
    conversationId: string
  ): Promise<Conversation> => {
    return apiClient.get<Conversation>(
      API_ENDPOINTS.CONVERSATIONS.BY_ID(projectId, conversationId)
    );
  },

  /**
   * Get conversation messages
   */
  getConversationMessages: async (
    projectId: string,
    conversationId: string,
    params?: ConversationMessagesParams
  ): Promise<ConversationMessagesResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));

    const query = queryParams.toString();
    const baseUrl = API_ENDPOINTS.CONVERSATIONS.MESSAGES(projectId, conversationId);
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    return apiClient.get<ConversationMessagesResponse>(url);
  },

  /**
   * End a conversation
   */
  endConversation: async (
    projectId: string,
    conversationId: string
  ): Promise<EndConversationResponse> => {
    return apiClient.post<undefined, EndConversationResponse>(
      API_ENDPOINTS.CONVERSATIONS.END(projectId, conversationId),
      undefined
    );
  },

  // ============================================
  // Messaging
  // ============================================

  /**
   * Send message to end user
   */
  sendMessage: async (
    projectId: string,
    endUserId: string,
    data: SendMessageToEndUserRequest
  ): Promise<SendMessageResponse> => {
    return apiClient.post<SendMessageToEndUserRequest, SendMessageResponse>(
      API_ENDPOINTS.END_USERS.SEND_MESSAGE(projectId, endUserId),
      data
    );
  },
};

