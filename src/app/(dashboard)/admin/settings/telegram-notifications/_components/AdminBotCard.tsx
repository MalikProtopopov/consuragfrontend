"use client";

import { useState } from "react";
import { Bot, Check, X, Send, Save } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { Spinner } from "@/shared/ui/spinner";
import { SecretInput } from "@/shared/ui/secret-input";
import { getApiErrorMessage } from "@/shared/lib";
import { useUpdateAdminBot, useSendTestMessage } from "@/entities/notification";

import { BotStatusBadge } from "./BotStatusBadge";

/**
 * Admin Bot configuration card.
 */
export function AdminBotCard({
  configured,
  username,
  chatIdConfigured,
  onRefetch,
}: {
  configured: boolean;
  username?: string;
  chatIdConfigured: boolean;
  onRefetch: () => void;
}) {
  const [token, setToken] = useState("");
  const [chatId, setChatId] = useState("");

  const { mutate: updateAdminBot, isPending: saving } = useUpdateAdminBot();
  const { mutate: sendTest, isPending: testing } = useSendTestMessage();

  const handleSave = () => {
    if (!token.trim() || !chatId.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    updateAdminBot(
      { bot_token: token, chat_id: chatId },
      {
        onSuccess: () => {
          toast.success("Admin Bot сохранён");
          setToken("");
          setChatId("");
          onRefetch();
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
        },
      }
    );
  };

  const handleTest = () => {
    sendTest("admin", {
      onSuccess: () => {
        toast.success("Тестовое сообщение отправлено");
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10">
              <Bot className="h-5 w-5 text-accent-primary" />
            </div>
            <div>
              <CardTitle>Admin Bot</CardTitle>
              <CardDescription>Уведомления администратору платформы</CardDescription>
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
            <span className="text-text-muted">Chat ID:</span>
            {chatIdConfigured ? (
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
        </div>

        {/* Form */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="admin-token">Bot Token</Label>
          <SecretInput
            id="admin-token"
            value={token}
            onChange={setToken}
            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
          />
            <p className="text-xs text-text-muted">
              Получите токен у @BotFather в Telegram
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-chat-id">Chat ID</Label>
            <Input
              id="admin-chat-id"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="-1001234567890"
            />
            <p className="text-xs text-text-muted">
              ID группы или личного чата для уведомлений
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSave}
            disabled={saving || !token.trim() || !chatId.trim()}
          >
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
            Admin Bot отправляет уведомления о:
          </p>
          <ul className="text-sm text-text-muted space-y-1">
            <li>• Новых заявках на изменение тарифа</li>
            <li>• Регистрациях новых пользователей</li>
            <li>• Исчерпании лимитов пользователями</li>
            <li>• Ежедневных и еженедельных отчётах</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
