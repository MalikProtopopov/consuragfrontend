"use client";

import * as React from "react";
import { Bot, LineChart, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { PageContainer, PageHeader } from "@/widgets/app-shell/ui/app-shell";
import { ConfigCard, ConfigModal, Alert, AlertDescription, Skeleton, type ConfigFormData } from "@/shared/ui";
import type { PlatformConfig, PlatformKeyType } from "@/shared/types/api";
import {
  usePlatformConfigs,
  useCreatePlatformConfig,
  useUpdatePlatformConfig,
  useDeletePlatformConfig,
  useValidatePlatformKey,
  PLATFORM_CONFIG_CATEGORIES,
  PLATFORM_KEY_LABELS,
  PLATFORM_KEY_DESCRIPTIONS,
  PLATFORM_KEY_PLACEHOLDERS,
} from "@/entities/platform-config";

/**
 * Category icons mapping
 */
const categoryIcons: Record<string, React.ElementType> = {
  llm: Bot,
  monitoring: LineChart,
  email: Mail,
};

/**
 * Platform Settings Page (SAAS_ADMIN)
 * 
 * Uses POST for creating new configs (requires value).
 * Uses PUT for updating existing configs (value is optional).
 */
export default function PlatformSettingsPage() {
  const { data: configsData, isLoading, error } = usePlatformConfigs();

  // POST for creating new configs (requires value)
  const createMutation = useCreatePlatformConfig();
  // PUT for updating existing configs (value is optional)
  const updateMutation = useUpdatePlatformConfig();
  const deleteMutation = useDeletePlatformConfig();
  const validateMutation = useValidatePlatformKey();

  // Modal state
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedKeyType, setSelectedKeyType] = React.useState<PlatformKeyType | null>(null);

  // Create a map of existing configs by key_type for quick lookup
  const configsByType = React.useMemo(() => {
    const map = new Map<string, PlatformConfig>();
    if (configsData?.items) {
      for (const config of configsData.items) {
        map.set(config.key_type, config);
      }
    }
    return map;
  }, [configsData]);

  // Handle opening modal for any key type (both create and edit use same flow)
  const handleOpenModal = React.useCallback((keyType: PlatformKeyType) => {
    setSelectedKeyType(keyType);
    setModalOpen(true);
  }, []);

  // Handle close modal
  const handleCloseModal = React.useCallback(() => {
    setModalOpen(false);
    setSelectedKeyType(null);
  }, []);

  // Get existing config for selected key type
  const existingConfig = React.useMemo(() => {
    if (!selectedKeyType) return null;
    const config = configsByType.get(selectedKeyType);
    if (!config) return null;
    return {
      key: config.key,
      display_name: config.display_name,
      description: config.description,
      masked_value: config.masked_value,
      is_active: config.is_active,
    };
  }, [selectedKeyType, configsByType]);

  // Handle save - uses POST for create, PUT for update
  const handleSave = React.useCallback(async (formData: ConfigFormData) => {
    if (!selectedKeyType) return;

    const existingConfigForKey = configsByType.get(selectedKeyType);

    if (existingConfigForKey) {
      // UPDATE existing config with PUT (value is optional)
      await updateMutation.mutateAsync({
        key: existingConfigForKey.key,
        data: {
          // Only send value if it was changed (not empty)
          value: formData.value.trim() || undefined,
          display_name: formData.display_name,
          description: formData.description || undefined,
          is_active: formData.is_active,
        },
      });
      toast.success("Конфигурация обновлена");
    } else {
      // CREATE new config with POST (value is required)
      if (!formData.value.trim()) {
        throw new Error("Значение обязательно для создания новой конфигурации");
      }
      await createMutation.mutateAsync({
        key: selectedKeyType,
        value: formData.value,
        key_type: selectedKeyType,
        display_name: formData.display_name,
        description: formData.description || undefined,
        is_active: formData.is_active,
      });
      toast.success("Конфигурация создана");
    }
  }, [selectedKeyType, configsByType, createMutation, updateMutation]);

  // Handle delete
  const handleDelete = React.useCallback(async (config: PlatformConfig) => {
    if (!confirm(`Удалить конфигурацию "${config.display_name}"?`)) return;

    try {
      await deleteMutation.mutateAsync(config.key);
      toast.success("Конфигурация удалена");
    } catch {
      toast.error("Ошибка при удалении");
    }
  }, [deleteMutation]);

  // Handle validation
  const handleValidate = React.useCallback(async (value: string): Promise<{ valid: boolean; message?: string }> => {
    if (!selectedKeyType) return { valid: false, message: "Неизвестный тип ключа" };

    try {
      const result = await validateMutation.mutateAsync({ key: selectedKeyType, value });
      return result;
    } catch {
      return { valid: false, message: "Ошибка при проверке ключа" };
    }
  }, [selectedKeyType, validateMutation]);

  // Handle validate from card - open modal to enter new value and validate
  const handleValidateCard = React.useCallback((config: PlatformConfig) => {
    toast.info("Откройте конфигурацию для проверки нового значения");
    handleOpenModal(config.key_type as PlatformKeyType);
  }, [handleOpenModal]);

  if (error) {
    return (
      <PageContainer>
        <PageHeader
          title="Настройки платформы"
          description="Управление API-ключами и секретами платформы"
        />
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>
            Ошибка загрузки конфигураций. Попробуйте обновить страницу.
          </AlertDescription>
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Настройки платформы"
        description="Управление API-ключами и секретами платформы"
      />

      <div className="space-y-8">
        {PLATFORM_CONFIG_CATEGORIES.map((category) => {
          const Icon = categoryIcons[category.id] ?? Bot;

          return (
            <section key={category.id}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-4">
                <Icon className="size-5 text-text-secondary" />
                <h2 className="text-lg font-medium text-text-primary">
                  {category.name}
                </h2>
              </div>

              {/* Config Cards */}
              <div className="grid gap-4 md:grid-cols-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                  </>
                ) : (
                  category.keys.map((keyType) => {
                    const config = configsByType.get(keyType);
                    const label = PLATFORM_KEY_LABELS[keyType as PlatformKeyType];
                    const keyDescription = PLATFORM_KEY_DESCRIPTIONS[keyType as PlatformKeyType];

                    if (config) {
                      return (
                        <ConfigCard
                          key={keyType}
                          keyType={keyType}
                          displayName={config.display_name}
                          description={config.description ?? keyDescription}
                          maskedValue={config.masked_value}
                          isSet={config.is_set}
                          isActive={config.is_active}
                          updatedAt={config.updated_at}
                          onEdit={() => handleOpenModal(keyType as PlatformKeyType)}
                          onDelete={() => handleDelete(config)}
                          onValidate={() => handleValidateCard(config)}
                          showValidate={true}
                        />
                      );
                    }

                    // Not configured yet - show placeholder card
                    return (
                      <ConfigCard
                        key={keyType}
                        keyType={keyType}
                        displayName={label}
                        description={keyDescription}
                        isSet={false}
                        isActive={false}
                        onEdit={() => handleOpenModal(keyType as PlatformKeyType)}
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
        onClose={handleCloseModal}
        title={
          existingConfig
            ? `Редактировать: ${existingConfig.display_name}`
            : selectedKeyType
            ? `Добавить: ${PLATFORM_KEY_LABELS[selectedKeyType]}`
            : "Добавить конфигурацию"
        }
        description={
          selectedKeyType
            ? PLATFORM_KEY_DESCRIPTIONS[selectedKeyType]
            : undefined
        }
        existingConfig={existingConfig}
        keyType={selectedKeyType ?? undefined}
        defaultDisplayName={
          selectedKeyType ? PLATFORM_KEY_LABELS[selectedKeyType] : undefined
        }
        defaultDescription={
          selectedKeyType ? PLATFORM_KEY_DESCRIPTIONS[selectedKeyType] : undefined
        }
        placeholder={
          selectedKeyType
            ? PLATFORM_KEY_PLACEHOLDERS[selectedKeyType]
            : undefined
        }
        onSave={handleSave}
        onValidate={handleValidate}
        isSaving={createMutation.isPending || updateMutation.isPending}
        showValidation={true}
      />
    </PageContainer>
  );
}

