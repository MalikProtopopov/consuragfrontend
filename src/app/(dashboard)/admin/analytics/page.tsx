"use client";

import { Users, FolderKanban, Bot, MessageSquare, FileText, Activity } from "lucide-react";
import { usePlatformAnalytics } from "@/entities/analytics";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
// Card not needed since we only use StatsCard
import { StatsCard } from "@/shared/ui/stats-card";
import { Skeleton } from "@/shared/ui/skeleton";

export default function PlatformAnalyticsPage() {
  const { data: stats, isLoading } = usePlatformAnalytics();

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (!stats) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-text-secondary">Данные недоступны</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Аналитика платформы"
        description="Статистика использования AI Avatar Platform"
      />

      {/* Users Section */}
      <h2 className="text-lg font-semibold text-text-primary mb-4">Пользователи</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Всего пользователей"
          value={stats.total_users ?? 0}
          description={`+${stats.new_users_today ?? 0} сегодня`}
          icon={Users}
        />
        <StatsCard
          title="Активных сегодня"
          value={stats.active_users_today ?? 0}
          icon={Users}
        />
        <StatsCard
          title="Активных за неделю"
          value={stats.active_users_week ?? 0}
          icon={Users}
        />
        <StatsCard
          title="Активных за месяц"
          value={stats.active_users_month ?? 0}
          icon={Users}
        />
      </div>

      {/* Projects & Avatars Section */}
      <h2 className="text-lg font-semibold text-text-primary mb-4">Проекты и Аватары</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Всего проектов"
          value={stats.total_projects ?? 0}
          description={`${stats.active_projects ?? 0} активных`}
          icon={FolderKanban}
        />
        <StatsCard
          title="Всего аватаров"
          value={stats.total_avatars ?? 0}
          description={`${stats.published_avatars ?? 0} опубликовано`}
          icon={Bot}
        />
        <StatsCard
          title="Документов"
          value={stats.total_documents ?? 0}
          icon={FileText}
        />
        <StatsCard
          title="Чанков"
          value={(stats.total_chunks ?? 0).toLocaleString()}
          icon={FileText}
        />
      </div>

      {/* Usage Section */}
      <h2 className="text-lg font-semibold text-text-primary mb-4">Использование</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Сообщений сегодня"
          value={(stats.total_messages_today ?? 0).toLocaleString()}
          description={`${(stats.total_messages_month ?? 0).toLocaleString()} за месяц`}
          icon={MessageSquare}
        />
        <StatsCard
          title="Токенов сегодня"
          value={(stats.total_tokens_today ?? 0).toLocaleString()}
          description={`${(stats.total_tokens_month ?? 0).toLocaleString()} за месяц`}
          icon={Activity}
        />
      </div>
    </PageContainer>
  );
}

