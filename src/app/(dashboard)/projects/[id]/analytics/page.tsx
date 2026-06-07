"use client";

import { use } from "react";
import { FileText, MessageSquare, ThumbsUp, ThumbsDown, Activity, Users, Zap } from "lucide-react";
import { useProject } from "@/entities/project";
import { useProjectUsage } from "@/entities/analytics";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { StatsCard } from "@/shared/ui/stats-card";
import { Skeleton } from "@/shared/ui/skeleton";
import { AccessDenied, isPermissionError } from "@/shared/ui/access-denied";

interface ProjectAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectAnalyticsPage({ params }: ProjectAnalyticsPageProps) {
  const { id: projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: usage, isLoading: usageLoading, error: usageError } = useProjectUsage(projectId);

  const isLoading = projectLoading || usageLoading;

  // Handle permission error
  if (usageError && isPermissionError(usageError)) {
    return (
      <PageContainer>
        <PageHeader title="Аналитика проекта" description={project?.name || ""} />
        <AccessDenied
          message="У вас нет прав для просмотра аналитики этого проекта. Обратитесь к администратору для получения доступа."
          backHref={`/projects/${projectId}`}
        />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (!project || !usage) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-text-secondary">Данные не найдены</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Аналитика проекта" description={project.name} />

      {/* Period Info */}
      <p className="text-sm text-text-muted mb-6">
        Период: {usage.period_start} — {usage.period_end}
      </p>

      {/* Token Usage — бекенд отдаёт только total_tokens на уровне проекта,
          разбивки chat/embedding и лимитов здесь нет (они в /settings/usage) */}
      <div className="mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="size-5 text-accent-primary" />
              <CardTitle className="text-base">Токены за период</CardTitle>
            </div>
            <CardDescription>
              Суммарное использование токенов проектом (чат + индексация документов)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-text-primary">
              {(usage.total_tokens ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Всего сообщений"
          value={(usage.total_messages ?? 0).toLocaleString()}
          description={`${usage.user_messages ?? 0} вход. / ${usage.assistant_messages ?? 0} исход.`}
          icon={MessageSquare}
        />
        <StatsCard
          title="Сессий"
          value={(usage.total_sessions ?? 0).toLocaleString()}
          description="всего чатов"
          icon={Activity}
        />
        <StatsCard
          title="Уникальных клиентов"
          value={(usage.unique_clients ?? 0).toLocaleString()}
          description="пользователей"
          icon={Users}
        />
        <StatsCard
          title="Документы"
          value={usage.documents_uploaded ?? 0}
          description={`${usage.documents_indexed ?? 0} проиндексировано`}
          icon={FileText}
        />
      </div>

      {/* Feedback Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Обратная связь</CardTitle>
          <CardDescription>Оценки ответов от пользователей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
              <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
                <ThumbsUp className="size-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {usage.positive_feedback ?? 0}
                </p>
                <p className="text-sm text-text-muted">Положительных</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
              <div className="flex size-12 items-center justify-center rounded-full bg-error/10">
                <ThumbsDown className="size-6 text-error" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {usage.negative_feedback ?? 0}
                </p>
                <p className="text-sm text-text-muted">Отрицательных</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
              <div className="flex size-12 items-center justify-center rounded-full bg-accent-primary/10">
                <Activity className="size-6 text-accent-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {((usage.feedback_score ?? 0) * 100).toFixed(0)}%
                </p>
                <p className="text-sm text-text-muted">Рейтинг</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

