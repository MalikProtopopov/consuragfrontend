"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Users } from "lucide-react";
import { useTelegramSessions } from "@/entities/telegram";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Skeleton } from "@/shared/ui/skeleton";
import { ROUTES } from "@/shared/config";
import type { TelegramSessionStatus } from "@/shared/types/api";

interface TelegramSessionsPageProps {
  params: Promise<{ id: string }>;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "только что";
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays === 1) return "вчера";
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return date.toLocaleDateString("ru-RU");
}

export default function TelegramSessionsPage({ params }: TelegramSessionsPageProps) {
  const { id: projectId } = use(params);
  const [status, setStatus] = useState<TelegramSessionStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useTelegramSessions(projectId, {
    status,
    search: search || undefined,
    skip: page * limit,
    limit,
  });

  const sessions = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={ROUTES.TELEGRAM_INTEGRATION(projectId)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К настройкам
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Сессии Telegram"
        description="История чатов пользователей бота"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Пользователи ({total})</CardTitle>
              <CardDescription>
                Список активных и неактивных сессий
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  placeholder="Поиск по ID или username..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  className="pl-9 w-full sm:w-[250px]"
                />
              </div>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v as TelegramSessionStatus);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="inactive">Неактивные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-text-muted mb-4" />
              <p className="text-text-secondary mb-2">Нет сессий</p>
              <p className="text-sm text-text-muted">
                {search ? "Попробуйте изменить параметры поиска" : "Пользователи появятся после первого сообщения боту"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead className="text-center">Сообщений</TableHead>
                      <TableHead>Последняя активность</TableHead>
                      <TableHead className="text-center">Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow
                        key={session.id}
                        className="cursor-pointer hover:bg-bg-hover"
                        onClick={() => {
                          window.location.href = ROUTES.TELEGRAM_SESSION_DETAIL(projectId, session.id);
                        }}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-text-primary">
                              {session.telegram_first_name || `User ${session.telegram_user_id}`}
                            </p>
                            <p className="text-xs text-text-muted">
                              ID: {session.telegram_user_id}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {session.telegram_username ? (
                            <span className="text-text-secondary">@{session.telegram_username}</span>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{session.messages_count}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-text-secondary">
                            {formatRelativeTime(session.last_message_at)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={session.is_active ? "success" : "secondary"}>
                            {session.is_active ? "Активна" : "Неактивна"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
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
    </PageContainer>
  );
}

