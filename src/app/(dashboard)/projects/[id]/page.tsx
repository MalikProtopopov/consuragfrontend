"use client";

import { use } from "react";
import Link from "next/link";
import { Bot, FileText, MessageSquare, Users, UserCircle, BarChart3, Settings, Plus, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib";
import { AvatarIdentity } from "@/shared/ui/avatar-identity";
import { useProject } from "@/entities/project";
import { useAvatars } from "@/entities/avatar";
import { useProjectUsage } from "@/entities/analytics";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Badge } from "@/shared/ui/badge";
import { AvatarStatusBadge } from "@/shared/ui/status-badge";
import { StatsCard } from "@/shared/ui/stats-card";

interface ProjectDashboardPageProps {
  params: Promise<{ id: string }>;
}

function ChecklistStep({
  done,
  current,
  label,
  href,
  cta,
}: {
  done: boolean;
  current: boolean;
  label: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      {done ? (
        <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />
      ) : (
        <Circle
          className={cn("size-5 shrink-0", current ? "text-primary-ring" : "text-text-muted")}
          aria-hidden
        />
      )}
      <span
        className={cn(
          "flex-1 text-sm",
          done ? "text-text-muted line-through" : "text-text-primary",
        )}
      >
        {label}
      </span>
      {!done && current && (
        <Button size="sm" asChild>
          <Link href={href}>
            {cta}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      )}
    </div>
  );
}

export default function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
  const { id: projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: avatarsData, isLoading: avatarsLoading } = useAvatars(projectId, { limit: 5 });
  const { data: usage, isLoading: usageLoading } = useProjectUsage(projectId);

  const isLoading = projectLoading || avatarsLoading || usageLoading;
  const avatars = avatarsData?.items || [];

  // A-01: онбординг-чеклист активации (пока проект не доведён до рабочего аватара)
  const firstAvatar = avatars[0];
  const hasAvatar = (project?.avatars_count ?? 0) > 0;
  const hasDocs =
    (usage?.documents_indexed ?? 0) > 0 || avatars.some((a) => (a.documents_count ?? 0) > 0);
  const hasPublished = avatars.some((a) => a.is_published);
  const onboardingComplete = hasAvatar && hasDocs && hasPublished;
  const docsHref = firstAvatar
    ? `/projects/${projectId}/avatars/${firstAvatar.id}/documents`
    : `/projects/${projectId}/avatars/new`;
  const publishHref = firstAvatar
    ? `/projects/${projectId}/avatars/${firstAvatar.id}`
    : `/projects/${projectId}/avatars/new`;

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

      {/* A-01: онбординг-чеклист — пока активация не завершена */}
      {!onboardingComplete && (
        <Card className="mb-8 border-primary-ring/30">
          <CardHeader>
            <CardTitle className="text-lg">Запустите первого AI-консультанта</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1">
            <ChecklistStep
              done={hasAvatar}
              current={!hasAvatar}
              label="Создать аватара"
              href={`/projects/${projectId}/avatars/new`}
              cta="Создать"
            />
            <ChecklistStep
              done={hasDocs}
              current={hasAvatar && !hasDocs}
              label="Загрузить документы (база знаний)"
              href={docsHref}
              cta="Загрузить"
            />
            <ChecklistStep
              done={hasPublished}
              current={hasDocs && !hasPublished}
              label="Опубликовать и протестировать в чате"
              href={publishHref}
              cta="Опубликовать"
            />
          </CardContent>
        </Card>
      )}

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
                      <AvatarIdentity
                        name={avatar.name}
                        color={avatar.primary_color}
                        imageUrl={avatar.avatar_image_url}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium text-text-primary">{avatar.name}</p>
                        <p className="text-xs text-text-muted">
                          {avatar.documents_count} док. · {avatar.sessions_count} сессий
                        </p>
                      </div>
                    </div>
                    {avatar.is_published ? (
                      <Badge variant="success-subtle">Опубликован</Badge>
                    ) : (
                      <AvatarStatusBadge status={avatar.status} />
                    )}
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

