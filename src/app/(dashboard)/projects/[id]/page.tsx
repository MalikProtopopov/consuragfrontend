"use client";

import { use } from "react";
import Link from "next/link";
import { Bot, FileText, MessageSquare, Users, UserCircle, BarChart3, Settings, Plus } from "lucide-react";
import { useProject } from "@/entities/project";
import { useAvatars } from "@/entities/avatar";
import { useProjectUsage } from "@/entities/analytics";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Badge } from "@/shared/ui/badge";
import { StatsCard } from "@/shared/ui/stats-card";

interface ProjectDashboardPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  const { id: projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: avatarsData, isLoading: avatarsLoading } = useAvatars(projectId, { limit: 5 });
  const { data: usage, isLoading: usageLoading } = useProjectUsage(projectId);

  const isLoading = projectLoading || avatarsLoading || usageLoading;
  const avatars = avatarsData?.items || [];

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-text-secondary">Проект не найден</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={project.name}
        description={project.description || "Обзор проекта"}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/projects/${projectId}/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Настройки
            </Link>
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatsCard
          title="Аватары"
          value={project.avatars_count}
          description="всего"
          icon={Bot}
        />
        <StatsCard
          title="Документы"
          value={usage?.documents_uploaded || 0}
          description={`${usage?.documents_indexed || 0} проиндексировано`}
          icon={FileText}
        />
        <StatsCard
          title="Сессий"
          value={usage?.total_sessions || 0}
          description="всего"
          icon={MessageSquare}
        />
        <StatsCard
          title="Участники"
          value={project.members_count}
          description="команды"
          icon={Users}
        />
        <StatsCard
          title="Пользователи"
          value={project.end_users_count ?? 0}
          description="конечных"
          icon={UserCircle}
        />
      </div>

      {/* Quick Actions & Recent Avatars */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/projects/${projectId}/avatars/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Создать аватар
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/projects/${projectId}/members`}>
                <Users className="mr-2 h-4 w-4" />
                Управление участниками
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/projects/${projectId}/analytics`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Просмотр аналитики
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Avatars */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Последние аватары</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/projects/${projectId}/avatars`}>Все аватары</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {avatars.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">Нет аватаров</p>
            ) : (
              <div className="space-y-3">
                {avatars.map((avatar) => (
                  <Link
                    key={avatar.id}
                    href={`/projects/${projectId}/avatars/${avatar.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-bg-hover transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-accent-primary/10">
                        <Bot className="size-4 text-accent-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{avatar.name}</p>
                        <p className="text-xs text-text-muted">
                          {avatar.documents_count} док. · {avatar.sessions_count} сессий
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        avatar.status === "active"
                          ? "success"
                          : avatar.status === "draft"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {avatar.is_published ? "Опубликован" : avatar.status === "active" ? "Активен" : avatar.status === "draft" ? "Черновик" : avatar.status === "inactive" ? "Неактивен" : avatar.status === "training" ? "Обучается" : avatar.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

