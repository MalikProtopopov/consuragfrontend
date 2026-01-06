"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Download, User, Bot, Calendar, MessageSquare, Hash } from "lucide-react";
import { useTelegramSessionDetail, useExportTelegramSession } from "@/entities/telegram";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Spinner } from "@/shared/ui/spinner";
import { ROUTES } from "@/shared/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import { cn } from "@/shared/lib";

interface TelegramSessionDetailPageProps {
  params: Promise<{ id: string; sessionId: string }>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TelegramSessionDetailPage({ params }: TelegramSessionDetailPageProps) {
  const { id: projectId, sessionId } = use(params);
  const { data, isLoading, isError } = useTelegramSessionDetail(projectId, sessionId, 200);
  const { mutate: exportSession, isPending: exporting } = useExportTelegramSession();

  const session = data?.session;
  const messages = data?.messages || [];

  const handleExport = () => {
    exportSession(
      { projectId, sessionId },
      {
        onSuccess: (exportData) => {
          // Download as JSON file
          const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `telegram-session-${sessionId}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("Экспорт завершён");
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[200px] mb-6" />
        <Skeleton className="h-[400px]" />
      </PageContainer>
    );
  }

  if (isError || !session) {
    return (
      <PageContainer>
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={ROUTES.TELEGRAM_SESSIONS(projectId)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              К списку сессий
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-text-secondary">Сессия не найдена</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={ROUTES.TELEGRAM_SESSIONS(projectId)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К списку сессий
          </Link>
        </Button>
      </div>

      <PageHeader
        title={session.telegram_first_name || `User ${session.telegram_user_id}`}
        description={session.telegram_username ? `@${session.telegram_username}` : `ID: ${session.telegram_user_id}`}
      />

      {/* Session Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Информация о сессии</CardTitle>
              <CardDescription>
                Детали пользователя и статистика
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Экспорт JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                <Hash className="size-5 text-text-muted" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Telegram ID</p>
                <p className="font-medium text-text-primary">{session.telegram_user_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                <MessageSquare className="size-5 text-text-muted" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Сообщений</p>
                <p className="font-medium text-text-primary">{session.messages_count}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                <Calendar className="size-5 text-text-muted" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Создана</p>
                <p className="font-medium text-text-primary">{formatDate(session.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                <Badge variant={session.is_active ? "success" : "secondary"} className="px-3">
                  {session.is_active ? "Активна" : "Неактивна"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-text-muted">Последнее сообщение</p>
                <p className="font-medium text-text-primary">{formatDate(session.last_message_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat History */}
      <Card>
        <CardHeader>
          <CardTitle>История чата</CardTitle>
          <CardDescription>
            {messages.length} сообщений
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-10 w-10 text-text-muted mb-3" />
              <p className="text-text-secondary">Нет сообщений</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" ? "justify-start" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full",
                        message.role === "user"
                          ? "bg-accent-primary/10"
                          : message.role === "assistant"
                            ? "bg-[#0088cc]/10"
                            : "bg-bg-hover"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="size-4 text-accent-primary" />
                      ) : message.role === "assistant" ? (
                        <Bot className="size-4 text-[#0088cc]" />
                      ) : (
                        <MessageSquare className="size-4 text-text-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-text-primary">
                          {message.role === "user"
                            ? "Пользователь"
                            : message.role === "assistant"
                              ? "Ассистент"
                              : "Система"}
                        </span>
                        <span className="text-xs text-text-muted">
                          {formatTime(message.created_at)}
                        </span>
                        {message.tokens_used > 0 && (
                          <span className="text-xs text-text-muted">
                            {message.tokens_used} tokens
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "p-3 rounded-lg max-w-full",
                          message.role === "user"
                            ? "bg-accent-primary/10"
                            : message.role === "assistant"
                              ? "bg-bg-hover"
                              : "bg-bg-secondary"
                        )}
                      >
                        <p
                          className="text-sm text-text-secondary whitespace-pre-wrap break-words"
                          style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
                        >
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

