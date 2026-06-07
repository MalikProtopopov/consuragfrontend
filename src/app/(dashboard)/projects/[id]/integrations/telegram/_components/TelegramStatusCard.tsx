"use client";

import Image from "next/image";
import { Send, Check, X, Copy, Link2, Bot } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { ActiveStatusBadge } from "@/shared/ui/status-badge";
import { Spinner } from "@/shared/ui/spinner";
import { toast } from "sonner";
import type { TelegramIntegration } from "@/shared/types/api";

interface TelegramStatusCardProps {
  integration: TelegramIntegration;
  onSetWebhook: () => void;
  onDeleteWebhook: () => void;
  settingWebhook: boolean;
  deletingWebhook: boolean;
}

export function TelegramStatusCard({
  integration,
  onSetWebhook,
  onDeleteWebhook,
  settingWebhook,
  deletingWebhook,
}: TelegramStatusCardProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-brand-telegram/10">
              <Send className="size-6 text-brand-telegram" />
            </div>
            <div>
              <p className="font-medium text-text-primary">
                @{integration.bot_username || "bot"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <ActiveStatusBadge active={integration.is_active} />
                {integration.is_webhook_active ? (
                  <Badge variant="success">
                    <Check className="mr-1 h-3 w-3" />
                    Webhook
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <X className="mr-1 h-3 w-3" />
                    Webhook
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {integration.is_webhook_active ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteWebhook}
                disabled={deletingWebhook}
              >
                {deletingWebhook ? <Spinner className="h-4 w-4" /> : "Удалить webhook"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onSetWebhook}
                disabled={settingWebhook}
              >
                {settingWebhook ? <Spinner className="h-4 w-4" /> : "Установить webhook"}
              </Button>
            )}
          </div>
        </div>

        {/* Webhook URL Section */}
        {integration.webhook_url && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="h-4 w-4 text-text-muted" />
              <span className="text-sm font-medium text-text-secondary">Webhook URL</span>
            </div>
            <div className="flex gap-2">
              <Input
                value={integration.webhook_url}
                readOnly
                className="font-mono text-xs bg-bg-secondary"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(integration.webhook_url || "");
                  toast.success("URL скопирован");
                }}
                title="Копировать URL"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Selected Avatar Section */}
        {integration.default_avatar && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-text-muted" />
              <span className="text-sm font-medium text-text-secondary">Аватар для ответов</span>
            </div>
            <div className="flex items-center gap-3">
              {integration.default_avatar.avatar_image_url ? (
                <div
                  className="relative size-10 rounded-lg overflow-hidden flex-shrink-0"
                  style={integration.default_avatar.primary_color ? {
                    boxShadow: `0 0 0 2px ${integration.default_avatar.primary_color}20`
                  } : undefined}
                >
                  <Image
                    src={integration.default_avatar.avatar_image_url}
                    alt={integration.default_avatar.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="size-10 rounded-lg bg-bg-secondary flex items-center justify-center flex-shrink-0"
                  style={integration.default_avatar.primary_color ? {
                    backgroundColor: `${integration.default_avatar.primary_color}20`
                  } : undefined}
                >
                  <Bot
                    className="size-5"
                    style={integration.default_avatar.primary_color ? {
                      color: integration.default_avatar.primary_color
                    } : undefined}
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text-primary truncate">
                  {integration.default_avatar.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant={integration.default_avatar.is_published ? "success" : "secondary"}
                    className="text-xs"
                  >
                    {integration.default_avatar.is_published ? "Опубликован" : "Черновик"}
                  </Badge>
                  {integration.default_avatar.description && (
                    <span className="text-xs text-text-muted truncate">
                      {integration.default_avatar.description}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
