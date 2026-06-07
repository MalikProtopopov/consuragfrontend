"use client";

import { Activity, Calendar, MessageSquare, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { formatDate } from "@/shared/lib";
import type { EndUserDetailResponse } from "@/shared/types/api";

interface UserStatsCardProps {
  user: EndUserDetailResponse;
}

export function UserStatsCard({ user }: UserStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Статистика</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
              <MessageSquare className="size-5 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Диалогов</p>
              <p className="font-medium text-text-primary">
                {user.stats.total_conversations}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
              <Activity className="size-5 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Сообщений</p>
              <p className="font-medium text-text-primary">
                {user.stats.total_messages}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
              <Zap className="size-5 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Токенов</p>
              <p className="font-medium text-text-primary">
                {(user.stats.total_tokens_used ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
              <Calendar className="size-5 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Дней активен</p>
              <p className="font-medium text-text-primary">
                {user.stats.days_active}
              </p>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-muted">Первый контакт</span>
            <span className="text-text-secondary">{formatDate(user.first_seen_at, "datetime")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Последняя активность</span>
            <span className="text-text-secondary">{formatDate(user.last_seen_at, "datetime")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
