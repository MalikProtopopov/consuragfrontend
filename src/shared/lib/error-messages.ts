/**
 * API error code translations (Russian)
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: "Неверный email или пароль",
  AUTH_USER_EXISTS: "Пользователь с таким email уже существует",
  AUTH_USER_INACTIVE: "Аккаунт деактивирован",
  AUTH_USER_NOT_FOUND: "Пользователь не найден",
  AUTH_USER_SUSPENDED: "Аккаунт заблокирован",
  AUTH_USER_PENDING: "Аккаунт ожидает активации",
  AUTH_INVALID_TOKEN: "Недействительный токен",
  AUTH_TOKEN_EXPIRED: "Токен истёк",
  AUTH_INVALID_REFRESH_TOKEN: "Недействительный refresh токен",
  AUTH_EMAIL_NOT_VERIFIED: "Email не подтверждён",
  AUTH_WEAK_PASSWORD: "Пароль слишком простой",
  AUTH_WRONG_PASSWORD: "Неверный текущий пароль",
  AUTH_PASSWORD_MISMATCH: "Неверный текущий пароль",

  // Validation errors
  VALIDATION_ERROR: "Ошибка валидации",
  VALIDATION_REQUIRED: "Поле обязательно для заполнения",
  VALIDATION_EMAIL: "Некорректный email",
  VALIDATION_MIN_LENGTH: "Минимальная длина не соблюдена",
  VALIDATION_MAX_LENGTH: "Максимальная длина превышена",
  VALIDATION_PATTERN: "Неверный формат",

  // Project errors
  PROJECT_NOT_FOUND: "Проект не найден",
  PROJECT_SLUG_EXISTS: "Проект с таким URL уже существует",
  PROJECT_ACCESS_DENIED: "Нет доступа к проекту",
  PROJECT_OWNER_CANNOT_LEAVE: "Владелец не может покинуть проект",
  PROJECT_MEMBER_EXISTS: "Участник уже добавлен",
  PROJECT_MEMBER_NOT_FOUND: "Участник не найден",

  // Member errors
  MEMBER_USER_NOT_FOUND: "Пользователь не найден. Он должен сначала зарегистрироваться в системе",
  MEMBER_INSUFFICIENT_PERMISSIONS: "Недостаточно прав доступа. Обратитесь к администратору проекта",

  // Avatar errors
  AVATAR_NOT_FOUND: "Аватар не найден",
  AVATAR_ACCESS_DENIED: "Нет доступа к аватару",
  AVATAR_NOT_PUBLISHED: "Аватар не опубликован",
  AVATAR_ALREADY_PUBLISHED: "Аватар уже опубликован",
  AVATAR_NO_DOCUMENTS: "У аватара нет документов",

  // Document errors
  DOC_NOT_FOUND: "Документ не найден",
  DOC_ACCESS_DENIED: "Нет доступа к документу",
  DOC_UNSUPPORTED_TYPE: "Неподдерживаемый формат файла",
  DOC_TOO_LARGE: "Файл слишком большой",
  DOC_PROCESSING: "Документ ещё обрабатывается",
  DOC_FAILED: "Ошибка обработки документа",
  DOC_UPLOAD_FAILED: "Ошибка загрузки файла",

  // Chat errors
  CHAT_SESSION_NOT_FOUND: "Сессия чата не найдена",
  CHAT_SESSION_CLOSED: "Сессия чата закрыта",
  CHAT_MESSAGE_NOT_FOUND: "Сообщение не найдено",
  CHAT_RATE_LIMITED: "Слишком много запросов, подождите",
  CHAT_AVATAR_NOT_READY: "Аватар не готов к работе",

  // Telegram errors
  TELEGRAM_INTEGRATION_NOT_FOUND: "Telegram интеграция не найдена",
  TELEGRAM_INTEGRATION_EXISTS: "Telegram интеграция уже существует",
  TELEGRAM_INVALID_TOKEN: "Неверный токен бота",
  TELEGRAM_WEBHOOK_FAILED: "Ошибка установки webhook",
  TELEGRAM_BOT_NOT_FOUND: "Бот не найден",

  // Config/Secrets errors
  CONFIG_NOT_FOUND: "Конфигурация не найдена",
  CONFIG_ALREADY_EXISTS: "Конфигурация с таким ключом уже существует",
  CONFIG_INVALID_KEY_TYPE: "Неверный тип ключа",
  CONFIG_ENCRYPTION_ERROR: "Ошибка шифрования. Попробуйте ещё раз",
  CONFIG_KEY_VALIDATION_FAILED: "Ключ недействителен. Проверьте правильность",
  CONFIG_ACCESS_DENIED: "У вас нет доступа к этой конфигурации",
  CONFIG_KEY_TYPE_NOT_ALLOWED: "Вы не можете управлять этим типом ключей",

  // Permission errors
  PERMISSION_DENIED: "Недостаточно прав",
  PERMISSION_REQUIRED: "Требуется разрешение",

  // Generic errors
  UNKNOWN_ERROR: "Произошла неизвестная ошибка",
  NETWORK_ERROR: "Ошибка сети",
  SERVER_ERROR: "Ошибка сервера",
  NOT_FOUND: "Ресурс не найден",
  RATE_LIMITED: "Слишком много запросов",
};

/**
 * Get translated error message by code
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN_ERROR ?? "Произошла ошибка";
}

/**
 * API error structure from backend
 */
interface ApiErrorResponse {
  code?: string;
  message?: string;
  field?: string;
  error?: {
    code?: string;
    message?: string;
    field?: string;
  };
}

/**
 * Get error message from API error response
 */
export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const apiError = error as ApiErrorResponse;
    
    // Handle nested error structure: { error: { code: ... } }
    if (apiError.error?.code) {
      return getErrorMessage(apiError.error.code);
    }
    
    // Handle flat structure: { code: ... }
    if (apiError.code) {
      return getErrorMessage(apiError.code);
  }
    
    // Fallback to message if available
    if (apiError.error?.message) {
      return apiError.error.message;
    }
    if (apiError.message) {
      return apiError.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return getErrorMessage("UNKNOWN_ERROR");
}

/**
 * Get field name from API error response (for form field errors)
 */
export function getApiErrorField(error: unknown): string | undefined {
  if (error && typeof error === "object") {
    const apiError = error as ApiErrorResponse;
    return apiError.error?.field ?? apiError.field;
  }
  return undefined;
}

