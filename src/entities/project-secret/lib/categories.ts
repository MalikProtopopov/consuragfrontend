import type { ConfigCategory, ProjectSecretType } from "@/shared/types/api";

/**
 * Project secret categories for OWNER
 */
export const PROJECT_SECRET_CATEGORIES: ConfigCategory[] = [
  {
    id: "telegram",
    name: "Telegram",
    icon: "📱",
    keys: ["telegram_bot_token"],
  },
  {
    id: "webhooks",
    name: "Webhooks",
    icon: "🔗",
    keys: ["webhook_secret"],
  },
  {
    id: "custom",
    name: "Custom",
    icon: "🔑",
    keys: ["custom_api_key"],
  },
];

/**
 * Project secret type display names
 */
export const PROJECT_SECRET_LABELS: Record<ProjectSecretType, string> = {
  telegram_bot_token: "Telegram Bot Token",
  webhook_secret: "Webhook Secret",
  custom_api_key: "Custom API Key",
};

/**
 * Project secret type descriptions
 */
export const PROJECT_SECRET_DESCRIPTIONS: Record<ProjectSecretType, string> = {
  telegram_bot_token: "Токен бота от @BotFather для Telegram интеграции",
  webhook_secret: "Секретный ключ для верификации webhook запросов",
  custom_api_key: "Кастомный API ключ для внешних интеграций",
};

/**
 * Project secret type placeholders
 */
export const PROJECT_SECRET_PLACEHOLDERS: Record<ProjectSecretType, string> = {
  telegram_bot_token: "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",
  webhook_secret: "whsec_...",
  custom_api_key: "Введите API ключ",
};

/**
 * Get category by secret type
 */
export function getCategoryBySecretType(
  secretType: ProjectSecretType
): ConfigCategory | undefined {
  return PROJECT_SECRET_CATEGORIES.find((cat) => cat.keys.includes(secretType));
}

/**
 * Get all project secret types
 */
export function getAllProjectSecretTypes(): ProjectSecretType[] {
  return PROJECT_SECRET_CATEGORIES.flatMap(
    (cat) => cat.keys
  ) as ProjectSecretType[];
}

