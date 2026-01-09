"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endUserApi } from "../api/endUserApi";
import type {
  EndUsersListParams,
  UpdateEndUserRequest,
  BlockEndUserRequest,
  UpdateEndUserLimitsRequest,
  ConversationsListParams,
  ConversationMessagesParams,
  SendMessageToEndUserRequest,
} from "@/shared/types/api";

/**
 * Query keys for end users
 */
export const endUserKeys = {
  all: ["end-users"] as const,
  lists: () => [...endUserKeys.all, "list"] as const,
  list: (projectId: string, params?: EndUsersListParams) =>
    [...endUserKeys.lists(), projectId, params] as const,
  details: () => [...endUserKeys.all, "detail"] as const,
  detail: (projectId: string, endUserId: string) =>
    [...endUserKeys.details(), projectId, endUserId] as const,
  limits: (projectId: string, endUserId: string) =>
    [...endUserKeys.all, "limits", projectId, endUserId] as const,
  conversations: (projectId: string, endUserId: string, params?: ConversationsListParams) =>
    [...endUserKeys.all, "conversations", projectId, endUserId, params] as const,
  projectConversations: (projectId: string, params?: ConversationsListParams) =>
    [...endUserKeys.all, "project-conversations", projectId, params] as const,
  conversation: (projectId: string, conversationId: string) =>
    [...endUserKeys.all, "conversation", projectId, conversationId] as const,
  messages: (projectId: string, conversationId: string, params?: ConversationMessagesParams) =>
    [...endUserKeys.all, "messages", projectId, conversationId, params] as const,
};

// ============================================
// List Hooks
// ============================================

/**
 * Hook to get paginated list of end users
 */
export function useEndUsers(projectId: string, params?: EndUsersListParams) {
  return useQuery({
    queryKey: endUserKeys.list(projectId, params),
    queryFn: () => endUserApi.getList(projectId, params),
    enabled: !!projectId,
  });
}

// ============================================
// Detail Hooks
// ============================================

/**
 * Hook to get end user details
 */
export function useEndUser(projectId: string, endUserId: string) {
  return useQuery({
    queryKey: endUserKeys.detail(projectId, endUserId),
    queryFn: () => endUserApi.getById(projectId, endUserId),
    enabled: !!projectId && !!endUserId,
  });
}

/**
 * Hook to update end user profile
 */
export function useUpdateEndUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      endUserId,
      data,
    }: {
      projectId: string;
      endUserId: string;
      data: UpdateEndUserRequest;
    }) => endUserApi.update(projectId, endUserId, data),
    onSuccess: (updatedUser, { projectId, endUserId }) => {
      queryClient.setQueryData(endUserKeys.detail(projectId, endUserId), updatedUser);
      queryClient.invalidateQueries({ queryKey: endUserKeys.lists() });
    },
  });
}

// ============================================
// Moderation Hooks
// ============================================

/**
 * Hook to block an end user
 */
export function useBlockEndUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      endUserId,
      data,
    }: {
      projectId: string;
      endUserId: string;
      data?: BlockEndUserRequest;
    }) => endUserApi.block(projectId, endUserId, data),
    onSuccess: (_, { projectId, endUserId }) => {
      queryClient.invalidateQueries({ queryKey: endUserKeys.detail(projectId, endUserId) });
      queryClient.invalidateQueries({ queryKey: endUserKeys.lists() });
    },
  });
}

/**
 * Hook to unblock an end user
 */
export function useUnblockEndUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      endUserId,
    }: {
      projectId: string;
      endUserId: string;
    }) => endUserApi.unblock(projectId, endUserId),
    onSuccess: (_, { projectId, endUserId }) => {
      queryClient.invalidateQueries({ queryKey: endUserKeys.detail(projectId, endUserId) });
      queryClient.invalidateQueries({ queryKey: endUserKeys.lists() });
    },
  });
}

// ============================================
// Limits Hooks
// ============================================

/**
 * Hook to get end user limits
 */
export function useEndUserLimits(projectId: string, endUserId: string) {
  return useQuery({
    queryKey: endUserKeys.limits(projectId, endUserId),
    queryFn: () => endUserApi.getLimits(projectId, endUserId),
    enabled: !!projectId && !!endUserId,
  });
}

/**
 * Hook to update end user limits
 */
export function useUpdateEndUserLimits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      endUserId,
      data,
    }: {
      projectId: string;
      endUserId: string;
      data: UpdateEndUserLimitsRequest;
    }) => endUserApi.updateLimits(projectId, endUserId, data),
    onSuccess: (updatedLimits, { projectId, endUserId }) => {
      queryClient.setQueryData(endUserKeys.limits(projectId, endUserId), updatedLimits);
      queryClient.invalidateQueries({ queryKey: endUserKeys.detail(projectId, endUserId) });
    },
  });
}

// ============================================
// Conversations Hooks
// ============================================

/**
 * Hook to get end user conversations
 */
export function useEndUserConversations(
  projectId: string,
  endUserId: string,
  params?: ConversationsListParams
) {
  return useQuery({
    queryKey: endUserKeys.conversations(projectId, endUserId, params),
    queryFn: () => endUserApi.getUserConversations(projectId, endUserId, params),
    enabled: !!projectId && !!endUserId,
  });
}

/**
 * Hook to get all project conversations
 */
export function useProjectConversations(
  projectId: string,
  params?: ConversationsListParams
) {
  return useQuery({
    queryKey: endUserKeys.projectConversations(projectId, params),
    queryFn: () => endUserApi.getProjectConversations(projectId, params),
    enabled: !!projectId,
  });
}

/**
 * Hook to get conversation details
 */
export function useConversation(projectId: string, conversationId: string) {
  return useQuery({
    queryKey: endUserKeys.conversation(projectId, conversationId),
    queryFn: () => endUserApi.getConversation(projectId, conversationId),
    enabled: !!projectId && !!conversationId,
  });
}

/**
 * Hook to get conversation messages
 */
export function useConversationMessages(
  projectId: string,
  conversationId: string,
  params?: ConversationMessagesParams
) {
  return useQuery({
    queryKey: endUserKeys.messages(projectId, conversationId, params),
    queryFn: () => endUserApi.getConversationMessages(projectId, conversationId, params),
    enabled: !!projectId && !!conversationId,
  });
}

/**
 * Hook to end a conversation
 */
export function useEndConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      conversationId,
    }: {
      projectId: string;
      conversationId: string;
    }) => endUserApi.endConversation(projectId, conversationId),
    onSuccess: (_, { projectId, conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: endUserKeys.conversation(projectId, conversationId),
      });
      queryClient.invalidateQueries({ queryKey: endUserKeys.all });
    },
  });
}

// ============================================
// Messaging Hooks
// ============================================

/**
 * Hook to send message to end user
 */
export function useSendMessageToEndUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      endUserId,
      data,
    }: {
      projectId: string;
      endUserId: string;
      data: SendMessageToEndUserRequest;
    }) => endUserApi.sendMessage(projectId, endUserId, data),
    onSuccess: (_, { projectId }) => {
      // Invalidate conversations to refresh message counts
      queryClient.invalidateQueries({ queryKey: endUserKeys.all });
    },
  });
}

