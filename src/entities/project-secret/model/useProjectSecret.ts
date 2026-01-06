"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectSecretApi } from "../api/projectSecretApi";
import type {
  CreateProjectSecretRequest,
  UpdateProjectSecretRequest,
} from "@/shared/types/api";

/**
 * Query keys for project secrets
 */
export const projectSecretKeys = {
  all: ["project-secrets"] as const,
  list: (projectId: string) =>
    [...projectSecretKeys.all, "list", projectId] as const,
  detail: (projectId: string, key: string) =>
    [...projectSecretKeys.all, "detail", projectId, key] as const,
};

/**
 * Hook to get all project secrets
 */
export function useProjectSecrets(projectId: string) {
  return useQuery({
    queryKey: projectSecretKeys.list(projectId),
    queryFn: () => projectSecretApi.list(projectId),
    enabled: !!projectId,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to get project secret by key
 */
export function useProjectSecret(projectId: string, key: string) {
  return useQuery({
    queryKey: projectSecretKeys.detail(projectId, key),
    queryFn: () => projectSecretApi.getByKey(projectId, key),
    enabled: !!projectId && !!key,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to create project secret
 */
export function useCreateProjectSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: CreateProjectSecretRequest;
    }) => projectSecretApi.create(projectId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectSecretKeys.list(variables.projectId),
      });
    },
  });
}

/**
 * Hook to update project secret
 */
export function useUpdateProjectSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      key,
      data,
    }: {
      projectId: string;
      key: string;
      data: UpdateProjectSecretRequest;
    }) => projectSecretApi.update(projectId, key, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectSecretKeys.list(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: projectSecretKeys.detail(variables.projectId, variables.key),
      });
    },
  });
}

/**
 * Hook to delete project secret
 */
export function useDeleteProjectSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, key }: { projectId: string; key: string }) =>
      projectSecretApi.delete(projectId, key),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: projectSecretKeys.list(variables.projectId),
      });
    },
  });
}

/**
 * Hook to validate Telegram bot token
 */
export function useValidateTelegramToken() {
  return useMutation({
    mutationFn: ({ projectId, value }: { projectId: string; value: string }) =>
      projectSecretApi.validateTelegram(projectId, value),
  });
}

