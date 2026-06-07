"use client";

import { useState, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { getApiErrorMessage } from "@/shared/lib";
import { useTelegramStatus } from "@/entities/notification";

import { TelegramNotLinkedCard } from "./_components/TelegramNotLinkedCard";
import { TelegramLinkedCard } from "./_components/TelegramLinkedCard";
import { NotificationTypesCard } from "./_components/NotificationTypesCard";
import { LinkTelegramModal } from "./_components/LinkTelegramModal";

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
