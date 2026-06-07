"use client";

import Link from "next/link";
import { BarChart3, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { ROUTES } from "@/shared/config";

interface TelegramNavCardsProps {
  projectId: string;
}

export function TelegramNavCards({ projectId }: TelegramNavCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 mb-6">
      <Link href={ROUTES.TELEGRAM_STATS(projectId)}>
        <Card className="hover:border-accent-primary transition-colors cursor-pointer h-full">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent-primary/10">
                <BarChart3 className="size-5 text-accent-primary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Статистика</p>
                <p className="text-sm text-text-muted">Просмотр метрик и событий</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
      <Link href={ROUTES.TELEGRAM_SESSIONS(projectId)}>
        <Card className="hover:border-accent-primary transition-colors cursor-pointer h-full">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent-primary/10">
                <MessageSquare className="size-5 text-accent-primary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Сессии</p>
                <p className="text-sm text-text-muted">История чатов пользователей</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
