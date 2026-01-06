"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api/authApi";
import { useAuthStore } from "./authStore";
import { tokenManager } from "@/shared/api";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/shared/types/api";

/**
 * Query keys for auth
 */
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

/**
 * Hook to get current user
 */
export function useMe() {
  const { setUser } = useAuthStore();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const user = await authApi.getMe();
      setUser(user);
      return user;
    },
    // Only run query if we have a token
    enabled: tokenManager.hasToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for login
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: async () => {
      // Fetch user data after successful login
      const user = await authApi.getMe();
      setUser(user);
      queryClient.setQueryData(authKeys.me(), user);
      router.push("/projects");
    },
  });
}

/**
 * Hook for registration
 */
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      // Redirect to login after registration
      router.push("/login?registered=true");
    },
  });
}

/**
 * Hook for logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout: clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push("/login");
    },
    onError: () => {
      // Even if API fails, clear local state
      clearAuth();
      queryClient.clear();
      router.push("/login");
    },
  });
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authApi.updateMe(data),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
  });
}

