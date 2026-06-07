import * as React from "react";
import { toast } from "sonner";
import { useConfirm, type ConfigFormData } from "@/shared/ui";
import {
  useCreateProjectSecret,
  useUpdateProjectSecret,
  useDeleteProjectSecret,
  useValidateTelegramToken,
} from "@/entities/project-secret";
import type {
  ProjectSecret,
  ProjectSecretType,
  TelegramValidationResult,
} from "@/shared/types/api";

export function useSecretActions(projectId: string) {
  const createMutation = useCreateProjectSecret();
  const updateMutation = useUpdateProjectSecret();
  const deleteMutation = useDeleteProjectSecret();
  const validateTelegramMutation = useValidateTelegramToken();
  const confirm = useConfirm();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedSecret, setSelectedSecret] = React.useState<ProjectSecret | null>(null);
  const [selectedSecretType, setSelectedSecretType] =
    React.useState<ProjectSecretType | null>(null);
  const [telegramBotUsername, setTelegramBotUsername] = React.useState<string | null>(null);

  const handleEdit = (secret: ProjectSecret) => {
    setSelectedSecret(secret);
    setSelectedSecretType(null);
    setModalOpen(true);
  };

  const handleCreate = (secretType: ProjectSecretType) => {
    setSelectedSecret(null);
    setSelectedSecretType(secretType);
    setTelegramBotUsername(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSecret(null);
    setSelectedSecretType(null);
    setTelegramBotUsername(null);
  };

  const handleSave = async (formData: ConfigFormData) => {
    if (selectedSecret) {
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

  const handleDelete = async (secret: ProjectSecret) => {
    const ok = await confirm({
      title: "Удалить секрет?",
      description: `Секрет «${secret.display_name}» будет удалён. Это действие нельзя отменить.`,
      confirmLabel: "Удалить",
      variant: "destructive",
    });
    if (!ok) return;

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

    if (secretType !== "telegram_bot_token") {
      return { valid: true, message: "Валидация недоступна для этого типа" };
    }

    try {
      const result: TelegramValidationResult = await validateTelegramMutation.mutateAsync({
        projectId,
        value,
      });

      if (result.valid && result.bot_username) {
        setTelegramBotUsername(result.bot_username);
        return { valid: true, message: `Бот: @${result.bot_username}` };
      }

      return result;
    } catch {
      return { valid: false, message: "Ошибка при проверке токена" };
    }
  };

  const handleValidateCard = (secret: ProjectSecret) => {
    toast.info("Откройте секрет для проверки нового значения");
    handleEdit(secret);
  };

  return {
    modalOpen,
    selectedSecret,
    selectedSecretType,
    telegramBotUsername,
    isSaving: createMutation.isPending || updateMutation.isPending,
    handleEdit,
    handleCreate,
    closeModal,
    handleSave,
    handleDelete,
    handleValidate,
    handleValidateCard,
  };
}
