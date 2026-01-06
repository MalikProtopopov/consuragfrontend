"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../api/analyticsApi";
import type { AuditLogsParams, ProjectTrendParams } from "@/shared/types/api";

/**
 * Query keys for analytics
 */
export const analyticsKeys = {
  all: ["analytics"] as const,
  platform: () => [...analyticsKeys.all, "platform"] as const,
  audit: (params?: AuditLogsParams) => [...analyticsKeys.all, "audit", params] as const,
  projectUsage: (projectId: string) =>
    [...analyticsKeys.all, "project-usage", projectId] as const,
  projectTrend: (projectId: string, params?: ProjectTrendParams) =>
    [...analyticsKeys.all, "project-trend", projectId, params] as const,
};

/**
 * Hook to get platform analytics (admin only)
 */
export function usePlatformAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.platform(),
    queryFn: analyticsApi.getPlatformStats,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get audit logs (admin only)
 */
export function useAuditLogs(params?: AuditLogsParams) {
  return useQuery({
    queryKey: analyticsKeys.audit(params),
    queryFn: () => analyticsApi.getAuditLogs(params),
  });
}

/**
 * Hook to get project usage analytics
 */
export function useProjectUsage(projectId: string) {
  return useQuery({
    queryKey: analyticsKeys.projectUsage(projectId),
    queryFn: () => analyticsApi.getProjectUsage(projectId),
    enabled: !!projectId,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get project trend data
 */
export function useProjectTrend(projectId: string, params?: ProjectTrendParams) {
  return useQuery({
    queryKey: analyticsKeys.projectTrend(projectId, params),
    queryFn: () => analyticsApi.getProjectTrend(projectId, params),
    enabled: !!projectId,
    staleTime: 60 * 1000, // 1 minute
  });
}

