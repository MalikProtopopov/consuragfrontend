"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { chatApi } from "../api/chatApi";
import type {
  ChatMessage,
  ChatSource,
  FeedbackType,
  SessionsListParams,
} from "@/shared/types/api";

/**
 * Query keys for chat
 */
export const chatKeys = {
  all: ["chat"] as const,
  info: (avatarId: string) => [...chatKeys.all, "info", avatarId] as const,
  history: (avatarId: string, sessionId: string) =>
    [...chatKeys.all, "history", avatarId, sessionId] as const,
  sessions: (params?: SessionsListParams) =>
    [...chatKeys.all, "sessions", params] as const,
  session: (sessionId: string) => [...chatKeys.all, "session", sessionId] as const,
};

/**
 * Hook to get avatar public info
 */
export function useAvatarInfo(avatarId: string) {
  return useQuery({
    queryKey: chatKeys.info(avatarId),
    queryFn: () => chatApi.getInfo(avatarId),
    enabled: !!avatarId,
  });
}

/**
 * Hook for chat functionality
 */
export function useChat(avatarId: string, source: ChatSource = "web") {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create session
  const createSession = useCallback(async () => {
    try {
      const response = await chatApi.createSession(avatarId, source);
      setSessionId(response.session_id);
      setMessages([]);
      return response;
    } catch (error) {
      throw error;
    }
  }, [avatarId, source]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId) {
        // Create session first
        const session = await createSession();
        return sendMessageInternal(session.session_id, content);
      }
      return sendMessageInternal(sessionId, content);
    },
    [sessionId, createSession]
  );

  const sendMessageInternal = async (sid: string, content: string) => {
    setIsLoading(true);
    try {
      const response = await chatApi.sendMessage(avatarId, sid, content);
      setMessages((prev) => [
        ...prev,
        response.user_message,
        response.assistant_message,
      ]);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  // Load history
  const loadHistory = useCallback(async () => {
    if (!sessionId) return;
    try {
      const response = await chatApi.getHistory(avatarId, { session_id: sessionId });
      setMessages(response.messages);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }, [avatarId, sessionId]);

  // Reset chat
  const resetChat = useCallback(() => {
    setSessionId(null);
    setMessages([]);
  }, []);

  // Send feedback
  const sendFeedbackMutation = useMutation({
    mutationFn: ({
      messageId,
      feedback,
      comment,
    }: {
      messageId: string;
      feedback: FeedbackType;
      comment?: string;
    }) => chatApi.sendFeedback(avatarId, messageId, feedback, comment),
    onSuccess: (_, { messageId, feedback }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, feedback } : msg
        )
      );
    },
  });

  return {
    sessionId,
    messages,
    isLoading,
    createSession,
    sendMessage,
    loadHistory,
    resetChat,
    sendFeedback: sendFeedbackMutation.mutate,
    isSendingFeedback: sendFeedbackMutation.isPending,
  };
}

/**
 * Hook to get chat history
 */
export function useChatHistory(avatarId: string, sessionId: string) {
  return useQuery({
    queryKey: chatKeys.history(avatarId, sessionId),
    queryFn: () => chatApi.getHistory(avatarId, { session_id: sessionId }),
    enabled: !!avatarId && !!sessionId,
  });
}

/**
 * Hook to get sessions list (admin)
 */
export function useSessions(params?: SessionsListParams) {
  return useQuery({
    queryKey: chatKeys.sessions(params),
    queryFn: () => chatApi.getSessions(params),
  });
}

/**
 * Hook to get session detail (admin)
 */
export function useSession(sessionId: string) {
  return useQuery({
    queryKey: chatKeys.session(sessionId),
    queryFn: () => chatApi.getSession(sessionId),
    enabled: !!sessionId,
  });
}

