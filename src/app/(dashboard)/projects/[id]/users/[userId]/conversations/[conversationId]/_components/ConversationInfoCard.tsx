"use client";

import { Calendar, MessageSquare, Zap, Clock, StopCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { ConversationStatusBadge } from "@/shared/ui/status-badge";
import { formatDate, formatRelativeTime } from "@/shared/lib";
import type { Conversation } from "@/shared/types/api";

export function ConversationInfoCard({
  conversation,
  isEnding,
  onEnd,
}: {
  conversation: Conversation;
  isEnding: boolean;
  onEnd: () => void;
}) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Информация о диалоге</CardTitle>
            <CardDescription>Статистика и метаданные</CardDescription>
          </div>
          {conversation.status === "active" && (
            <Button variant="outline" onClick={onEnd} disabled={isEnding}>
              <StopCircle className="mr-2 h-4 w-4" />
              Завершить диалог
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
              <ConversationStatusBadge status={conversation.status} className="px-3" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Статус</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
              <MessageSquare className="size-5 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Сообщений</p>
              <p className="font-medium text-text-primary">{conversation.messages_count}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
              <Zap className="size-5 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Токенов</p>
              <p className="font-medium text-text-primary">
                {(conversation.total_tokens ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
              <Calendar className="size-5 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Начат</p>
              <p className="font-medium text-text-primary">
                {formatDate(conversation.started_at, "datetime")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-bg-hover">
              <Clock className="size-5 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Последняя активность</p>
              <p className="font-medium text-text-primary">
                {formatRelativeTime(conversation.last_activity_at)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
