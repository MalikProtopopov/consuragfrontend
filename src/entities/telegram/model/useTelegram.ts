"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { telegramApi } from "../api/telegramApi";
import type { CreateTelegramRequest, UpdateTelegramRequest } from "@/shared/types/api";

/**
 * Query keys for telegram
 */
export const telegramKeys = {
  all: ["telegram"] as const,
  integration: (projectId: string) => [...telegramKeys.all, projectId] as const,
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

