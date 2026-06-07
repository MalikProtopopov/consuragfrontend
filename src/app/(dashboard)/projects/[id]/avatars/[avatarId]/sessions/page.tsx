"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Globe, Send, Terminal, Eye } from "lucide-react";
import { useAvatar } from "@/entities/avatar";
import { useSessions, useSession } from "@/entities/chat";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Skeleton } from "@/shared/ui/skeleton";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { formatDate } from "@/shared/lib";
import type { ChatSource, ChatSession } from "@/shared/types/api";

interface SessionsPageProps {
  params: Promise<{ id: string; avatarId: string }>;
}

const sourceIcons: Record<ChatSource, typeof Globe> = {
  web: Globe,
  telegram: Send,
  api: Terminal,
};

const sourceLabels: Record<ChatSource, string> = {
  web: "Web",
  telegram: "Telegram",
  api: "API",
};

export default function SessionsPage({ params }: SessionsPageProps) {
  const { id: projectId, avatarId } = use(params);
  const { data: avatar, isLoading: avatarLoading } = useAvatar(projectId, avatarId);
  const [activeOnly, setActiveOnly] = useState(false);

  const { data: sessionsData, isLoading: sessionsLoading } = useSessions({
    avatar_id: avatarId,
    active_only: activeOnly,
  });

  const isLoading = avatarLoading || sessionsLoading;
  const sessions = sessionsData?.items || [];

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[400px]" />
      </PageContainer>
    );
  }

  if (!avatar) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-text-secondary">Аватар не найден</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/projects/${projectId}/avatars/${avatarId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К аватару
          </Link>
        </Button>
      </div>

      <PageHeader title="История сессий" description={avatar.name} />

      {/* Filter */}
      <div className="mb-6 flex items-center space-x-2">
        <Checkbox
          id="active-only"
          checked={activeOnly}
          onCheckedChange={(c) => setActiveOnly(!!c)}
        />
        <Label htmlFor="active-only" className="font-normal">
          Только активные
        </Label>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Сессии ({sessions.length})</CardTitle>
          <CardDescription>История чатов с пользователями</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-text-muted mb-4" />
              <p className="text-text-secondary">Нет сессий</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Источник</TableHead>
                  <TableHead>Сообщений</TableHead>
                  <TableHead>Токенов</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Последняя активность</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <SessionRow key={session.id} session={session} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function SessionRow({ session }: { session: ChatSession }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const SourceIcon = session.source ? sourceIcons[session.source] : Globe;
  const sourceLabel = session.source ? sourceLabels[session.source] : "Неизвестно";

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">{session.id.slice(0, 8)}...</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <SourceIcon className="h-4 w-4 text-text-muted" />
          <span>{sourceLabel}</span>
        </div>
      </TableCell>
      <TableCell>{session.messages_count}</TableCell>
      <TableCell>{(session.tokens_used ?? 0).toLocaleString()}</TableCell>
      <TableCell>
        <Badge variant={session.is_active ? "success" : "secondary"}>
          {session.is_active ? "Активна" : "Закрыта"}
        </Badge>
      </TableCell>
      <TableCell>{formatDate(session.last_activity_at, "datetime-short")}</TableCell>
      <TableCell className="text-right">
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Сессия: {session.id.slice(0, 8)}...</DialogTitle>
            </DialogHeader>
            <SessionDetail sessionId={session.id} />
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}

function SessionDetail({ sessionId }: { sessionId: string }) {
  const { data: session, isLoading } = useSession(sessionId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (!session) {
    return <p className="text-text-muted">Сессия не найдена</p>;
  }

  const messages = session.messages || [];

  if (messages.length === 0) {
    return <p className="text-text-muted">Сообщения не найдены</p>;
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg border border-border ${
              message.role === "user" ? "bg-bg-hover" : "bg-bg-secondary"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant={message.role === "user" ? "outline" : "secondary"}>
                {message.role === "user" ? "Пользователь" : "Ассистент"}
              </Badge>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{message.tokens_used ?? 0} токенов</span>
                {message.feedback && (
                  <Badge variant={message.feedback === "positive" ? "success" : "destructive"}>
                    {message.feedback === "positive" ? "👍" : "👎"}
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

