"use client";

import Link from "next/link";
import { Bot, FileText, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { Avatar } from "@/shared/types/api";

interface AvatarCardProps {
  avatar: Avatar;
  projectId: string;
}

const statusConfig = {
  active: { label: "Активен", variant: "success" as const },
  draft: { label: "Черновик", variant: "secondary" as const },
  training: { label: "Обучение", variant: "default" as const },
  inactive: { label: "Неактивен", variant: "outline" as const },
};

export function AvatarCard({ avatar, projectId }: AvatarCardProps) {
  const status = statusConfig[avatar.status] || statusConfig.draft;
  const baseUrl = `/projects/${projectId}/avatars/${avatar.id}`;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: avatar.primary_color
                ? `${avatar.primary_color}20`
                : "var(--color-accent-primary-10)",
            }}
          >
            {avatar.avatar_image_url ? (
              <img
                src={avatar.avatar_image_url}
                alt={avatar.name}
                className="size-8 rounded-lg object-cover"
              />
            ) : (
              <Bot
                className="size-6"
                style={{ color: avatar.primary_color || "var(--color-accent-primary)" }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-text-primary line-clamp-1">{avatar.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant={status.variant}>{status.label}</Badge>
              {avatar.is_published && <Badge variant="success">Опубликован</Badge>}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {avatar.description && (
          <p className="text-sm text-text-secondary mb-4 line-clamp-2">{avatar.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
          <div className="flex items-center gap-1.5">
            <FileText className="size-4" />
            <span>{avatar.documents_count} док.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="size-4" />
            <span>{avatar.sessions_count} сессий</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-auto">
          <Button variant="outline" size="sm" asChild>
            <Link href={baseUrl}>Настройки</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`${baseUrl}/documents`}>Документы</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href={`${baseUrl}/chat`}>Чат</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

