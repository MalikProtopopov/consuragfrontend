"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "../api/billingApi";
import type {
  UsersUsageParams,
  UpdateUserLimitsRequest,
  UpdateUserPlanRequest,
  AddBonusTokensRequest,
} from "@/shared/types/api";

/**
 * Query keys for billing
 */
export const billingKeys = {
  all: ["billing"] as const,
  usage: () => [...billingKeys.all, "usage"] as const,
  usageSummary: () => [...billingKeys.usage(), "summary"] as const,
  usageHistory: (days: number) => [...billingKeys.usage(), "history", days] as const,
  usageBreakdown: () => [...billingKeys.usage(), "breakdown"] as const,
  limits: () => [...billingKeys.all, "limits"] as const,
  plan: () => [...billingKeys.all, "plan"] as const,

  // Admin keys
  admin: () => [...billingKeys.all, "admin"] as const,
  platformUsage: () => [...billingKeys.admin(), "platform"] as const,
  usersUsage: (params?: UsersUsageParams) =>
    [...billingKeys.admin(), "users", params] as const,
  userUsage: (userId: string) => [...billingKeys.admin(), "user-usage", userId] as const,
  userBudget: (userId: string) => [...billingKeys.admin(), "user-budget", userId] as const,
};

// ==================== OWNER hooks ====================

/**
 * Hook to get usage summary
 */
export function useUsageSummary() {
  return useQuery({
    queryKey: billingKeys.usageSummary(),
    queryFn: billingApi.getUsageSummary,
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Hook to get usage history
 */
export function useUsageHistory(days: number = 30) {
  return useQuery({
    queryKey: billingKeys.usageHistory(days),
    queryFn: () => billingApi.getUsageHistory(days),
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to get usage breakdown
 */
export function useUsageBreakdown() {
  return useQuery({
    queryKey: billingKeys.usageBreakdown(),
    queryFn: billingApi.getUsageBreakdown,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to get billing limits
 */
export function useBillingLimits() {
  return useQuery({
    queryKey: billingKeys.limits(),
    queryFn: billingApi.getLimits,
    staleTime: 5 * 60_000, // 5 minutes
  });
}

/**
 * Hook to get plan info
 */
export function usePlanInfo() {
  return useQuery({
    queryKey: billingKeys.plan(),
    queryFn: billingApi.getPlanInfo,
    staleTime: 5 * 60_000, // 5 minutes
  });
}

// ==================== ADMIN hooks ====================

/**
 * Hook to get platform usage (admin only)
 */
export function usePlatformUsage() {
  return useQuery({
    queryKey: billingKeys.platformUsage(),
    queryFn: billingApi.getPlatformUsage,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Hook to get users usage list (admin only)
 */
export function useUsersUsage(params?: UsersUsageParams) {
  return useQuery({
    queryKey: billingKeys.usersUsage(params),
    queryFn: () => billingApi.getUsersUsage(params),
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Hook to get specific user usage (admin only)
 */
export function useUserUsage(userId: string) {
  return useQuery({
    queryKey: billingKeys.userUsage(userId),
    queryFn: () => billingApi.getUserUsage(userId),
    enabled: !!userId,
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Hook to get specific user budget (admin only)
 */
export function useUserBudget(userId: string) {
  return useQuery({
    queryKey: billingKeys.userBudget(userId),
    queryFn: () => billingApi.getUserBudget(userId),
    enabled: !!userId,
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Hook to update user limits (admin only)
 */
export function useUpdateUserLimits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserLimitsRequest }) =>
      billingApi.updateUserLimits(userId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.admin() });
      queryClient.invalidateQueries({
        queryKey: billingKeys.userBudget(variables.userId),
      });
    },
  });
}

/**
 * Hook to update user plan (admin only)
 */
export function useUpdateUserPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserPlanRequest }) =>
      billingApi.updateUserPlan(userId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.admin() });
      queryClient.invalidateQueries({
        queryKey: billingKeys.userBudget(variables.userId),
      });
    },
  });
}

/**
 * Hook to add bonus tokens (admin only)
 */
export function useAddBonusTokens() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AddBonusTokensRequest }) =>
      billingApi.addBonusTokens(userId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.admin() });
      queryClient.invalidateQueries({
        queryKey: billingKeys.userBudget(variables.userId),
      });
    },
  });
}

/**
 * Hook to reset user period (admin only)
 */
export function useResetUserPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => billingApi.resetUserPeriod(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.admin() });
      queryClient.invalidateQueries({ queryKey: billingKeys.userBudget(userId) });
    },
  });
}

