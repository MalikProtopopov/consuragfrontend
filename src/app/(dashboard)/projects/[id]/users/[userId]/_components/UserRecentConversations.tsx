"use client";

import Link from "next/link";
import { Clock, MessageSquare, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { ConversationStatusBadge } from "@/shared/ui/status-badge";
import { ROUTES } from "@/shared/config";
import { formatRelativeTime } from "@/shared/lib";
import type { Conversation } from "@/shared/types/api";

interface UserRecentConversationsProps {
  projectId: string;
  endUserId: string;
  conversations: Conversation[];
}

export function UserRecentConversations({
  projectId,
  endUserId,
  conversations,
}: UserRecentConversationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние диалоги</CardTitle>
        <CardDescription>История общения с AI-аватарами</CardDescription>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="text-center py-6">
            <MessageSquare className="mx-auto h-10 w-10 text-text-muted mb-2" />
            <p className="text-sm text-text-muted">Нет диалогов</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={ROUTES.END_USER_CONVERSATION(projectId, endUserId, conv.id)}
                className="block p-3 rounded-lg border border-border hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-text-primary">
                    {conv.avatar_name || "AI Аватар"}
                  </span>
                  <ConversationStatusBadge status={conv.status} className="text-xs" />
                </div>
                <div className="flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {conv.messages_count} сообщений
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {(conv.total_tokens ?? 0).toLocaleString()} токенов
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(conv.last_activity_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
