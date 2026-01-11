"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "../api/notificationApi";
import type {
  UpdateAdminBotRequest,
  UpdateUserBotRequest,
  NotificationLogsParams,
} from "@/shared/types/api";

/**
 * Query keys for notifications
 */
export const notificationKeys = {
  all: ["notifications"] as const,
  status: () => [...notificationKeys.all, "status"] as const,
  botsConfig: () => [...notificationKeys.all, "bots-config"] as const,
  logs: (params?: NotificationLogsParams) =>
    [...notificationKeys.all, "logs", params] as const,
};

// ============================================
// OWNER hooks
// ============================================

/**
 * Hook to get Telegram link status
 */
export function useTelegramStatus(options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: notificationKeys.status(),
    queryFn: () => notificationApi.getStatus(),
    enabled: options?.enabled,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook to generate Telegram link code
 */
export function useGenerateLinkCode() {
  return useMutation({
    mutationFn: () => notificationApi.generateLinkCode(),
  });
}

/**
 * Hook to unlink Telegram
 */
export function useUnlinkTelegram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.unlink(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.status() });
    },
  });
}

/**
 * Hook to toggle notifications
 */
export function useToggleNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) => notificationApi.toggleNotifications(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.status() });
    },
  });
}

// ============================================
// ADMIN hooks
// ============================================

/**
 * Hook to get Telegram bots configuration
 */
export function useTelegramBotsConfig() {
  return useQuery({
    queryKey: notificationKeys.botsConfig(),
    queryFn: () => notificationApi.getBotsConfig(),
  });
}

/**
 * Hook to update Admin Bot
 */
export function useUpdateAdminBot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAdminBotRequest) => notificationApi.updateAdminBot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.botsConfig() });
    },
  });
}

/**
 * Hook to update User Bot
 */
export function useUpdateUserBot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserBotRequest) => notificationApi.updateUserBot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.botsConfig() });
    },
  });
}

/**
 * Hook to send test message
 */
export function useSendTestMessage() {
  return useMutation({
    mutationFn: (botType: "admin" | "user") => notificationApi.sendTestMessage(botType),
  });
}

/**
 * Hook to get notification logs
 */
export function useNotificationLogs(params?: NotificationLogsParams) {
  return useQuery({
    queryKey: notificationKeys.logs(params),
    queryFn: () => notificationApi.getLogs(params),
  });
}

