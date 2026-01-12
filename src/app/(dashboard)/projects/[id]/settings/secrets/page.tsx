"use client";

import * as React from "react";
import { use } from "react";
import { Send, Link2, Key, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

import { PageContainer, PageHeader } from "@/widgets/app-shell/ui/app-shell";
import {
  ConfigCard,
  ConfigModal,
  Alert,
  AlertDescription,
  Skeleton,
  type ConfigFormData,
} from "@/shared/ui";
import { AccessDenied, isPermissionError } from "@/shared/ui/access-denied";
import type {
  ProjectSecret,
  ProjectSecretType,
  TelegramValidationResult,
} from "@/shared/types/api";
import {
  useProjectSecrets,
  useCreateProjectSecret,
  useUpdateProjectSecret,
  useDeleteProjectSecret,
  useValidateTelegramToken,
  PROJECT_SECRET_CATEGORIES,
  PROJECT_SECRET_LABELS,
  PROJECT_SECRET_DESCRIPTIONS,
  PROJECT_SECRET_PLACEHOLDERS,
} from "@/entities/project-secret";

/**
 * Category icons mapping
 */
const categoryIcons: Record<string, React.ElementType> = {
  telegram: Send,
  webhooks: Link2,
  custom: Key,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Project Secrets Page (OWNER)
 */
export default function ProjectSecretsPage({ params }: PageProps) {
  const { id: projectId } = use(params);

  const { data: secretsData, isLoading, error } = useProjectSecrets(projectId);

  const createMutation = useCreateProjectSecret();
  const updateMutation = useUpdateProjectSecret();
  const deleteMutation = useDeleteProjectSecret();
  const validateTelegramMutation = useValidateTelegramToken();

  // Modal state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedSecret, setSelectedSecret] =
    React.useState<ProjectSecret | null>(null);
  const [selectedSecretType, setSelectedSecretType] =
    React.useState<ProjectSecretType | null>(null);
  const [telegramBotUsername, setTelegramBotUsername] = React.useState<
    string | null
  >(null);

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

  // Handle opening modal for edit
  const handleEdit = (secret: ProjectSecret) => {
    setSelectedSecret(secret);
    setSelectedSecretType(null);
    setModalOpen(true);
  };

  // Handle opening modal for create
  const handleCreate = (secretType: ProjectSecretType) => {
    setSelectedSecret(null);
    setSelectedSecretType(secretType);
    setTelegramBotUsername(null);
    setModalOpen(true);
  };

  // Handle save (create or update)
  const handleSave = async (formData: ConfigFormData) => {
    const isEditing = !!selectedSecret;

    if (isEditing) {
      // Update existing secret
      await updateMutation.mutateAsync({
        projectId,
        key: selectedSecret.key,
        data: {
          value: formData.value || undefined,
          display_name: formData.display_name,
          description: formData.description || undefined,
          is_active: formData.is_active,
        },
      });
      toast.success("Секрет обновлён");
    } else if (selectedSecretType) {
      // Create new secret
      await createMutation.mutateAsync({
        projectId,
        data: {
          key: selectedSecretType,
          value: formData.value,
          key_type: selectedSecretType,
          display_name: formData.display_name,
          description: formData.description || undefined,
          is_active: formData.is_active,
        },
      });
      toast.success("Секрет создан");
    }
  };

  // Handle delete
  const handleDelete = async (secret: ProjectSecret) => {
    if (!confirm(`Удалить секрет "${secret.display_name}"?`)) return;

    try {
      await deleteMutation.mutateAsync({ projectId, key: secret.key });
      toast.success("Секрет удалён");
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  // Handle validation (only for telegram tokens)
  const handleValidate = async (
    value: string
  ): Promise<{ valid: boolean; message?: string }> => {
    const secretType = selectedSecret?.key_type ?? selectedSecretType;

    // Only telegram tokens can be validated
    if (secretType !== "telegram_bot_token") {
      return { valid: true, message: "Валидация недоступна для этого типа" };
    }

    try {
      const result: TelegramValidationResult =
        await validateTelegramMutation.mutateAsync({
          projectId,
          value,
        });

      if (result.valid && result.bot_username) {
        setTelegramBotUsername(result.bot_username);
        return {
          valid: true,
          message: `Бот: @${result.bot_username}`,
        };
      }

      return result;
    } catch {
      return { valid: false, message: "Ошибка при проверке токена" };
    }
  };

  // Handle validate from card
  const handleValidateCard = async (secret: ProjectSecret) => {
    toast.info("Откройте секрет для проверки нового значения");
    handleEdit(secret);
  };

  if (error) {
    // Handle permission error
    if (isPermissionError(error)) {
      return (
        <PageContainer>
          <PageHeader
            title="Секреты проекта"
            description="Управление токенами и API-ключами проекта"
          />
          <AccessDenied
            message="У вас нет прав для просмотра секретов этого проекта. Обратитесь к администратору для получения доступа."
            backHref={`/projects/${projectId}`}
          />
        </PageContainer>
      );
    }

    return (
      <PageContainer>
        <PageHeader
          title="Секреты проекта"
          description="Управление токенами и API-ключами проекта"
        />
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            Ошибка загрузки секретов. Попробуйте обновить страницу.
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Секреты проекта"
        description="Управление токенами и API-ключами проекта"
      />

      {/* Info Alert */}
      <Alert className="mb-6">
        <Info className="size-4" />
        <AlertDescription>
          API-ключи для LLM (OpenAI, Anthropic) управляются администратором
          платформы. Здесь вы можете настроить секреты для интеграций вашего
          проекта.
        </AlertDescription>
      </Alert>

      <div className="space-y-8">
        {PROJECT_SECRET_CATEGORIES.map((category) => {
          const Icon = categoryIcons[category.id] ?? Key;

          return (
            <section key={category.id}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-4">
                <Icon className="size-5 text-text-secondary" />
                <h2 className="text-lg font-medium text-text-primary">
                  {category.name}
                </h2>
              </div>

              {/* Secret Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-32" />
                  </>
                ) : (
                  category.keys.map((keyType) => {
                    const secret = secretsByType.get(keyType);
                    const label =
                      PROJECT_SECRET_LABELS[keyType as ProjectSecretType];
                    const description =
                      PROJECT_SECRET_DESCRIPTIONS[keyType as ProjectSecretType];
                    const showValidate = keyType === "telegram_bot_token";

                    if (secret) {
                      return (
                        <ConfigCard
                          key={keyType}
                          keyType={keyType}
                          displayName={secret.display_name}
                          description={secret.description ?? description}
                          maskedValue={secret.masked_value}
                          isSet={secret.is_set}
                          isActive={secret.is_active}
                          updatedAt={secret.updated_at}
                          onEdit={() => handleEdit(secret)}
                          onDelete={() => handleDelete(secret)}
                          onValidate={
                            showValidate
                              ? () => handleValidateCard(secret)
                              : undefined
                          }
                          showValidate={showValidate}
                        />
                      );
                    }

                    // Not configured yet - show placeholder card
                    return (
                      <ConfigCard
                        key={keyType}
                        keyType={keyType}
                        displayName={label}
                        description={description}
                        isSet={false}
                        isActive={false}
                        onEdit={() => handleCreate(keyType as ProjectSecretType)}
                      />
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Config Modal */}
      <ConfigModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSecret(null);
          setSelectedSecretType(null);
          setTelegramBotUsername(null);
        }}
        title={
          selectedSecret
            ? `Редактировать: ${selectedSecret.display_name}`
            : selectedSecretType
            ? `Добавить: ${PROJECT_SECRET_LABELS[selectedSecretType]}`
            : "Добавить секрет"
        }
        description={
          selectedSecretType
            ? PROJECT_SECRET_DESCRIPTIONS[selectedSecretType]
            : telegramBotUsername
            ? `Подключен бот: @${telegramBotUsername}`
            : undefined
        }
        existingConfig={
          selectedSecret
            ? {
                key: selectedSecret.key,
                display_name: selectedSecret.display_name,
                description: selectedSecret.description,
                masked_value: selectedSecret.masked_value,
                is_active: selectedSecret.is_active,
              }
            : null
        }
        keyType={selectedSecretType ?? undefined}
        defaultDisplayName={
          selectedSecretType
            ? PROJECT_SECRET_LABELS[selectedSecretType]
            : undefined
        }
        defaultDescription={
          selectedSecretType
            ? PROJECT_SECRET_DESCRIPTIONS[selectedSecretType]
            : undefined
        }
        placeholder={
          selectedSecret
            ? PROJECT_SECRET_PLACEHOLDERS[selectedSecret.key_type]
            : selectedSecretType
            ? PROJECT_SECRET_PLACEHOLDERS[selectedSecretType]
            : undefined
        }
        onSave={handleSave}
        onValidate={
          (selectedSecret?.key_type === "telegram_bot_token" ||
            selectedSecretType === "telegram_bot_token")
            ? handleValidate
            : undefined
        }
        isSaving={createMutation.isPending || updateMutation.isPending}
        showValidation={
          selectedSecret?.key_type === "telegram_bot_token" ||
          selectedSecretType === "telegram_bot_token"
        }
      />
    </PageContainer>
  );
}

