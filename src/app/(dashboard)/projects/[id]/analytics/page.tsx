"use client";

import { use } from "react";
import { Bot, FileText, MessageSquare, ThumbsUp, ThumbsDown, Activity } from "lucide-react";
import { useProject } from "@/entities/project";
import { useProjectUsage } from "@/entities/analytics";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { StatsCard } from "@/shared/ui/stats-card";
import { Skeleton } from "@/shared/ui/skeleton";

interface ProjectAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectAnalyticsPage({ params }: ProjectAnalyticsPageProps) {
  const { id: projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: usage, isLoading: usageLoading } = useProjectUsage(projectId);

  const isLoading = projectLoading || usageLoading;

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

      {/* Main Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatsCard
          title="Аватары"
          value={usage.avatars_count ?? 0}
          description={`${usage.published_avatars ?? 0} опубликовано`}
          icon={Bot}
        />
        <StatsCard
          title="Документы"
          value={usage.documents_count ?? 0}
          description={`${usage.indexed_documents ?? 0} проиндексировано`}
          icon={FileText}
        />
        <StatsCard
          title="Чанков"
          value={(usage.total_chunks ?? 0).toLocaleString()}
          description="в базе знаний"
          icon={FileText}
        />
        <StatsCard
          title="Всего сессий"
          value={(usage.total_sessions ?? 0).toLocaleString()}
          description={`${usage.active_sessions ?? 0} активных`}
          icon={Activity}
        />
        <StatsCard
          title="Всего сообщений"
          value={(usage.total_messages ?? 0).toLocaleString()}
          description={`${usage.messages_period ?? 0} за период`}
          icon={MessageSquare}
        />
        <StatsCard
          title="Токенов"
          value={(usage.total_tokens ?? 0).toLocaleString()}
          description={`${usage.tokens_period ?? 0} за период`}
          icon={Activity}
        />
      </div>

      {/* Feedback Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Обратная связь</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
              <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
                <ThumbsUp className="size-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">
                  {usage.positive_feedback ?? 0}
                </p>
                <p className="text-sm text-text-muted">Положительных оценок</p>
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
                <p className="text-sm text-text-muted">Отрицательных оценок</p>
              </div>
            </div>
          </div>
          {(usage.positive_feedback ?? 0) + (usage.negative_feedback ?? 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-text-muted">
                Рейтинг:{" "}
                <span className="font-medium text-text-primary">
                  {(
                    ((usage.positive_feedback ?? 0) /
                      ((usage.positive_feedback ?? 0) + (usage.negative_feedback ?? 0))) *
                    100
                  ).toFixed(1)}
                  %
                </span>{" "}
                положительных
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

