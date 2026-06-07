import { ConfigModal, type ConfigFormData } from "@/shared/ui";
import {
  PROJECT_SECRET_LABELS,
  PROJECT_SECRET_DESCRIPTIONS,
  PROJECT_SECRET_PLACEHOLDERS,
} from "@/entities/project-secret";
import type { ProjectSecret, ProjectSecretType } from "@/shared/types/api";

interface SecretConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSecret: ProjectSecret | null;
  selectedSecretType: ProjectSecretType | null;
  telegramBotUsername: string | null;
  isSaving: boolean;
  onSave: (formData: ConfigFormData) => Promise<void>;
  onValidate: (value: string) => Promise<{ valid: boolean; message?: string }>;
}

export function SecretConfigModal({
  isOpen,
  onClose,
  selectedSecret,
  selectedSecretType,
  telegramBotUsername,
  isSaving,
  onSave,
  onValidate,
}: SecretConfigModalProps) {
  const isTelegram =
    selectedSecret?.key_type === "telegram_bot_token" ||
    selectedSecretType === "telegram_bot_token";

  return (
    <ConfigModal
      isOpen={isOpen}
      onClose={onClose}
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
        selectedSecretType ? PROJECT_SECRET_LABELS[selectedSecretType] : undefined
      }
      defaultDescription={
        selectedSecretType ? PROJECT_SECRET_DESCRIPTIONS[selectedSecretType] : undefined
      }
      placeholder={
        selectedSecret
          ? PROJECT_SECRET_PLACEHOLDERS[selectedSecret.key_type]
          : selectedSecretType
          ? PROJECT_SECRET_PLACEHOLDERS[selectedSecretType]
          : undefined
      }
      onSave={onSave}
      onValidate={isTelegram ? onValidate : undefined}
      isSaving={isSaving}
      showValidation={isTelegram}
    />
  );
}
