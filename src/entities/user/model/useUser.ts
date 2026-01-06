"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/userApi";
import type {
  UsersListParams,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
} from "@/shared/types/api";

/**
 * Query keys for users
 */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: UsersListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook to get users list
 */
export function useUsers(params?: UsersListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.list(params),
  });
}

/**
 * Hook to get user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateUserRequest) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateUserRequest }) =>
      userApi.update(id, data),
    onSuccess: (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

