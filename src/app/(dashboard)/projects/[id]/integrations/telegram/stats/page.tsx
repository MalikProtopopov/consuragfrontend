"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Clock,
  AlertTriangle,
  XCircle,
  Activity,
  UserCheck,
} from "lucide-react";
import { useTelegramStats, useTelegramEvents } from "@/entities/telegram";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { StatsCard } from "@/shared/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ROUTES } from "@/shared/config";
import type { TelegramEventType } from "@/shared/types/api";

interface TelegramStatsPageProps {
  params: Promise<{ id: string }>;
}

const eventTypeLabels: Record<TelegramEventType, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline" }> = {
  message_received: { label: "Сообщение", variant: "default" },
  message_sent: { label: "Ответ", variant: "success" },
  command_received: { label: "Команда", variant: "secondary" },
  rate_limited: { label: "Rate limit", variant: "destructive" },
  error: { label: "Ошибка", variant: "destructive" },
  session_created: { label: "Новая сессия", variant: "outline" },
  session_cleared: { label: "Очистка", variant: "outline" },
  webhook_invalid: { label: "Webhook", variant: "destructive" },
};

function formatResponseTime(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TelegramStatsPage({ params }: TelegramStatsPageProps) {
  const { id: projectId } = use(params);
  const { data: stats, isLoading: statsLoading } = useTelegramStats(projectId);
  const [eventsLimit] = useState(50);
  const { data: eventsData, isLoading: eventsLoading } = useTelegramEvents(projectId, { limit: eventsLimit });

  const isLoading = statsLoading;
  const events = eventsData?.items || [];

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </PageContainer>
    );
  }

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
        title="Статистика Telegram"
        description="Метрики и события интеграции"
      />

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Всего пользователей"
          value={stats?.total_users ?? 0}
          icon={Users}
        />
        <StatsCard
          title="Активных сессий"
          value={stats?.active_sessions ?? 0}
          description={`Неактивных: ${stats?.inactive_sessions ?? 0}`}
          icon={UserCheck}
        />
        <StatsCard
          title="Сообщений сегодня"
          value={stats?.total_messages_today ?? 0}
          description={`За неделю: ${stats?.total_messages_week ?? 0}`}
          icon={MessageSquare}
        />
        <StatsCard
          title="Среднее время ответа"
          value={formatResponseTime(stats?.avg_response_time_ms ?? null)}
          icon={Clock}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatsCard
          title="Сообщений за месяц"
          value={stats?.total_messages_month ?? 0}
          icon={Activity}
        />
        <StatsCard
          title="Rate limit событий"
          value={stats?.rate_limit_events_today ?? 0}
          description="За сегодня"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Ошибок"
          value={stats?.error_events_today ?? 0}
          description="За сегодня"
          icon={XCircle}
        />
      </div>

      {/* Events Log */}
      <Card>
        <CardHeader>
          <CardTitle>Последние события</CardTitle>
          <CardDescription>
            Лог активности бота ({events.length} событий)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="mx-auto h-10 w-10 text-text-muted mb-3" />
              <p className="text-text-secondary">Нет событий</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {events.map((event) => {
                  const typeConfig = eventTypeLabels[event.event_type] || {
                    label: event.event_type,
                    variant: "outline" as const,
                  };
                  return (
                    <div
                      key={event.id}
                      className="flex items-start justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                          {event.telegram_user_id && (
                            <span className="text-xs text-text-muted">
                              User: {event.telegram_user_id}
                            </span>
                          )}
                          {event.response_time_ms && (
                            <span className="text-xs text-text-muted">
                              {formatResponseTime(event.response_time_ms)}
                            </span>
                          )}
                          {event.tokens_used && (
                            <span className="text-xs text-text-muted">
                              {event.tokens_used} tokens
                            </span>
                          )}
                        </div>
                        {event.message_text && (
                          <p className="text-sm text-text-secondary truncate max-w-md">
                            {event.message_text}
                          </p>
                        )}
                        {event.error_message && (
                          <p className="text-sm text-error truncate max-w-md">
                            {event.error_message}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-text-muted whitespace-nowrap ml-4">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

