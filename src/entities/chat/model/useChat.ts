"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
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
 * localStorage key for session ID
 */
const getSessionStorageKey = (avatarId: string) => `chat_session_${avatarId}`;
const getTokenStorageKey = (avatarId: string) => `chat_session_token_${avatarId}`;

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
 * Hook for chat functionality with localStorage persistence
 */
export function useChat(avatarId: string, source: ChatSource = "web") {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Store session ID/token in refs to avoid closure issues
  const sessionIdRef = useRef<string | null>(null);
  const sessionTokenRef = useRef<string | null>(null);

  // Save session (id + token) to localStorage
  const saveSession = useCallback((sid: string, token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(getSessionStorageKey(avatarId), sid);
      localStorage.setItem(getTokenStorageKey(avatarId), token);
    }
  }, [avatarId]);

  // Clear session from localStorage
  const clearSession = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(getSessionStorageKey(avatarId));
      localStorage.removeItem(getTokenStorageKey(avatarId));
    }
  }, [avatarId]);

  // Get session (id + token) from localStorage — оба обязательны для валидной сессии
  const getSavedSession = useCallback(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(getSessionStorageKey(avatarId));
      const token = localStorage.getItem(getTokenStorageKey(avatarId));
      // Validate it's a proper UUID + есть токен (без него запросы вернут 422)
      if (saved && saved !== "undefined" && saved !== "null" && saved.length > 10 && token) {
        return { id: saved, token };
      }
    }
    return null;
  }, [avatarId]);

  // Initialize: check localStorage for existing session and load history
  useEffect(() => {
    // Use a local variable to track if this effect instance should run
    let shouldRun = true;
    
    const initChat = async () => {
      if (!shouldRun) return;
      
      setIsInitializing(true);
      try {
        const saved = getSavedSession();

        if (saved && shouldRun) {
          // Try to load history from existing session
          try {
            const messages = await chatApi.getHistory(avatarId, {
              session_id: saved.id,
              session_token: saved.token,
              limit: 50
            });
            if (!shouldRun) return;

            // Session is valid, use it
            setSessionId(saved.id);
            sessionIdRef.current = saved.id;
            sessionTokenRef.current = saved.token;
            setMessages(messages);
            return;
          } catch (error) {
            if (!shouldRun) return;
            // Session expired or invalid, clear it
            console.warn("[useChat] Saved session invalid, creating new one", error);
            clearSession();
          }
        }

        if (!shouldRun) return;

        // No saved session or invalid, create new one
        const response = await chatApi.createSession(avatarId, source);
        if (!shouldRun) return;
        setSessionId(response.id);
        sessionIdRef.current = response.id;
        sessionTokenRef.current = response.session_token;
        saveSession(response.id, response.session_token);
        setMessages([]);
      } catch (error) {
        console.error("[useChat] Failed to initialize chat:", error);
      } finally {
        if (shouldRun) {
          setIsInitializing(false);
        }
      }
    };

    initChat();
    
    // Cleanup function - cancel if effect re-runs
    return () => {
      shouldRun = false;
    };
  }, [avatarId, source, getSavedSession, saveSession, clearSession]);

  // Create new session
  const createSession = useCallback(async () => {
    setIsInitializing(true);
    try {
      const response = await chatApi.createSession(avatarId, source);
      setSessionId(response.id);
      sessionIdRef.current = response.id;
      sessionTokenRef.current = response.session_token;
      saveSession(response.id, response.session_token);
      setMessages([]);
      return response;
    } finally {
      setIsInitializing(false);
    }
  }, [avatarId, source, saveSession]);

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      let currentSessionId = sessionIdRef.current;

      // Create session if not exists
      if (!currentSessionId) {
        const session = await createSession();
        currentSessionId = session.id;
      }

      // Double-check session exists
      const currentSessionToken = sessionTokenRef.current;
      if (!currentSessionId || !currentSessionToken) {
        throw new Error("Failed to create chat session");
      }
      
      // Immediately show user message with temporary ID
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);
      
    setIsLoading(true);
    try {
        const response = await chatApi.sendMessage(avatarId, currentSessionId, currentSessionToken, content);
        // Replace temp message with real one and add assistant response
      setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMessage.id),
        response.user_message,
        response.assistant_message,
      ]);
      return response;
      } catch (error) {
        // Remove temp message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
        throw error;
    } finally {
      setIsLoading(false);
    }
    },
    [avatarId, createSession]
  );

  // Load history manually
  const loadHistory = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) return;
    try {
      const messages = await chatApi.getHistory(avatarId, {
        session_id: currentSessionId,
        session_token: sessionTokenRef.current ?? undefined,
      });
      setMessages(messages);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }, [avatarId]);

  // Reset chat (creates new session)
  const resetChat = useCallback(async () => {
    clearSession();
    setSessionId(null);
    sessionIdRef.current = null;
    setMessages([]);
    // Create new session immediately
    await createSession();
  }, [createSession, clearSession]);

  // Send feedback
  const sendFeedbackMutation = useMutation({
    mutationFn: ({
      messageId,
      feedback,
    }: {
      messageId: string;
      feedback: FeedbackType;
    }) => chatApi.sendFeedback(avatarId, messageId, feedback, sessionTokenRef.current ?? undefined),
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
    isInitializing,
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

