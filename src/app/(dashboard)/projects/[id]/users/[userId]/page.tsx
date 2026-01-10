"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ban,
  CheckCircle,
  MessageCircle,
  Calendar,
  Activity,
  Zap,
  MessageSquare,
  Clock,
  X,
  Plus,
  Save,
} from "lucide-react";
import {
  useEndUser,
  useUpdateEndUser,
  useUnblockEndUser,
  useUpdateEndUserLimits,
  useEndUserConversations,
} from "@/entities/end-user";
import { BlockUserDialog, SendMessageDialog } from "../_components";
import { PageContainer } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Skeleton } from "@/shared/ui/skeleton";
import { Progress } from "@/shared/ui/progress";
import { Separator } from "@/shared/ui/separator";
import { ROUTES } from "@/shared/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import { cn } from "@/shared/lib";
import type { IdentityProvider, UpdateEndUserLimitsRequest } from "@/shared/types/api";
// Hash removed from imports as unused

interface EndUserDetailPageProps {
  params: Promise<{ id: string; userId: string }>;
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

function getProviderIcon(provider: IdentityProvider): string {
  switch (provider) {
    case "telegram":
      return "📱";
    case "web":
      return "🌐";
    case "whatsapp":
      return "💬";
    case "email":
      return "📧";
    default:
      return "👤";
  }
}

function getProviderLabel(provider: IdentityProvider): string {
  switch (provider) {
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
      return provider;
  }
}

export default function EndUserDetailPage({ params }: EndUserDetailPageProps) {
  const { id: projectId, userId: endUserId } = use(params);

  const { data: user, isLoading, isError } = useEndUser(projectId, endUserId);
  const { data: conversationsData } = useEndUserConversations(projectId, endUserId, {
    limit: 5,
  });

  const { mutate: updateUser, isPending: isUpdating } = useUpdateEndUser();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockEndUser();
  const { mutate: updateLimits, isPending: isUpdatingLimits } = useUpdateEndUserLimits();

  // Local state for dialogs
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isSendMessageDialogOpen, setIsSendMessageDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isNotesModified, setIsNotesModified] = useState(false);
  const [isTagsModified, setIsTagsModified] = useState(false);

  // Limits state
  const [limitsForm, setLimitsForm] = useState<UpdateEndUserLimitsRequest>({});
  const [isLimitsModified, setIsLimitsModified] = useState(false);

  // Initialize local state from user data
  useState(() => {
    if (user) {
      setNotes(user.notes || "");
      setTags(user.tags || []);
      setLimitsForm({
        daily_tokens_limit: user.limits.daily_tokens_limit,
        monthly_tokens_limit: user.limits.monthly_tokens_limit,
        daily_messages_limit: user.limits.daily_messages_limit,
        monthly_messages_limit: user.limits.monthly_messages_limit,
        rate_limit_per_minute: user.limits.rate_limit_per_minute,
      });
    }
  });

  // Sync state when user data changes
  if (user && notes === "" && user.notes) {
    setNotes(user.notes);
  }
  if (user && tags.length === 0 && user.tags.length > 0) {
    setTags(user.tags);
  }

  const conversations = conversationsData?.items || [];

  const handleUnblock = () => {
    unblockUser(
      { projectId, endUserId },
      {
        onSuccess: () => toast.success("Пользователь разблокирован"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleSaveNotes = () => {
    updateUser(
      { projectId, endUserId, data: { notes } },
      {
        onSuccess: () => {
          toast.success("Заметки сохранены");
          setIsNotesModified(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag("");
      setIsTagsModified(true);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    setTags(updatedTags);
    setIsTagsModified(true);
  };

  const handleSaveTags = () => {
    updateUser(
      { projectId, endUserId, data: { tags } },
      {
        onSuccess: () => {
          toast.success("Теги сохранены");
          setIsTagsModified(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleSaveLimits = () => {
    updateLimits(
      { projectId, endUserId, data: limitsForm },
      {
        onSuccess: () => {
          toast.success("Лимиты обновлены");
          setIsLimitsModified(false);
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
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !user) {
    return (
      <PageContainer>
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href={ROUTES.END_USERS(projectId)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              К списку пользователей
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-text-secondary">Пользователь не найден</p>
        </div>
      </PageContainer>
    );
  }

  const primaryIdentity = user.identities.find((i) => i.is_primary) || user.identities[0];

  return (
    <PageContainer>
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={ROUTES.END_USERS(projectId)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К списку пользователей
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-accent-primary/10 text-accent-primary text-2xl font-medium">
            {user.display_name ? user.display_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-text-primary">
                {user.display_name || "Без имени"}
              </h1>
              <Badge
                variant={
                  user.status === "active"
                    ? "success"
                    : user.status === "blocked"
                      ? "destructive"
                      : "secondary"
                }
              >
                {user.status === "active"
                  ? "Активен"
                  : user.status === "blocked"
                    ? "Заблокирован"
                    : "Архив"}
              </Badge>
            </div>
            {primaryIdentity && (
              <p className="text-text-muted mt-1">
                {getProviderIcon(primaryIdentity.provider)}{" "}
                {primaryIdentity.username
                  ? `@${primaryIdentity.username}`
                  : `ID: ${primaryIdentity.external_id}`}
              </p>
            )}
            {user.blocked_reason && (
              <p className="text-sm text-destructive mt-1">
                Причина блокировки: {user.blocked_reason}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsSendMessageDialogOpen(true)}
            disabled={user.status === "blocked"}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Написать
          </Button>
          {user.status === "active" ? (
            <Button
              variant="destructive"
              onClick={() => setIsBlockDialogOpen(true)}
            >
              <Ban className="mr-2 h-4 w-4" />
              Заблокировать
            </Button>
          ) : user.status === "blocked" ? (
            <Button
              variant="outline"
              onClick={handleUnblock}
              disabled={isUnblocking}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Разблокировать
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Identities */}
          <Card>
            <CardHeader>
              <CardTitle>Идентичности</CardTitle>
              <CardDescription>Каналы связи пользователя</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.identities.map((identity) => (
                <div
                  key={identity.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    identity.is_primary ? "border-accent-primary bg-accent-primary/5" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getProviderIcon(identity.provider)}</span>
                      <span className="font-medium">{getProviderLabel(identity.provider)}</span>
                      {identity.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                          Основной
                        </Badge>
                      )}
                    </div>
                    {identity.is_reachable && (
                      <Badge variant="success" className="text-xs">
                        Доступен
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm space-y-1 text-text-secondary">
                    {identity.username && <p>@{identity.username}</p>}
                    {identity.first_name && (
                      <p>
                        {identity.first_name} {identity.last_name}
                      </p>
                    )}
                    <p className="text-text-muted">ID: {identity.external_id}</p>
                    {identity.language_code && (
                      <p className="text-text-muted">Язык: {identity.language_code}</p>
                    )}
                    {identity.last_activity_at && (
                      <p className="text-text-muted">
                        Последняя активность: {formatRelativeTime(identity.last_activity_at)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                    <MessageSquare className="size-5 text-text-muted" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Диалогов</p>
                    <p className="font-medium text-text-primary">
                      {user.stats.total_conversations}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                    <Activity className="size-5 text-text-muted" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Сообщений</p>
                    <p className="font-medium text-text-primary">
                      {user.stats.total_messages}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                    <Zap className="size-5 text-text-muted" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Токенов</p>
                    <p className="font-medium text-text-primary">
                      {user.stats.total_tokens_used.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
                    <Calendar className="size-5 text-text-muted" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Дней активен</p>
                    <p className="font-medium text-text-primary">
                      {user.stats.days_active}
                    </p>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Первый контакт</span>
                  <span className="text-text-secondary">{formatDate(user.first_seen_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Последняя активность</span>
                  <span className="text-text-secondary">{formatDate(user.last_seen_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Теги</CardTitle>
                  <CardDescription>Теги для сегментации пользователя</CardDescription>
                </div>
                {isTagsModified && (
                  <Button size="sm" onClick={handleSaveTags} disabled={isUpdating}>
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pr-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 p-0.5 hover:bg-bg-hover rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-text-muted">Нет тегов</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Новый тег..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  className="flex-1"
                />
                <Button variant="outline" size="icon" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Limits */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Лимиты</CardTitle>
                  <CardDescription>Ограничения использования</CardDescription>
                </div>
                {isLimitsModified && (
                  <Button size="sm" onClick={handleSaveLimits} disabled={isUpdatingLimits}>
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Daily tokens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-text-secondary">Дневной лимит токенов</Label>
                  <Input
                    type="number"
                    placeholder="Без лимита"
                    value={limitsForm.daily_tokens_limit ?? ""}
                    onChange={(e) => {
                      setLimitsForm({
                        ...limitsForm,
                        daily_tokens_limit: e.target.value ? Number(e.target.value) : null,
                      });
                      setIsLimitsModified(true);
                    }}
                    className="w-32 h-8 text-right"
                  />
                </div>
                {user.limits.daily_tokens_limit && (
                  <div className="space-y-1">
                    <Progress
                      value={
                        (user.limits.tokens_used_today / user.limits.daily_tokens_limit) * 100
                      }
                    />
                    <p className="text-xs text-text-muted text-right">
                      {user.limits.tokens_used_today.toLocaleString()} /{" "}
                      {user.limits.daily_tokens_limit.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Monthly tokens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-text-secondary">Месячный лимит токенов</Label>
                  <Input
                    type="number"
                    placeholder="Без лимита"
                    value={limitsForm.monthly_tokens_limit ?? ""}
                    onChange={(e) => {
                      setLimitsForm({
                        ...limitsForm,
                        monthly_tokens_limit: e.target.value ? Number(e.target.value) : null,
                      });
                      setIsLimitsModified(true);
                    }}
                    className="w-32 h-8 text-right"
                  />
                </div>
                {user.limits.monthly_tokens_limit && (
                  <div className="space-y-1">
                    <Progress
                      value={
                        (user.limits.tokens_used_month / user.limits.monthly_tokens_limit) * 100
                      }
                    />
                    <p className="text-xs text-text-muted text-right">
                      {user.limits.tokens_used_month.toLocaleString()} /{" "}
                      {user.limits.monthly_tokens_limit.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Daily messages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-text-secondary">Дневной лимит сообщений</Label>
                  <Input
                    type="number"
                    placeholder="Без лимита"
                    value={limitsForm.daily_messages_limit ?? ""}
                    onChange={(e) => {
                      setLimitsForm({
                        ...limitsForm,
                        daily_messages_limit: e.target.value ? Number(e.target.value) : null,
                      });
                      setIsLimitsModified(true);
                    }}
                    className="w-32 h-8 text-right"
                  />
                </div>
                {user.limits.daily_messages_limit && (
                  <div className="space-y-1">
                    <Progress
                      value={
                        (user.limits.messages_sent_today / user.limits.daily_messages_limit) *
                        100
                      }
                    />
                    <p className="text-xs text-text-muted text-right">
                      {user.limits.messages_sent_today} / {user.limits.daily_messages_limit}
                    </p>
                  </div>
                )}
              </div>

              {/* Rate limit */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-text-secondary">Rate limit (сообщ/мин)</Label>
                  <Input
                    type="number"
                    value={limitsForm.rate_limit_per_minute ?? user.limits.rate_limit_per_minute}
                    onChange={(e) => {
                      setLimitsForm({
                        ...limitsForm,
                        rate_limit_per_minute: Number(e.target.value),
                      });
                      setIsLimitsModified(true);
                    }}
                    className="w-32 h-8 text-right"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Заметки</CardTitle>
                  <CardDescription>Приватные заметки администратора</CardDescription>
                </div>
                {isNotesModified && (
                  <Button size="sm" onClick={handleSaveNotes} disabled={isUpdating}>
                    <Save className="mr-2 h-4 w-4" />
                    Сохранить
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Добавьте заметки о пользователе..."
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setIsNotesModified(e.target.value !== (user.notes || ""));
                }}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Recent conversations */}
          <Card>
            <CardHeader>
              <CardTitle>Последние диалоги</CardTitle>
              <CardDescription>История общения с AI-аватарами</CardDescription>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-6">
                  <MessageSquare className="mx-auto h-10 w-10 text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">Нет диалогов</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <Link
                      key={conv.id}
                      href={ROUTES.END_USER_CONVERSATION(projectId, endUserId, conv.id)}
                      className="block p-3 rounded-lg border border-border hover:bg-bg-hover transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-text-primary">
                          {conv.avatar_name || "AI Аватар"}
                        </span>
                        <Badge
                          variant={conv.status === "active" ? "success" : "secondary"}
                          className="text-xs"
                        >
                          {conv.status === "active" ? "Активен" : "Завершён"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {conv.messages_count} сообщений
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {conv.total_tokens.toLocaleString()} токенов
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(conv.last_activity_at)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Block User Dialog */}
      <BlockUserDialog
        open={isBlockDialogOpen}
        onOpenChange={setIsBlockDialogOpen}
        projectId={projectId}
        endUserId={endUserId}
        userName={user.display_name || "Пользователь"}
      />

      {/* Send Message Dialog */}
      <SendMessageDialog
        open={isSendMessageDialogOpen}
        onOpenChange={setIsSendMessageDialogOpen}
        projectId={projectId}
        endUserId={endUserId}
        userName={user.display_name || "Пользователь"}
        identities={user.identities}
      />
    </PageContainer>
  );
}

