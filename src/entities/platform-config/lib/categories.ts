import type { ConfigCategory, PlatformKeyType } from "@/shared/types/api";

/**
 * Platform configuration categories for SAAS_ADMIN
 */
export const PLATFORM_CONFIG_CATEGORIES: ConfigCategory[] = [
  {
    id: "llm",
    name: "LLM Providers",
    icon: "🤖",
    keys: ["openai_api_key", "anthropic_api_key"],
  },
  {
    id: "monitoring",
    name: "Monitoring",
    icon: "📊",
    keys: ["langsmith_api_key", "sentry_dsn"],
  },
  {
    id: "email",
    name: "Email",
    icon: "📧",
    keys: ["smtp_password"],
  },
];

/**
 * Platform key type display names
 */
export const PLATFORM_KEY_LABELS: Record<PlatformKeyType, string> = {
  openai_api_key: "OpenAI API Key",
  anthropic_api_key: "Anthropic API Key",
  langsmith_api_key: "LangSmith API Key",
  sentry_dsn: "Sentry DSN",
  smtp_password: "SMTP Password",
};

/**
 * Platform key type descriptions
 */
export const PLATFORM_KEY_DESCRIPTIONS: Record<PlatformKeyType, string> = {
  openai_api_key: "Основной ключ для LLM запросов (GPT-4, GPT-3.5)",
  anthropic_api_key: "Ключ для моделей Claude от Anthropic",
  langsmith_api_key: "Ключ для трассировки и мониторинга LangSmith",
  sentry_dsn: "DSN для отслеживания ошибок в Sentry",
  smtp_password: "Пароль для отправки email через SMTP",
};

/**
 * Platform key type placeholders
 */
export const PLATFORM_KEY_PLACEHOLDERS: Record<PlatformKeyType, string> = {
  openai_api_key: "sk-proj-...",
  anthropic_api_key: "sk-ant-...",
  langsmith_api_key: "ls-...",
  sentry_dsn: "https://...@sentry.io/...",
  smtp_password: "Введите пароль SMTP",
};

/**
 * Get category by key type
 */
export function getCategoryByKeyType(keyType: PlatformKeyType): ConfigCategory | undefined {
  return PLATFORM_CONFIG_CATEGORIES.find((cat) =>
    cat.keys.includes(keyType)
  );
}

/**
 * Get all platform key types
 */
export function getAllPlatformKeyTypes(): PlatformKeyType[] {
  return PLATFORM_CONFIG_CATEGORIES.flatMap((cat) => cat.keys) as PlatformKeyType[];
}

