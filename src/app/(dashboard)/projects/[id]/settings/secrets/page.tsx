"use client";

import * as React from "react";
import { use } from "react";
import { AlertCircle, Info } from "lucide-react";

import { PageContainer, PageHeader } from "@/widgets/app-shell/ui/app-shell";
import { Alert, AlertDescription } from "@/shared/ui";
import { AccessDenied, isPermissionError } from "@/shared/ui/access-denied";
import type { ProjectSecret } from "@/shared/types/api";
import { useProjectSecrets } from "@/entities/project-secret";
import { SecretsGrid, SecretConfigModal, useSecretActions } from "./_components";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Project Secrets Page (OWNER)
 */
export default function ProjectSecretsPage({ params }: PageProps) {
  const { id: projectId } = use(params);

  const { data: secretsData, isLoading, error } = useProjectSecrets(projectId);
  const actions = useSecretActions(projectId);

  // Create a map of existing secrets by key_type for quick lookup
  const secretsByType = React.useMemo(() => {
    const map = new Map<string, ProjectSecret>();
    if (secretsData?.items) {
      for (const secret of secretsData.items) {
        map.set(secret.key_type, secret);
      }
    }
    return map;
  }, [secretsData]);

  if (error) {
    const message = isPermissionError(error)
      ? "У вас нет прав для просмотра секретов этого проекта. Обратитесь к администратору для получения доступа."
      : null;

    return (
      <PageContainer>
        <PageHeader
          title="Секреты проекта"
          description="Управление токенами и API-ключами проекта"
        />
        {message ? (
          <AccessDenied message={message} backHref={`/projects/${projectId}`} />
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              Ошибка загрузки секретов. Попробуйте обновить страницу.
            </AlertDescription>
          </Alert>
        )}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Секреты проекта"
        description="Управление токенами и API-ключами проекта"
      />

      <Alert className="mb-6">
        <Info className="size-4" />
        <AlertDescription>
          API-ключи для LLM (OpenAI, Anthropic) управляются администратором платформы. Здесь вы
          можете настроить секреты для интеграций вашего проекта.
        </AlertDescription>
      </Alert>

      <SecretsGrid
        isLoading={isLoading}
        secretsByType={secretsByType}
        onEdit={actions.handleEdit}
        onCreate={actions.handleCreate}
        onDelete={actions.handleDelete}
        onValidateCard={actions.handleValidateCard}
      />

      <SecretConfigModal
        isOpen={actions.modalOpen}
        onClose={actions.closeModal}
        selectedSecret={actions.selectedSecret}
        selectedSecretType={actions.selectedSecretType}
        telegramBotUsername={actions.telegramBotUsername}
        isSaving={actions.isSaving}
        onSave={actions.handleSave}
        onValidate={actions.handleValidate}
      />
    </PageContainer>
  );
}
