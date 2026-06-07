"use client";

import { Send } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";

/**
 * Card shown when Telegram is not linked.
 */
export function TelegramNotLinkedCard({ onLink }: { onLink: () => void }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10">
            <Send className="h-5 w-5 text-accent-primary" />
          </div>
          <div>
            <CardTitle>Telegram-уведомления</CardTitle>
            <CardDescription>Получайте важные уведомления в Telegram</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-text-secondary space-y-2">
          <p>Вы будете получать уведомления о:</p>
          <ul className="list-disc list-inside space-y-1 text-text-muted">
            <li>Достижении лимитов токенов (80%, 90%, 100%)</li>
            <li>Окончании подписки</li>
            <li>Изменении тарифа</li>
            <li>Начислении бонусов</li>
          </ul>
        </div>
        <Button onClick={onLink}>
          <Send className="mr-2 h-4 w-4" />
          Привязать Telegram
        </Button>
      </CardContent>
    </Card>
  );
}
