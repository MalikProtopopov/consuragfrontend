"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Ban,
  MoreHorizontal,
  MessageCircle,
  Send,
  Globe,
  Mail,
  User,
  type LucideIcon,
} from "lucide-react";
import { useEndUsers } from "@/entities/end-user";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { EndUserStatusBadge } from "@/shared/ui/status-badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Skeleton } from "@/shared/ui/skeleton";
import { PaginationControls } from "@/shared/ui/pagination-controls";
import { ROUTES } from "@/shared/config";
import { formatRelativeTime, usePagination } from "@/shared/lib";
import type { EndUserStatus, IdentityProvider } from "@/shared/types/api";

interface EndUsersPageProps {
  params: Promise<{ id: string }>;
}

type StatusFilter = EndUserStatus | "all";
type ChannelFilter = IdentityProvider | "all";

function getChannelIcon(channel: IdentityProvider | null): LucideIcon {
  switch (channel) {
    case "telegram":
      return Send;
    case "web":
      return Globe;
    case "whatsapp":
      return MessageCircle;
    case "email":
      return Mail;
    default:
      return User;
  }
}

function getChannelLabel(channel: IdentityProvider | null): string {
  switch (channel) {
    case "telegram":
      return "Telegram";
    case "web":
      return "Web";
    case "whatsapp":
      return "WhatsApp";
    case "email":
      return "Email";
    case "api":
      return "API";
    default:
      return "—";
  }
}

export default function EndUsersPage({ params }: EndUsersPageProps) {
  const { id: projectId } = use(params);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [search, setSearch] = useState("");
  const pagination = usePagination();

  const { data, isLoading } = useEndUsers(projectId, {
    status: statusFilter !== "all" ? statusFilter : undefined,
    channel: channelFilter !== "all" ? channelFilter : undefined,
    search: search || undefined,
    skip: pagination.skip,
    limit: pagination.limit,
    order_by: "last_seen_at",
    order_desc: true,
  });

  const users = data?.items || [];
  const total = data?.total || 0;

  return (
    <PageContainer>
      <PageHeader
        title="Клиенты"
        description="Конечные пользователи, общающиеся с вашими AI-аватарами"
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Все пользователи ({total})</CardTitle>
              <CardDescription>
                Список пользователей с фильтрацией по статусу и каналу
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  placeholder="Поиск по имени..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    pagination.reset();
                  }}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as StatusFilter);
                  pagination.reset();
                }}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активные</SelectItem>
                  <SelectItem value="blocked">Заблокированные</SelectItem>
                  <SelectItem value="archived">Архивные</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={channelFilter}
                onValueChange={(v) => {
                  setChannelFilter(v as ChannelFilter);
                  pagination.reset();
                }}
              >
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Канал" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все каналы</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
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
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-text-muted mb-4" />
              <p className="text-text-secondary mb-2">Нет пользователей</p>
              <p className="text-sm text-text-muted">
                {search || statusFilter !== "all" || channelFilter !== "all"
                  ? "Попробуйте изменить параметры поиска"
                  : "Пользователи появятся после первого сообщения боту"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead className="text-center">Канал</TableHead>
                      <TableHead className="text-center">Статус</TableHead>
                      <TableHead className="text-center">Диалоги</TableHead>
                      <TableHead className="text-center">Сообщения</TableHead>
                      <TableHead>Последняя активность</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer hover:bg-bg-hover"
                        onClick={() => {
                          window.location.href = ROUTES.END_USER_DETAIL(projectId, user.id);
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary font-medium">
                              {user.display_name
                                ? user.display_name.charAt(0).toUpperCase()
                                : "U"}
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">
                                {user.display_name || "Без имени"}
                              </p>
                              {user.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {user.tags.slice(0, 2).map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="text-xs px-1.5 py-0"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {user.tags.length > 2 && (
                                    <span className="text-xs text-text-muted">
                                      +{user.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {(() => {
                            const ChannelIcon = getChannelIcon(user.primary_channel);
                            return (
                              <ChannelIcon
                                className="size-4 inline-block text-text-secondary"
                                aria-label={getChannelLabel(user.primary_channel)}
                              />
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-center">
                          {user.status === "active" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="status-dot status-dot-active inline-block" />
                              </TooltipTrigger>
                              <TooltipContent>Активен</TooltipContent>
                            </Tooltip>
                          ) : (
                            <EndUserStatusBadge status={user.status} />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{user.conversations_count}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{user.messages_count}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-text-secondary">
                            {formatRelativeTime(user.last_seen_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={ROUTES.END_USER_DETAIL(projectId, user.id)}>
                                  <Users className="mr-2 h-4 w-4" />
                                  Открыть профиль
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Написать
                              </DropdownMenuItem>
                              {user.status === "active" && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  disabled
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Заблокировать
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <PaginationControls
                pagination={pagination}
                total={data?.total}
                className="mt-4 pt-4 border-t border-border"
              />
            </>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

