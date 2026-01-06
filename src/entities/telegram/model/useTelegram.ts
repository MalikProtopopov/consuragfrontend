"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { telegramApi } from "../api/telegramApi";
import type {
  CreateTelegramRequest,
  UpdateTelegramRequest,
  TelegramSessionsListParams,
  TelegramEventsListParams,
} from "@/shared/types/api";

/**
 * Query keys for telegram
 */
export const telegramKeys = {
  all: ["telegram"] as const,
  integration: (projectId: string) => [...telegramKeys.all, projectId] as const,
  stats: (projectId: string) => [...telegramKeys.all, "stats", projectId] as const,
  sessions: (projectId: string, params?: TelegramSessionsListParams) =>
    [...telegramKeys.all, "sessions", projectId, params] as const,
  sessionDetail: (projectId: string, sessionId: string) =>
    [...telegramKeys.all, "session", projectId, sessionId] as const,
  events: (projectId: string, params?: TelegramEventsListParams) =>
    [...telegramKeys.all, "events", projectId, params] as const,
};

/**
 * Hook to get telegram integration
 */
export function useTelegramIntegration(projectId: string) {
  return useQuery({
    queryKey: telegramKeys.integration(projectId),
    queryFn: () => telegramApi.get(projectId),
    enabled: !!projectId,
    retry: (failureCount, error) => {
      // Don't retry on 404 (no integration exists)
      if ((error as { status?: number })?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

/**
 * Hook to create telegram integration
 */
export function useCreateTelegramIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateTelegramRequest;
    }) => telegramApi.create(projectId, data),
    onSuccess: (integration, { projectId }) => {
      queryClient.setQueryData(telegramKeys.integration(projectId), integration);
    },
  });
}

/**
 * Hook to update telegram integration
 */
export function useUpdateTelegramIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: UpdateTelegramRequest;
    }) => telegramApi.update(projectId, data),
    onSuccess: (integration, { projectId }) => {
      queryClient.setQueryData(telegramKeys.integration(projectId), integration);
    },
  });
}

/**
 * Hook to delete telegram integration
 */
export function useDeleteTelegramIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => telegramApi.delete(projectId),
    onSuccess: (_, projectId) => {
      queryClient.removeQueries({ queryKey: telegramKeys.integration(projectId) });
    },
  });
}

/**
 * Custom error for webhook configuration issues
 */
export class WebhookConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookConfigError";
  }
}

/**
 * Hook to set webhook with two-step process:
 * 1. Get webhook URL from server
 * 2. Check if PUBLIC_API_URL is configured
 * 3. Set webhook with the URL
 */
export function useSetTelegramWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      // Step 1: Get webhook URL
      const urlResponse = await telegramApi.getWebhookUrl(projectId);

      // Step 2: Check if PUBLIC_API_URL is configured
      if (!urlResponse.is_configured) {
        throw new WebhookConfigError(
          urlResponse.message || "PUBLIC_API_URL не настроен на сервере"
        );
      }

      // Step 3: Set webhook with the URL
      return telegramApi.setWebhook(projectId, urlResponse.webhook_url);
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: telegramKeys.integration(projectId) });
    },
  });
}

/**
 * Hook to delete webhook
 */
export function useDeleteTelegramWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => telegramApi.deleteWebhook(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: telegramKeys.integration(projectId) });
    },
  });
}

// ============================================
// Analytics & Sessions hooks
// ============================================

/**
 * Hook to get telegram statistics
 */
export function useTelegramStats(projectId: string) {
  return useQuery({
    queryKey: telegramKeys.stats(projectId),
    queryFn: () => telegramApi.getStats(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to get telegram sessions list
 */
export function useTelegramSessions(
  projectId: string,
  params?: TelegramSessionsListParams
) {
  return useQuery({
    queryKey: telegramKeys.sessions(projectId, params),
    queryFn: () => telegramApi.getSessions(projectId, params),
    enabled: !!projectId,
  });
}

/**
 * Hook to get telegram session detail
 */
export function useTelegramSessionDetail(
  projectId: string,
  sessionId: string,
  messagesLimit = 50
) {
  return useQuery({
    queryKey: telegramKeys.sessionDetail(projectId, sessionId),
    queryFn: () => telegramApi.getSessionDetail(projectId, sessionId, messagesLimit),
    enabled: !!projectId && !!sessionId,
  });
}

/**
 * Hook to export telegram session
 */
export function useExportTelegramSession() {
  return useMutation({
    mutationFn: ({
      projectId,
      sessionId,
    }: {
      projectId: string;
      sessionId: string;
    }) => telegramApi.exportSession(projectId, sessionId),
  });
}

/**
 * Hook to get telegram events
 */
export function useTelegramEvents(
  projectId: string,
  params?: TelegramEventsListParams
) {
  return useQuery({
    queryKey: telegramKeys.events(projectId, params),
    queryFn: () => telegramApi.getEvents(projectId, params),
    enabled: !!projectId,
  });
}

