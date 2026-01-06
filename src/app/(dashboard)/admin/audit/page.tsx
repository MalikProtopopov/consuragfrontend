"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { useAuditLogs } from "@/entities/analytics";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/shared/ui/pagination";
import type { AuditAction, AuditResourceType } from "@/shared/types/api";

const actionLabels: Record<AuditAction, string> = {
  create: "Создание",
  update: "Обновление",
  delete: "Удаление",
  login: "Вход",
  logout: "Выход",
  upload: "Загрузка",
  publish: "Публикация",
  unpublish: "Снятие с публикации",
};

const resourceLabels: Record<AuditResourceType, string> = {
  user: "Пользователь",
  project: "Проект",
  avatar: "Аватар",
  document: "Документ",
  session: "Сессия",
  member: "Участник",
  telegram: "Telegram",
};

const actionColors: Record<AuditAction, "default" | "secondary" | "success" | "destructive" | "outline"> = {
  create: "success",
  update: "default",
  delete: "destructive",
  login: "secondary",
  logout: "secondary",
  upload: "default",
  publish: "success",
  unpublish: "outline",
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [resourceFilter, setResourceFilter] = useState<AuditResourceType | "all">("all");
  const limit = 50;

  const { data, isLoading } = useAuditLogs({
    skip: page * limit,
    limit,
    action: actionFilter === "all" ? undefined : actionFilter,
    resource_type: resourceFilter === "all" ? undefined : resourceFilter,
  });

  const logs = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <PageContainer>
      <PageHeader title="Аудит логи" description="История действий на платформе" />

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select
          value={actionFilter}
          onValueChange={(v) => {
            setActionFilter(v as typeof actionFilter);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Действие" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все действия</SelectItem>
            {Object.entries(actionLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={resourceFilter}
          onValueChange={(v) => {
            setResourceFilter(v as typeof resourceFilter);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ресурс" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все ресурсы</SelectItem>
            {Object.entries(resourceLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Логи ({total})</CardTitle>
          <CardDescription>Записи о действиях пользователей</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-text-muted mb-4" />
              <p className="text-text-secondary">Нет записей</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Действие</TableHead>
                    <TableHead>Ресурс</TableHead>
                    <TableHead>ID ресурса</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-mono">
                        {formatDate(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{log.user_email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionColors[log.action]}>
                          {actionLabels[log.action]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{resourceLabels[log.resource_type]}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.resource_id ? log.resource_id.slice(0, 8) + "..." : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.ip_address || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 0) setPage(page - 1);
                          }}
                        />
                      </PaginationItem>
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            isActive={page === i}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(i);
                            }}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < totalPages - 1) setPage(page + 1);
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

