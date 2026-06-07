"use client";

import { useState } from "react";
import { Users, Check, X, Send, Save, Webhook } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Spinner } from "@/shared/ui/spinner";
import { SecretInput } from "@/shared/ui/secret-input";
import { getApiErrorMessage } from "@/shared/lib";
import { useUpdateUserBot, useSendTestMessage } from "@/entities/notification";

import { BotStatusBadge } from "./BotStatusBadge";

/**
 * User Bot configuration card.
 */
export function UserBotCard({
  configured,
  username,
  webhookConfigured,
  webhookUrl,
  onRefetch,
}: {
  configured: boolean;
  username?: string;
  webhookConfigured: boolean;
  webhookUrl?: string;
  onRefetch: () => void;
}) {
  const [token, setToken] = useState("");

  const { mutate: updateUserBot, isPending: saving } = useUpdateUserBot();
  const { mutate: sendTest, isPending: testing } = useSendTestMessage();

  const handleSave = () => {
    if (!token.trim()) {
      toast.error("Введите токен бота");
      return;
    }

    updateUserBot(
      { bot_token: token },
      {
        onSuccess: () => {
          toast.success("User Bot сохранён");
          setToken("");
          onRefetch();
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
        },
      }
    );
  };

  const handleTest = () => {
    sendTest("user", {
      onSuccess: () => {
        toast.success("Тестовое сообщение отправлено (если у вас привязан Telegram)");
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <CardTitle>User Bot</CardTitle>
              <CardDescription>Уведомления пользователям платформы</CardDescription>
            </div>
          </div>
          <BotStatusBadge configured={configured} username={username} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status info */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Bot Token:</span>
            {configured ? (
              <Badge variant="success" className="gap-1">
                <Check className="h-3 w-3" />
                Настроен
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <X className="h-3 w-3" />
                Не настроен
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Webhook:</span>
            {webhookConfigured ? (
              <Badge variant="success" className="gap-1">
                <Webhook className="h-3 w-3" />
                Активен
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <X className="h-3 w-3" />
                Не активен
              </Badge>
            )}
          </div>
        </div>

        {/* Webhook URL */}
        {webhookUrl && (
          <div className="rounded-lg border border-border bg-bg-secondary/50 p-3">
            <p className="text-xs text-text-muted mb-1">Webhook URL:</p>
            <code className="text-xs text-text-secondary break-all">{webhookUrl}</code>
          </div>
        )}

        {/* Form */}
        <div className="space-y-2">
          <Label htmlFor="user-token">Bot Token</Label>
          <SecretInput
            id="user-token"
            value={token}
            onChange={setToken}
            placeholder="987654321:XYZabcDEFghiJKLmnoPQRstuVWX"
          />
          <p className="text-xs text-text-muted">
            Webhook будет автоматически настроен после сохранения
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSave} disabled={saving || !token.trim()}>
            {saving ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Сохранить
          </Button>
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={testing || !configured}
          >
            {testing ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Отправить тест
          </Button>
        </div>

        {/* Info about notifications */}
        <div className="rounded-lg border border-border bg-bg-secondary/50 p-4">
          <p className="text-sm font-medium text-text-primary mb-2">
            User Bot отправляет уведомления о:
          </p>
          <ul className="text-sm text-text-muted space-y-1">
            <li>• Достижении лимитов токенов (80%, 90%, 100%)</li>
            <li>• Истечении подписки</li>
            <li>• Изменении тарифного плана</li>
            <li>• Начислении бонусных токенов</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
