"use client";

import { Bell } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";

const notificationTypes = [
  {
    title: "Лимит 80%",
    description: "Предупреждение о достижении 80% лимита токенов",
  },
  {
    title: "Лимит 90%",
    description: "Предупреждение о достижении 90% лимита токенов",
  },
  {
    title: "Лимит исчерпан",
    description: "Уведомление об исчерпании лимита токенов",
  },
  {
    title: "Подписка истекает",
    description: "Напоминания за 7, 3 и 1 день до окончания подписки",
  },
  {
    title: "Смена тарифа",
    description: "Уведомление об изменении тарифного плана",
  },
  {
    title: "Бонусные токены",
    description: "Уведомление о начислении бонусных токенов",
  },
];

/**
 * Info card about notification types.
 */
export function NotificationTypesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Типы уведомлений</CardTitle>
        <CardDescription>
          Какие уведомления вы будете получать в Telegram
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {notificationTypes.map((type) => (
            <div
              key={type.title}
              className="flex items-start gap-3 rounded-lg border border-border p-3"
            >
              <Bell className="h-4 w-4 text-text-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-text-primary">{type.title}</p>
                <p className="text-xs text-text-muted">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
