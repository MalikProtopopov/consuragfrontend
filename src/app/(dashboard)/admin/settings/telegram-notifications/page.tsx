"use client";

import { AlertCircle } from "lucide-react";

import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { getApiErrorMessage } from "@/shared/lib";
import { useTelegramBotsConfig } from "@/entities/notification";

import { AdminBotCard } from "./_components/AdminBotCard";
import { UserBotCard } from "./_components/UserBotCard";

/**
 * Telegram bots settings page for SAAS_ADMIN
 */
export default function TelegramNotificationsPage() {
  const { data: config, isLoading, error, refetch } = useTelegramBotsConfig();

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Telegram-боты"
          description="Настройка ботов для уведомлений"
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ошибка загрузки конфигурации: {getApiErrorMessage(error)}
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Telegram-боты"
        description="Настройка ботов для уведомлений платформы"
      />

      <div className="space-y-6">
        <AdminBotCard
          configured={config?.admin_bot_configured ?? false}
          username={config?.admin_bot_username}
          chatIdConfigured={config?.admin_chat_id_configured ?? false}
          onRefetch={refetch}
        />

        <UserBotCard
          configured={config?.user_bot_configured ?? false}
          username={config?.user_bot_username}
          webhookConfigured={config?.webhook_configured ?? false}
          webhookUrl={config?.webhook_url}
          onRefetch={refetch}
        />
      </div>
    </PageContainer>
  );
}
