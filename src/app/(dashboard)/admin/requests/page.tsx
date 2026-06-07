"use client";

import { useState } from "react";
import { usePlanRequests, useDeletePlanRequest } from "@/entities/plan-request";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { usePagination } from "@/shared/lib";
import type {
  PlanRequestType,
  PlanRequestStatus,
  PlanRequestDetail,
} from "@/shared/types/api";
import {
  PlanRequestDetailDialog,
  RequestsFilters,
  RequestsTable,
} from "./_components";

export default function PlanRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<PlanRequestStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<PlanRequestType | "all">("all");
  const [selectedRequest, setSelectedRequest] = useState<PlanRequestDetail | null>(null);
  const [deleteRequest, setDeleteRequest] = useState<PlanRequestDetail | null>(null);
  const pagination = usePagination();

  const { data, isLoading } = usePlanRequests({
    skip: pagination.skip,
    limit: pagination.limit,
    status: statusFilter === "all" ? undefined : statusFilter,
    request_type: typeFilter === "all" ? undefined : typeFilter,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const deleteMutation = useDeletePlanRequest();

  const requests = data?.requests || [];
  const total = data?.total || 0;

  const handleDelete = async () => {
    if (!deleteRequest) return;
    await deleteMutation.mutateAsync(deleteRequest.id);
    setDeleteRequest(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Заявки на тарифы"
        description="Управление заявками пользователей на повышение тарифа, демо и связь с продажами"
      />

      <RequestsFilters
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        total={total}
        onStatusChange={(v) => {
          setStatusFilter(v);
          pagination.reset();
        }}
        onTypeChange={(v) => {
          setTypeFilter(v);
          pagination.reset();
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Заявки</CardTitle>
          <CardDescription>Список заявок от пользователей</CardDescription>
        </CardHeader>
        <CardContent>
          <RequestsTable
            requests={requests}
            isLoading={isLoading}
            total={data?.total}
            pagination={pagination}
            onView={setSelectedRequest}
            onDelete={setDeleteRequest}
          />
        </CardContent>
      </Card>

      {selectedRequest && (
        <PlanRequestDetailDialog
          request={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteRequest}
        onOpenChange={(open) => !open && setDeleteRequest(null)}
        title="Удалить заявку?"
        description="Это действие нельзя отменить. Заявка будет удалена безвозвратно."
        confirmLabel="Удалить"
        variant="destructive"
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
