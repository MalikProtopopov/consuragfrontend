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
 * Hook for registration (no auto-login - email verification required)
 */
export function useRegister() {
  return useMutation({
    mutationFn: async (data: { email: string; password: string; full_name?: string }) => {
      // Register user - email will be sent automatically by backend
      const user = await authApi.register(data);
      return { user, email: data.email };
    },
  });
}

/**
 * Hook for logout
 * @param logoutFromAllDevices - Pass true to logout from all devices
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { logout: clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: (logoutFromAllDevices?: boolean) => authApi.logout(logoutFromAllDevices),
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

/**
 * Hook for email verification
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
  });
}

/**
 * Hook for resending verification email
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
  });
}

