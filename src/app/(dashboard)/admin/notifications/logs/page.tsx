"use client";

import { useState } from "react";
import {
  FileText,
  AlertCircle,
  Check,
  X,
  Clock,
  Eye,
  Filter,
  RefreshCw,
} from "lucide-react";

import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { getApiErrorMessage } from "@/shared/lib";
import { useNotificationLogs } from "@/entities/notification";
import type {
  NotificationLog,
  NotificationStatus,
  NotificationType,
} from "@/shared/types/api";

const ITEMS_PER_PAGE = 20;

/**
 * Notification type labels
 */
const notificationTypeLabels: Record<string, string> = {
  // User notifications
  limit_warning_80: "Лимит 80%",
  limit_warning_90: "Лимит 90%",
  limit_exceeded: "Лимит исчерпан",
  subscription_expiring_7d: "Подписка истекает (7д)",
  subscription_expiring_3d: "Подписка истекает (3д)",
  subscription_expiring_1d: "Подписка истекает (1д)",
  subscription_expired: "Подписка истекла",
  plan_changed: "Тариф изменён",
  bonus_tokens_added: "Бонусные токены",
  // Admin notifications
  new_plan_request: "Новая заявка",
  new_user_registered: "Новый пользователь",
  user_limit_exceeded: "Лимит пользователя",
  daily_report: "Ежедневный отчёт",
  weekly_report: "Еженедельный отчёт",
};

/**
 * Status config
 */
const statusConfig: Record<
  NotificationStatus,
  { label: string; variant: "success" | "destructive" | "secondary"; icon: typeof Check }
> = {
  sent: { label: "Отправлено", variant: "success", icon: Check },
  failed: { label: "Ошибка", variant: "destructive", icon: X },
  pending: { label: "Ожидание", variant: "secondary", icon: Clock },
};

/**
 * Notification logs page for SAAS_ADMIN
 */
export default function NotificationLogsPage() {
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const [recipientFilter, setRecipientFilter] = useState<"admin" | "user" | "all">("all");
  const [statusFilter, setStatusFilter] = useState<NotificationStatus | "all">("all");
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);

  const { data, isLoading, error, refetch } = useNotificationLogs({
    skip: page * ITEMS_PER_PAGE,
    limit: ITEMS_PER_PAGE,
    type: typeFilter !== "all" ? typeFilter : undefined,
    recipient_type: recipientFilter !== "all" ? recipientFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  const handleResetFilters = () => {
    setTypeFilter("all");
    setRecipientFilter("all");
    setStatusFilter("all");
    setPage(0);
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

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-text-muted" />

              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value as NotificationType | "all");
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  {Object.entries(notificationTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={recipientFilter}
                onValueChange={(value) => {
                  setRecipientFilter(value as "admin" | "user" | "all");
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Получатель" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as NotificationStatus | "all");
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="sent">Отправлено</SelectItem>
                  <SelectItem value="failed">Ошибка</SelectItem>
                  <SelectItem value="pending">Ожидание</SelectItem>
                </SelectContent>
              </Select>

              {(typeFilter !== "all" ||
                recipientFilter !== "all" ||
                statusFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                  Сбросить
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data?.items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
              <p className="text-text-secondary">Нет записей</p>
              {(typeFilter !== "all" ||
                recipientFilter !== "all" ||
                statusFilter !== "all") && (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-text-muted">
                    Страница {page + 1} из {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Назад
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Вперёд
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Details modal */}
      <LogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </PageContainer>
  );
}

/**
 * Log row component
 */
function LogRow({
  log,
  onViewDetails,
}: {
  log: NotificationLog;
  onViewDetails: () => void;
}) {
  const status = statusConfig[log.status];
  const StatusIcon = status.icon;

  const formattedDate = new Date(log.created_at).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TableRow>
      <TableCell className="text-text-muted">{formattedDate}</TableCell>
      <TableCell>
        <span className="font-medium text-text-primary">
          {notificationTypeLabels[log.notification_type] || log.notification_type}
        </span>
      </TableCell>
      <TableCell>
        <Badge variant={log.recipient_type === "admin" ? "default" : "secondary"}>
          {log.recipient_type === "admin" ? "Admin" : "User"}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={status.variant} className="gap-1">
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={onViewDetails}>
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

/**
 * Log details modal
 */
function LogDetailsModal({
  log,
  onClose,
}: {
  log: NotificationLog | null;
  onClose: () => void;
}) {
  if (!log) return null;

  const status = statusConfig[log.status];
  const StatusIcon = status.icon;

  const formattedDate = new Date(log.created_at).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <Dialog open={!!log} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Детали уведомления</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status and type */}
          <div className="flex items-center justify-between">
            <Badge variant={status.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
            <Badge variant="outline">
              {notificationTypeLabels[log.notification_type] || log.notification_type}
            </Badge>
          </div>

          {/* Info grid */}
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Дата/время:</span>
              <span className="text-text-primary">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Получатель:</span>
              <span className="text-text-primary">
                {log.recipient_type === "admin" ? "Admin" : "User"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Канал:</span>
              <span className="text-text-primary">{log.channel}</span>
            </div>
            {log.recipient_id && (
              <div className="flex justify-between">
                <span className="text-text-muted">ID получателя:</span>
                <span className="text-text-primary font-mono text-xs">
                  {log.recipient_id}
                </span>
              </div>
            )}
          </div>

          {/* Error message */}
          {log.error_message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{log.error_message}</AlertDescription>
            </Alert>
          )}

          {/* Message preview */}
          {log.message_preview && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">Превью сообщения:</p>
              <ScrollArea className="h-[200px]">
                <pre className="text-sm text-text-secondary whitespace-pre-wrap bg-bg-secondary rounded-lg p-4">
                  {log.message_preview}
                </pre>
              </ScrollArea>
            </div>
          )}

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">Метаданные:</p>
              <ScrollArea className="h-[100px]">
                <pre className="text-xs text-text-muted bg-bg-secondary rounded-lg p-3 overflow-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

