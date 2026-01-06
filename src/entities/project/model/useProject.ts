"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { projectApi } from "../api/projectApi";
import type {
  ProjectsListParams,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectSettingsRequest,
  AddMemberRequest,
  UpdateMemberRequest,
} from "@/shared/types/api";

/**
 * Query keys for projects
 */
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params?: ProjectsListParams) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  settings: (id: string) => [...projectKeys.all, "settings", id] as const,
  members: (id: string) => [...projectKeys.all, "members", id] as const,
};

/**
 * Hook to get projects list
 */
export function useProjects(params?: ProjectsListParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectApi.list(params),
  });
}

/**
 * Hook to get project by ID
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectApi.create(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      router.push(`/projects/${project.id}`);
    },
  });
}

/**
 * Hook to update project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectApi.update(id, data),
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(project.id), (old: unknown) => ({
        ...(old ?? {}),
        ...project,
      }));
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to delete project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => projectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      router.push("/projects");
    },
  });
}

/**
 * Hook to get project settings
 */
export function useProjectSettings(id: string) {
  return useQuery({
    queryKey: projectKeys.settings(id),
    queryFn: () => projectApi.getSettings(id),
    enabled: !!id,
  });
}

/**
 * Hook to update project settings
 */
export function useUpdateProjectSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectSettingsRequest }) =>
      projectApi.updateSettings(id, data),
    onSuccess: (settings, { id }) => {
      queryClient.setQueryData(projectKeys.settings(id), settings);
    },
  });
}

/**
 * Hook to get project members
 */
export function useProjectMembers(id: string) {
  return useQuery({
    queryKey: projectKeys.members(id),
    queryFn: () => projectApi.getMembers(id),
    enabled: !!id,
  });
}

/**
 * Hook to add member to project
 */
export function useAddMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: AddMemberRequest }) =>
      projectApi.addMember(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
    },
  });
}

/**
 * Hook to update member
 */
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
      data,
    }: {
      projectId: string;
      userId: string;
      data: UpdateMemberRequest;
    }) => projectApi.updateMember(projectId, userId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
    },
  });
}

/**
 * Hook to remove member from project
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectApi.removeMember(projectId, userId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
    },
  });
}

