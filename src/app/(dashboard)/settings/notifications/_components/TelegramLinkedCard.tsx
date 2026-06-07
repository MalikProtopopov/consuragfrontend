"use client";

import { Send, Bell, BellOff, Unlink } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { Spinner } from "@/shared/ui/spinner";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import { getApiErrorMessage, formatDate } from "@/shared/lib";
import { useUnlinkTelegram, useToggleNotifications } from "@/entities/notification";

/**
 * Card shown when Telegram is linked.
 */
export function TelegramLinkedCard({
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
  const confirm = useConfirm();

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

  const handleUnlink = async () => {
    const ok = await confirm({
      title: "Отвязать Telegram?",
      description: "Вы перестанете получать уведомления в Telegram.",
      confirmLabel: "Отвязать",
      variant: "destructive",
    });
    if (!ok) return;
    unlinkTelegram(undefined, {
      onSuccess: () => {
        toast.success("Telegram отвязан");
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  const formattedDate = linkedAt ? formatDate(linkedAt, "long", "") : null;

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
