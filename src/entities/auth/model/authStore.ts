import { create } from "zustand";
import type { User } from "@/shared/types/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Auth store for global user state
 */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));

/**
 * Check if user has specific role
 */
export function hasRole(user: User | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, ["saas_admin"]);
}

/**
 * Check if user is owner or above
 */
export function isOwnerOrAbove(user: User | null): boolean {
  return hasRole(user, ["saas_admin", "owner"]);
}

/**
 * Check if user is manager or above
 */
export function isManager(user: User | null): boolean {
  return hasRole(user, ["saas_admin", "owner", "manager"]);
}

/**
 * Check if user can create projects
 */
export function canCreateProject(user: User | null): boolean {
  return hasRole(user, ["saas_admin", "owner"]);
}

/**
 * Check if user can manage a project
 */
export function canManageProject(user: User | null): boolean {
  return hasRole(user, ["saas_admin", "owner", "manager"]);
}

