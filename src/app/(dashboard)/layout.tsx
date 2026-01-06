"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMe, useAuthStore } from "@/entities/auth";
import { tokenManager } from "@/shared/api";
import { AppShell } from "@/widgets/app-shell";
import { Spinner } from "@/shared/ui/spinner";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuthStore();
  const { isLoading, error, isFetched } = useMe();

  // Redirect to login if no token
  useEffect(() => {
    if (typeof window !== "undefined" && !tokenManager.hasToken()) {
      router.replace("/login");
    }
  }, [router]);

  // Redirect to login on auth error
  useEffect(() => {
    if (error && isFetched) {
      tokenManager.clearTokens();
      router.replace("/login");
    }
  }, [error, isFetched, router]);

  // No token - show nothing while redirecting
  if (typeof window !== "undefined" && !tokenManager.hasToken()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Spinner className="h-8 w-8 text-accent-primary" />
      </div>
    );
  }

  // Show loading state while fetching user
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Spinner className="h-8 w-8 text-accent-primary" />
      </div>
    );
  }

  return (
    <AppShell
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={setSidebarCollapsed}
    >
      {children}
    </AppShell>
  );
}
