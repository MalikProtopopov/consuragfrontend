"use client";

import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useUsers } from "@/entities/user";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/shared/ui/pagination";
import type { UserRole, UserStatus } from "@/shared/types/api";

const roleLabels: Record<UserRole, string> = {
  saas_admin: "Администратор",
  owner: "Владелец",
  manager: "Менеджер",
  content_manager: "Контент",
  client: "Клиент",
};

const statusConfig: Record<UserStatus, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  active: { label: "Активен", variant: "success" },
  inactive: { label: "Неактивен", variant: "secondary" },
  suspended: { label: "Заблокирован", variant: "destructive" },
  pending: { label: "Ожидает", variant: "outline" },
};

export default function UsersPage() {
  const [page, setPage] = useState(0);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const limit = 20;

  const { data, isLoading } = useUsers({
    skip: page * limit,
    limit,
    role: roleFilter === "all" ? undefined : roleFilter,
    user_status: statusFilter === "all" ? undefined : statusFilter,
  });

  const users = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("ru-RU");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Пользователи"
        description="Управление пользователями платформы"
        actions={
          <Button asChild>
            <Link href="/admin/users/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Создать пользователя
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select
          value={roleFilter}
          onValueChange={(v) => {
            setRoleFilter(v as typeof roleFilter);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Роль" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все роли</SelectItem>
            <SelectItem value="saas_admin">Администратор</SelectItem>
            <SelectItem value="owner">Владелец</SelectItem>
            <SelectItem value="manager">Менеджер</SelectItem>
            <SelectItem value="content_manager">Контент</SelectItem>
            <SelectItem value="client">Клиент</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as typeof statusFilter);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="inactive">Неактивные</SelectItem>
            <SelectItem value="suspended">Заблокированные</SelectItem>
            <SelectItem value="pending">Ожидающие</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Пользователи ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Email верифицирован</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead>Последний вход</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const status = statusConfig[user.status];
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="flex items-center gap-3 hover:opacity-80"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-accent-primary/10 text-accent-primary text-xs">
                                {(user.full_name || user.email)
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-text-primary">
                                {user.full_name || "—"}
                              </p>
                              <p className="text-sm text-text-muted">{user.email}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{roleLabels[user.role]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.is_email_verified ? (
                            <Badge variant="success">Да</Badge>
                          ) : (
                            <Badge variant="outline">Нет</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>{formatDate(user.last_login_at)}</TableCell>
                      </TableRow>
                    );
                  })}
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

