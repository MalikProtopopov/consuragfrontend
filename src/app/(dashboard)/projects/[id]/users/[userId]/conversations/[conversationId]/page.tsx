"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Bot,
  Calendar,
  MessageSquare,
  Zap,
  Clock,
  Send,
  StopCircle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  useConversation,
  useConversationMessages,
  useEndConversation,
  useSendMessageToEndUser,
  useEndUser,
} from "@/entities/end-user";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Textarea } from "@/shared/ui/textarea";
import { Skeleton } from "@/shared/ui/skeleton";
import { ScrollArea } from "@/shared/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { ROUTES } from "@/shared/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import { cn } from "@/shared/lib";
import type { ConversationMessage } from "@/shared/types/api";

interface ConversationDetailPageProps {
  params: Promise<{ id: string; userId: string; conversationId: string }>;
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

function MessageBubble({ message }: { message: ConversationMessage }) {
  const isUser = message.direction === "in" || message.role === "user";
  const isAssistant = message.role === "assistant";
  const isAdmin = message.role === "admin";

  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-accent-primary/10"
            : isAssistant
              ? "bg-[#0088cc]/10"
              : isAdmin
                ? "bg-amber-500/10"
                : "bg-bg-hover"
        )}
      >
        {isUser ? (
          <User className="size-4 text-accent-primary" />
        ) : isAssistant ? (
          <Bot className="size-4 text-[#0088cc]" />
        ) : isAdmin ? (
          <User className="size-4 text-amber-500" />
        ) : (
          <MessageSquare className="size-4 text-text-muted" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-text-primary">
            {isUser
              ? "Пользователь"
              : isAssistant
                ? "AI Ассистент"
                : isAdmin
                  ? "Администратор"
                  : "Система"}
          </span>
          <span className="text-xs text-text-muted">{formatTime(message.created_at)}</span>
          {message.total_tokens > 0 && (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {message.total_tokens}
            </span>
          )}
          {message.model_used && (
            <span className="text-xs text-text-muted">{message.model_used}</span>
          )}
          {message.feedback && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                message.feedback === "positive" ? "text-green-500" : "text-red-500"
              )}
            >
              {message.feedback === "positive" ? (
                <ThumbsUp className="h-3 w-3" />
              ) : (
                <ThumbsDown className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-lg max-w-full",
            isUser
              ? "bg-accent-primary/10"
              : isAssistant
                ? "bg-bg-hover"
                : isAdmin
                  ? "bg-amber-500/10"
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
  );
}

export default function ConversationDetailPage({ params }: ConversationDetailPageProps) {
  const { id: projectId, userId: endUserId, conversationId } = use(params);

  const { data: conversation, isLoading: convLoading } = useConversation(
    projectId,
    conversationId
  );
  const { data: messagesData, isLoading: messagesLoading } = useConversationMessages(
    projectId,
    conversationId,
    { limit: 200 }
  );
  const { data: user } = useEndUser(projectId, endUserId);

  const { mutate: endConversation, isPending: isEnding } = useEndConversation();
  const { mutate: sendMessage, isPending: isSending } = useSendMessageToEndUser();

  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState("");

  const messages = messagesData?.items || [];
  const isLoading = convLoading || messagesLoading;

  const handleEndConversation = () => {
    endConversation(
      { projectId, conversationId },
      {
        onSuccess: () => {
          toast.success("Диалог завершён");
          setIsEndDialogOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    sendMessage(
      {
        projectId,
        endUserId,
        data: {
          channel: conversation?.channel || "telegram",
          text: messageText.trim(),
        },
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            toast.success("Сообщение отправлено");
            setMessageText("");
          } else {
            toast.error(response.error || "Не удалось отправить сообщение");
          }
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[150px] mb-6" />
        <Skeleton className="h-[500px]" />
      </PageContainer>
    );
  }

  if (!conversation) {
    return (
      <PageContainer>
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={ROUTES.END_USER_DETAIL(projectId, endUserId)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              К профилю пользователя
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-text-secondary">Диалог не найден</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={ROUTES.END_USER_DETAIL(projectId, endUserId)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К профилю пользователя
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`Диалог с ${user?.display_name || "пользователем"}`}
        description={conversation.avatar_name || "AI Аватар"}
      />

      {/* Conversation Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Информация о диалоге</CardTitle>
              <CardDescription>Статистика и метаданные</CardDescription>
            </div>
            {conversation.status === "active" && (
              <Button
                variant="outline"
                onClick={() => setIsEndDialogOpen(true)}
                disabled={isEnding}
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Завершить диалог
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                <Badge
                  variant={conversation.status === "active" ? "success" : "secondary"}
                  className="px-3"
                >
                  {conversation.status === "active"
                    ? "Активен"
                    : conversation.status === "ended"
                      ? "Завершён"
                      : "Архив"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-text-muted">Статус</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                <MessageSquare className="size-5 text-text-muted" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Сообщений</p>
                <p className="font-medium text-text-primary">{conversation.messages_count}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                <Zap className="size-5 text-text-muted" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Токенов</p>
                <p className="font-medium text-text-primary">
                  {conversation.total_tokens.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                <Calendar className="size-5 text-text-muted" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Начат</p>
                <p className="font-medium text-text-primary">
                  {formatDate(conversation.started_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                <Clock className="size-5 text-text-muted" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Последняя активность</p>
                <p className="font-medium text-text-primary">
                  {formatRelativeTime(conversation.last_activity_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>История сообщений</CardTitle>
          <CardDescription>
            {messages.length} сообщений • {conversation.user_messages_count} от пользователя,{" "}
            {conversation.assistant_messages_count} от ассистента
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
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Send message form */}
          {conversation.status === "active" && user?.status === "active" && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Написать сообщение от имени бота..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={2}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || isSending}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Сообщение будет отправлено от имени бота в {conversation.channel}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* End Conversation Dialog */}
      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Завершить диалог?</DialogTitle>
            <DialogDescription>
              Диалог будет помечен как завершённый. Пользователь сможет начать новый диалог.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEndDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEndConversation} disabled={isEnding}>
              {isEnding ? "Завершение..." : "Завершить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

