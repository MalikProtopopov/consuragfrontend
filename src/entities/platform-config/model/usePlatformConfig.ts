"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformConfigApi } from "../api/platformConfigApi";
import type {
  CreatePlatformConfigRequest,
  UpdatePlatformConfigRequest,
} from "@/shared/types/api";

/**
 * Query keys for platform config
 */
export const platformConfigKeys = {
  all: ["platform-config"] as const,
  list: () => [...platformConfigKeys.all, "list"] as const,
  detail: (key: string) => [...platformConfigKeys.all, "detail", key] as const,
};

/**
 * Hook to get all platform configurations
 */
export function usePlatformConfigs() {
  return useQuery({
    queryKey: platformConfigKeys.list(),
    queryFn: platformConfigApi.list,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to get platform configuration by key
 */
export function usePlatformConfig(key: string) {
  return useQuery({
    queryKey: platformConfigKeys.detail(key),
    queryFn: () => platformConfigApi.getByKey(key),
    enabled: !!key,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to create platform configuration
 */
export function useCreatePlatformConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlatformConfigRequest) =>
      platformConfigApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformConfigKeys.all });
    },
  });
}

/**
 * Hook to update platform configuration
 */
export function useUpdatePlatformConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdatePlatformConfigRequest }) =>
      platformConfigApi.update(key, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: platformConfigKeys.all });
      queryClient.invalidateQueries({
        queryKey: platformConfigKeys.detail(variables.key),
      });
    },
  });
}

/**
 * Hook to delete platform configuration
 */
export function useDeletePlatformConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => platformConfigApi.delete(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformConfigKeys.all });
    },
  });
}

/**
 * Hook to validate platform key
 */
export function useValidatePlatformKey() {
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      platformConfigApi.validate(key, value),
  });
}

