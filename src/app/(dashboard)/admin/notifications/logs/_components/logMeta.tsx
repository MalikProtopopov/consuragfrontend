import { Check, X, Clock } from "lucide-react";

import type { NotificationStatus } from "@/shared/types/api";

/**
 * Notification type labels (shared by table rows and details modal).
 */
export const notificationTypeLabels: Record<string, string> = {
  // User notifications
  limit_warning_80: "Лимит 80%",
  limit_warning_90: "Лимит 90%",
  limit_exceeded: "Лимит исчерпан",
  subscription_expiring_7d: "Подписка истекает (7д)",
  subscription_expiring_3d: "Подписка истекает (3д)",
  subscription_expiring_1d: "Подписка истекает (1д)",
  subscription_expired: "Подписка истекла",
  plan_changed: "Тариф изменён",
  bonus_tokens_added: "Бонусные токены",
  // Admin notifications
  new_plan_request: "Новая заявка",
  new_user_registered: "Новый пользователь",
  user_limit_exceeded: "Лимит пользователя",
  daily_report: "Ежедневный отчёт",
  weekly_report: "Еженедельный отчёт",
};

/**
 * Status → label/variant/icon config.
 */
export const statusConfig: Record<
  NotificationStatus,
  { label: string; variant: "success" | "destructive" | "secondary"; icon: typeof Check }
> = {
  sent: { label: "Отправлено", variant: "success", icon: Check },
  failed: { label: "Ошибка", variant: "destructive", icon: X },
  pending: { label: "Ожидание", variant: "secondary", icon: Clock },
};
