"use client";

import * as React from "react";

import { usePlatformUsage, useUsersUsage } from "@/entities/billing";
import { isAdmin, useAuthStore } from "@/entities/auth";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { usePagination } from "@/shared/lib";
import type { BillingPlan, UsersUsageParams, UserUsage } from "@/shared/types/api";

import { PlatformStatsCards } from "./_components/PlatformStatsCards";
import { UsersByPlanCard } from "./_components/UsersByPlanCard";
import { UsersUsageTable } from "./_components/UsersUsageTable";
import { UserManageDialog } from "./_components/UserManageDialog";

export default function AdminBillingPage() {
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = React.useState<BillingPlan | "all">("all");
  const [selectedUser, setSelectedUser] = React.useState<UserUsage | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = React.useState(false);
  const pagination = usePagination();

  const params: UsersUsageParams = {
    skip: pagination.skip,
    limit: pagination.limit,
    plan: selectedPlan !== "all" ? selectedPlan : undefined,
    sort_by: "tokens_used",
    sort_order: "desc",
  };

  const { data: platformUsage, isLoading: platformLoading } = usePlatformUsage();
  const { data: usersUsage, isLoading: usersLoading } = useUsersUsage(params);

  // Sync total into pagination hook (для totalPages/hasNext)
  const { setTotal } = pagination;
  React.useEffect(() => {
    setTotal(usersUsage?.total);
  }, [setTotal, usersUsage?.total]);

  const handleManageUser = (userItem: UserUsage) => {
    setSelectedUser(userItem);
    setIsManageDialogOpen(true);
  };

  const handleSelectedPlanChange = (plan: BillingPlan | "all") => {
    setSelectedPlan(plan);
    pagination.reset(); // Reset page when filter changes
  };

  // Get users from response (backend returns 'users' not 'items')
  const users = usersUsage?.users ?? [];

  // Check admin access
  if (!isAdmin(user)) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-text-muted">У вас нет доступа к этой странице</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Управление биллингом"
        description="Статистика платформы и управление лимитами пользователей"
      />

      <div className="space-y-6">
        <PlatformStatsCards data={platformUsage} isLoading={platformLoading} />

        {platformUsage && <UsersByPlanCard data={platformUsage} />}

        <UsersUsageTable
          users={users}
          total={usersUsage?.total}
          isLoading={usersLoading}
          selectedPlan={selectedPlan}
          onSelectedPlanChange={handleSelectedPlanChange}
          pagination={pagination}
          onManageUser={handleManageUser}
        />

        {selectedUser && (
          <UserManageDialog
            user={selectedUser}
            open={isManageDialogOpen}
            onOpenChange={setIsManageDialogOpen}
          />
        )}
      </div>
    </PageContainer>
  );
}
