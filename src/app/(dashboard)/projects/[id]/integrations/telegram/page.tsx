"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProject } from "@/entities/project";
import {
  useTelegramIntegration,
  useSetTelegramWebhook,
  useDeleteTelegramWebhook,
  WebhookConfigError,
} from "@/entities/telegram";
import { useAvatars } from "@/entities/avatar";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import { AccessDenied, isPermissionError } from "@/shared/ui/access-denied";
import { TelegramStatusCard, TelegramNavCards, TelegramSetupForm } from "./_components";

interface TelegramPageProps {
  params: Promise<{ id: string }>;
}

export default function TelegramPage({ params }: TelegramPageProps) {
  const { id: projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: integration, isLoading: integrationLoading, error: integrationError } = useTelegramIntegration(projectId);
  const { data: avatarsData } = useAvatars(projectId);

  const { mutate: setWebhook, isPending: settingWebhook } = useSetTelegramWebhook();
  const { mutate: deleteWebhook, isPending: deletingWebhook } = useDeleteTelegramWebhook();

  const hasIntegration = !!integration && !integrationError;
  const avatars = avatarsData?.items || [];

  const handleSetWebhook = () => {
    setWebhook(projectId, {
      onSuccess: () => toast.success("Webhook успешно установлен!"),
      onError: (error) => {
        // Handle specific webhook configuration error
        if (error instanceof WebhookConfigError) {
          toast.error(error.message);
          return;
        }
        // Handle other API errors
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  const handleDeleteWebhook = () => {
    deleteWebhook(projectId, {
      onSuccess: () => toast.success("Webhook удален"),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  const isLoading = projectLoading || integrationLoading;

  // Handle permission error for telegram integration
  if (integrationError && isPermissionError(integrationError)) {
    return (
      <PageContainer>
        <PageHeader
          title="Telegram интеграция"
          description="Подключите бота Telegram к вашему AI-аватару"
        />
        <AccessDenied
          message="У вас нет прав для просмотра настроек Telegram интеграции. Обратитесь к администратору для получения доступа."
          backHref={`/projects/${projectId}`}
        />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[400px]" />
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-text-secondary">Проект не найден</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К проекту
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Telegram интеграция"
        description="Подключите бота Telegram к вашему AI-аватару"
      />

      {/* Avatar Warning */}
      {hasIntegration && !integration.default_avatar_id && (
        <Alert className="mb-6 border-warning bg-warning/10">
          <AlertDescription className="text-warning">
            <strong>Аватар не выбран!</strong> Бот не сможет отвечать на сообщения пока не будет выбран аватар.
            Выберите аватар в настройках ниже.
          </AlertDescription>
        </Alert>
      )}

      {hasIntegration && (
        <TelegramStatusCard
          integration={integration}
          onSetWebhook={handleSetWebhook}
          onDeleteWebhook={handleDeleteWebhook}
          settingWebhook={settingWebhook}
          deletingWebhook={deletingWebhook}
        />
      )}

      {hasIntegration && <TelegramNavCards projectId={projectId} />}

      <TelegramSetupForm
        key={integration?.id ?? "new"}
        projectId={projectId}
        integration={hasIntegration ? integration : undefined}
        avatars={avatars}
      />
    </PageContainer>
  );
}
