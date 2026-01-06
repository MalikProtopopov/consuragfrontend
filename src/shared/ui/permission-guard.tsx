"use client";

import type { ReactNode } from "react";
import { useAuthStore, isAdmin, isOwnerOrAbove, isManager, canManageProject } from "@/entities/auth";
import type { UserRole, ProjectMember, User } from "@/shared/types/api";

interface PermissionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  /**
   * Required roles to access the content
   */
  roles?: UserRole[];
  /**
   * Check if user is admin
   */
  requireAdmin?: boolean;
  /**
   * Check if user is owner or above
   */
  requireOwner?: boolean;
  /**
   * Check if user can manage projects
   */
  requireProjectManager?: boolean;
  /**
   * Custom permission check function
   */
  check?: (user: User | null) => boolean;
  /**
   * Project membership for project-specific permissions
   */
  projectMember?: ProjectMember;
  /**
   * Project-specific permission checks
   */
  requirePermission?: {
    canManageAvatars?: boolean;
    canManageDocuments?: boolean;
    canManageMembers?: boolean;
    canViewAnalytics?: boolean;
    canManageSettings?: boolean;
  };
}

/**
 * Permission guard component for role-based access control
 */
export function PermissionGuard({
  children,
  fallback = null,
  roles,
  requireAdmin,
  requireOwner,
  requireProjectManager,
  check,
  projectMember,
  requirePermission,
}: PermissionGuardProps) {
  const { user } = useAuthStore();

  // Not authenticated
  if (!user) {
    return <>{fallback}</>;
  }

  // Custom check
  if (check && !check(user)) {
    return <>{fallback}</>;
  }

  // Role check
  if (roles && !roles.includes(user.role)) {
    return <>{fallback}</>;
  }

  // Admin check
  if (requireAdmin && !isAdmin(user)) {
    return <>{fallback}</>;
  }

  // Owner or above check
  if (requireOwner && !isOwnerOrAbove(user)) {
    return <>{fallback}</>;
  }

  // Project manager check
  if (requireProjectManager && !isManager(user)) {
    return <>{fallback}</>;
  }

  // Project-specific permission checks
  if (requirePermission && projectMember) {
    if (requirePermission.canManageAvatars && !projectMember.can_manage_avatars) {
      return <>{fallback}</>;
    }
    if (requirePermission.canManageDocuments && !projectMember.can_manage_documents) {
      return <>{fallback}</>;
    }
    if (requirePermission.canManageMembers && !projectMember.can_manage_members) {
      return <>{fallback}</>;
    }
    if (requirePermission.canViewAnalytics && !projectMember.can_view_analytics) {
      return <>{fallback}</>;
    }
    if (requirePermission.canManageSettings && !projectMember.can_manage_settings) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Hook for checking permissions
 */
export function usePermissions() {
  const { user } = useAuthStore();

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: isAdmin(user),
    isOwner: isOwnerOrAbove(user),
    isManager: isManager(user),
    hasRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => user ? roles.includes(user.role) : false,
    canManageProject: () => canManageProject(user),
  };
}

