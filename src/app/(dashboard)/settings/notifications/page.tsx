"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Bell,
  BellOff,
  Copy,
  Check,
  ExternalLink,
  Unlink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import {
  Alert,
  AlertDescription,
} from "@/shared/ui/alert";
import { getApiErrorMessage } from "@/shared/lib";
import {
  useTelegramStatus,
  useGenerateLinkCode,
  useUnlinkTelegram,
  useToggleNotifications,
} from "@/entities/notification";

/**
 * Notifications settings page for OWNER users
 */
export default function NotificationsPage() {
  const [linkModalOpen, setLinkModalOpen] = useState(false);

  const { data: status, isLoading, error, refetch } = useTelegramStatus();

  // Auto-close modal callback when linked
  const handleStatusCheck = useCallback(() => {
    refetch().then((result) => {
      if (result.data?.linked) {
        setLinkModalOpen(false);
        toast.success("Telegram успешно привязан!");
      }
    });
  }, [refetch]);

  if (isLoading) {
    return (
      <PageContainer maxWidth="lg">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[300px]" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer maxWidth="lg">
        <PageHeader
          title="Уведомления"
          description="Настройка уведомлений через Telegram"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ошибка загрузки статуса: {getApiErrorMessage(error)}
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title="Уведомления"
        description="Настройка уведомлений через Telegram"
      />

      <div className="grid gap-6">
        {/* Telegram notifications card */}
        {status?.linked ? (
          <TelegramLinkedCard
            username={status.username}
            linkedAt={status.linked_at}
            notificationsEnabled={status.notifications_enabled}
            onRefetch={refetch}
          />
        ) : (
          <TelegramNotLinkedCard onLink={() => setLinkModalOpen(true)} />
        )}

        {/* Info card about notification types */}
        <NotificationTypesCard />
      </div>

      {/* Link modal */}
      <LinkTelegramModal
        open={linkModalOpen}
        onOpenChange={setLinkModalOpen}
        onCheckStatus={handleStatusCheck}
      />
    </PageContainer>
  );
}

/**
 * Card shown when Telegram is not linked
 */
function TelegramNotLinkedCard({ onLink }: { onLink: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10">
            <Send className="h-5 w-5 text-accent-primary" />
          </div>
          <div>
            <CardTitle>Telegram-уведомления</CardTitle>
            <CardDescription>Получайте важные уведомления в Telegram</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-text-secondary space-y-2">
          <p>Вы будете получать уведомления о:</p>
          <ul className="list-disc list-inside space-y-1 text-text-muted">
            <li>Достижении лимитов токенов (80%, 90%, 100%)</li>
            <li>Окончании подписки</li>
            <li>Изменении тарифа</li>
            <li>Начислении бонусов</li>
          </ul>
        </div>
        <Button onClick={onLink}>
          <Send className="mr-2 h-4 w-4" />
          Привязать Telegram
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Card shown when Telegram is linked
 */
function TelegramLinkedCard({
  username,
  linkedAt,
  notificationsEnabled,
  onRefetch,
}: {
  username?: string;
  linkedAt?: string;
  notificationsEnabled: boolean;
  onRefetch: () => void;
}) {
  const { mutate: toggleNotifications, isPending: toggling } = useToggleNotifications();
  const { mutate: unlinkTelegram, isPending: unlinking } = useUnlinkTelegram();

  const handleToggle = (enabled: boolean) => {
    toggleNotifications(enabled, {
      onSuccess: () => {
        toast.success(enabled ? "Уведомления включены" : "Уведомления отключены");
        onRefetch();
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  const handleUnlink = () => {
    if (!confirm("Отвязать Telegram? Вы перестанете получать уведомления.")) {
      return;
    }
    unlinkTelegram(undefined, {
      onSuccess: () => {
        toast.success("Telegram отвязан");
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  const formattedDate = linkedAt
    ? new Date(linkedAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <Send className="h-5 w-5 text-success" />
          </div>
          <div>
            <CardTitle>Telegram-уведомления</CardTitle>
            <CardDescription>Уведомления настроены</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="success">Привязан</Badge>
            {username && (
              <span className="text-sm font-medium text-text-primary">{username}</span>
            )}
          </div>
          {formattedDate && (
            <p className="text-sm text-text-muted">С {formattedDate}</p>
          )}
        </div>

        {/* Toggle notifications */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            {notificationsEnabled ? (
              <Bell className="h-5 w-5 text-accent-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-text-muted" />
            )}
            <div>
              <p className="font-medium text-text-primary">Уведомления</p>
              <p className="text-sm text-text-muted">
                {notificationsEnabled ? "Включены" : "Отключены"}
              </p>
            </div>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={handleToggle}
            disabled={toggling}
          />
        </div>

        {/* Unlink button */}
        <Button
          variant="outline"
          onClick={handleUnlink}
          disabled={unlinking}
          className="text-error hover:text-error"
        >
          {unlinking ? (
            <Spinner className="mr-2 h-4 w-4" />
          ) : (
            <Unlink className="mr-2 h-4 w-4" />
          )}
          Отвязать Telegram
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Info card about notification types
 */
function NotificationTypesCard() {
  const notificationTypes = [
    {
      title: "Лимит 80%",
      description: "Предупреждение о достижении 80% лимита токенов",
    },
    {
      title: "Лимит 90%",
      description: "Предупреждение о достижении 90% лимита токенов",
    },
    {
      title: "Лимит исчерпан",
      description: "Уведомление об исчерпании лимита токенов",
    },
    {
      title: "Подписка истекает",
      description: "Напоминания за 7, 3 и 1 день до окончания подписки",
    },
    {
      title: "Смена тарифа",
      description: "Уведомление об изменении тарифного плана",
    },
    {
      title: "Бонусные токены",
      description: "Уведомление о начислении бонусных токенов",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Типы уведомлений</CardTitle>
        <CardDescription>
          Какие уведомления вы будете получать в Telegram
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {notificationTypes.map((type) => (
            <div
              key={type.title}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <Bell className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-text-primary">{type.title}</p>
                <p className="text-xs text-text-muted">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Custom hook for countdown timer
 */
function useCountdown(initialSeconds: number) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback((seconds: number) => {
    setTimeLeft(seconds);
  }, []);

  const stop = useCallback(() => {
    setTimeLeft(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timeLeft]);

  return { timeLeft, start, stop };
}

/**
 * Modal for linking Telegram
 */
function LinkTelegramModal({
  open,
  onOpenChange,
  onCheckStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckStatus: () => void;
}) {
  const { mutate: generateCode, data: linkData, isPending, error, reset } = useGenerateLinkCode();
  const [copied, setCopied] = useState(false);
  const { timeLeft, start, stop } = useCountdown(0);

  // Handle generate code
  const handleGenerateCode = useCallback(() => {
    generateCode(undefined, {
      onSuccess: (data) => {
        start(data.expires_in);
      },
    });
  }, [generateCode, start]);

  // Generate code on mount when open
  const hasGeneratedRef = useRef(false);
  useEffect(() => {
    if (open && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      handleGenerateCode();
    }
    if (!open) {
      hasGeneratedRef.current = false;
      reset();
      stop();
    }
  }, [open, handleGenerateCode, reset, stop]);

  const handleCopy = async () => {
    if (!linkData?.code) return;

    try {
      await navigator.clipboard.writeText(linkData.code);
      setCopied(true);
      toast.success("Код скопирован");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Привязка Telegram</DialogTitle>
          <DialogDescription>
            Следуйте инструкции для привязки аккаунта
          </DialogDescription>
        </DialogHeader>

        {isPending && (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
          </Alert>
        )}

        {linkData && !isPending && (
          <div className="space-y-6">
            {/* Step 1: Copy code */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                1. Скопируйте код:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-bg-secondary px-4 py-3 text-lg font-mono font-bold text-text-primary text-center">
                  {linkData.code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Step 2: Open bot */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                2. Откройте бота в Telegram:
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(linkData.bot_link, "_blank")}
              >
                <Send className="mr-2 h-4 w-4" />
                Открыть @{linkData.bot_username}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Step 3: Send command */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                3. Отправьте боту команду:
              </p>
              <code className="block rounded-lg bg-bg-secondary px-4 py-2 text-sm text-text-secondary">
                /start {linkData.code}
              </code>
            </div>

            {/* Timer and check status */}
            <div className="flex items-center justify-between">
              {timeLeft > 0 ? (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <span>Код действителен:</span>
                  <Badge variant={timeLeft < 60 ? "destructive" : "secondary"}>
                    {formatTime(timeLeft)}
                  </Badge>
                </div>
              ) : (
                <Alert className="flex-1">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Код истёк. Закройте окно и попробуйте снова.
                  </AlertDescription>
                </Alert>
              )}
              {timeLeft > 0 && (
                <Button variant="outline" size="sm" onClick={onCheckStatus}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Проверить
                </Button>
              )}
            </div>

            <p className="text-xs text-text-muted text-center">
              Нажмите «Проверить» после отправки команды боту
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
