"use client";

import { useState } from "react";
import { FileText, AlertCircle, RefreshCw } from "lucide-react";

import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { getApiErrorMessage, usePagination } from "@/shared/lib";
import { useNotificationLogs } from "@/entities/notification";
import type {
  NotificationLog,
  NotificationStatus,
  NotificationType,
} from "@/shared/types/api";

import { LogRow } from "./_components/LogRow";
import { LogDetailsModal } from "./_components/LogDetailsModal";
import { LogsFilterBar, type RecipientFilter } from "./_components/LogsFilterBar";

/**
 * Notification logs page for SAAS_ADMIN
 */
export default function NotificationLogsPage() {
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [recipientFilter, setRecipientFilter] = useState<RecipientFilter>("all");
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "all">("all");
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
  const pagination = usePagination();

  const { data, isLoading, error, refetch } = useNotificationLogs({
    skip: pagination.skip,
    limit: pagination.limit,
    type: typeFilter !== "all" ? typeFilter : undefined,
    recipient_type: recipientFilter !== "all" ? recipientFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const hasActiveFilters =
    typeFilter !== "all" || recipientFilter !== "all" || statusFilter !== "all";

  const handleResetFilters = () => {
    setTypeFilter("all");
    setRecipientFilter("all");
    setStatusFilter("all");
    pagination.reset();
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[500px]" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Логи уведомлений" description="История отправленных уведомлений" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ошибка загрузки логов: {getApiErrorMessage(error)}
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Логи уведомлений"
        description="История отправленных уведомлений"
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Логи ({data?.total ?? 0})
            </CardTitle>

            <LogsFilterBar
              typeFilter={typeFilter}
              recipientFilter={recipientFilter}
              statusFilter={statusFilter}
              onTypeChange={(value) => {
                setTypeFilter(value);
                pagination.reset();
              }}
              onRecipientChange={(value) => {
                setRecipientFilter(value);
                pagination.reset();
              }}
              onStatusChange={(value) => {
                setStatusFilter(value);
                pagination.reset();
              }}
              onReset={handleResetFilters}
            />
          </div>
        </CardHeader>
        <CardContent>
          {data?.items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
              <p className="text-text-secondary">Нет записей</p>
              {hasActiveFilters && (
                <p className="text-sm text-text-muted mt-2">
                  Попробуйте изменить фильтры
                </p>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата/время</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Получатель</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((log) => (
                    <LogRow
                      key={log.id}
                      log={log}
                      onViewDetails={() => setSelectedLog(log)}
                    />
                  ))}
                </TableBody>
              </Table>

              <PaginationControls
                pagination={pagination}
                total={data?.total}
                className="mt-4"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Details modal */}
      <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </PageContainer>
  );
}
