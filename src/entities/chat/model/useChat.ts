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
  
  // Store session ID in a ref to avoid closure issues
  const sessionIdRef = useRef<string | null>(null);

  // Save session to localStorage
  const saveSession = useCallback((sid: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(getSessionStorageKey(avatarId), sid);
    }
  }, [avatarId]);

  // Clear session from localStorage
  const clearSession = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(getSessionStorageKey(avatarId));
    }
  }, [avatarId]);

  // Get session from localStorage
  const getSavedSession = useCallback(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(getSessionStorageKey(avatarId));
      // Validate it's a proper UUID, not "undefined" or "null" string
      if (saved && saved !== "undefined" && saved !== "null" && saved.length > 10) {
        return saved;
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
        const savedSessionId = getSavedSession();
        console.log("[useChat] Initializing, saved session:", savedSessionId);
        
        if (savedSessionId && shouldRun) {
          // Try to load history from existing session
          try {
            console.log("[useChat] Loading history for session:", savedSessionId);
            const messages = await chatApi.getHistory(avatarId, { 
              session_id: savedSessionId,
              limit: 50 
            });
            console.log("[useChat] History loaded, messages:", messages.length);
            if (!shouldRun) return;
            
            // Session is valid, use it
            setSessionId(savedSessionId);
            sessionIdRef.current = savedSessionId;
            setMessages(messages);
            return;
          } catch (error) {
            if (!shouldRun) return;
            // Session expired or invalid, clear it
            console.log("[useChat] Saved session invalid, creating new one", error);
            clearSession();
          }
        }
        
        if (!shouldRun) return;
        
        // No saved session or invalid, create new one
        console.log("[useChat] Creating new session");
        const response = await chatApi.createSession(avatarId, source);
        if (!shouldRun) return;
        console.log("[useChat] New session created:", response.id);
        setSessionId(response.id);
        sessionIdRef.current = response.id;
        saveSession(response.id);
        console.log("[useChat] Session saved to localStorage");
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
      saveSession(response.id);
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
      if (!currentSessionId) {
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
        const response = await chatApi.sendMessage(avatarId, currentSessionId, content);
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
      const messages = await chatApi.getHistory(avatarId, { session_id: currentSessionId });
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
    }) => chatApi.sendFeedback(avatarId, messageId, feedback),
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

