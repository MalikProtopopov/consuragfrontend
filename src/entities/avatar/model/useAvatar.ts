"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { avatarApi } from "../api/avatarApi";
import type { AvatarsListParams, CreateAvatarRequest, UpdateAvatarRequest } from "@/shared/types/api";

/**
 * Query keys for avatars
 */
export const avatarKeys = {
  all: ["avatars"] as const,
  lists: () => [...avatarKeys.all, "list"] as const,
  list: (projectId: string, params?: AvatarsListParams) =>
    [...avatarKeys.lists(), projectId, params] as const,
  details: () => [...avatarKeys.all, "detail"] as const,
  detail: (projectId: string, avatarId: string) =>
    [...avatarKeys.details(), projectId, avatarId] as const,
  stats: (projectId: string, avatarId: string) =>
    [...avatarKeys.all, "stats", projectId, avatarId] as const,
};

/**
 * Hook to get avatars list
 */
export function useAvatars(projectId: string, params?: AvatarsListParams) {
  return useQuery({
    queryKey: avatarKeys.list(projectId, params),
    queryFn: () => avatarApi.list(projectId, params),
    enabled: !!projectId,
  });
}

/**
 * Hook to get avatar by ID
 */
export function useAvatar(projectId: string, avatarId: string) {
  return useQuery({
    queryKey: avatarKeys.detail(projectId, avatarId),
    queryFn: () => avatarApi.getById(projectId, avatarId),
    enabled: !!projectId && !!avatarId,
  });
}

/**
 * Hook to get avatar stats
 */
export function useAvatarStats(projectId: string, avatarId: string) {
  return useQuery({
    queryKey: avatarKeys.stats(projectId, avatarId),
    queryFn: () => avatarApi.getStats(projectId, avatarId),
    enabled: !!projectId && !!avatarId,
  });
}

/**
 * Hook to create avatar
 */
export function useCreateAvatar() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateAvatarRequest }) =>
      avatarApi.create(projectId, data),
    onSuccess: (avatar, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: avatarKeys.lists() });
      router.push(`/projects/${projectId}/avatars/${avatar.id}`);
    },
  });
}

/**
 * Hook to update avatar
 */
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      avatarId,
      data,
    }: {
      projectId: string;
      avatarId: string;
      data: UpdateAvatarRequest;
    }) => avatarApi.update(projectId, avatarId, data),
    onSuccess: (avatar, { projectId, avatarId }) => {
      queryClient.setQueryData(avatarKeys.detail(projectId, avatarId), avatar);
      queryClient.invalidateQueries({ queryKey: avatarKeys.lists() });
    },
  });
}

/**
 * Hook to delete avatar
 */
export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ projectId, avatarId }: { projectId: string; avatarId: string }) =>
      avatarApi.delete(projectId, avatarId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: avatarKeys.lists() });
      router.push(`/projects/${projectId}/avatars`);
    },
  });
}

/**
 * Hook to publish avatar
 */
export function usePublishAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, avatarId }: { projectId: string; avatarId: string }) =>
      avatarApi.publish(projectId, avatarId),
    onSuccess: (result, { projectId, avatarId }) => {
      queryClient.setQueryData(avatarKeys.detail(projectId, avatarId), (old: unknown) => ({
        ...(old ?? {}),
        is_published: result.is_published,
        status: result.status,
      }));
      queryClient.invalidateQueries({ queryKey: avatarKeys.lists() });
    },
  });
}

/**
 * Hook to unpublish avatar
 */
export function useUnpublishAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, avatarId }: { projectId: string; avatarId: string }) =>
      avatarApi.unpublish(projectId, avatarId),
    onSuccess: (result, { projectId, avatarId }) => {
      queryClient.setQueryData(avatarKeys.detail(projectId, avatarId), (old: unknown) => ({
        ...(old ?? {}),
        is_published: result.is_published,
        status: result.status,
      }));
      queryClient.invalidateQueries({ queryKey: avatarKeys.lists() });
    },
  });
}

