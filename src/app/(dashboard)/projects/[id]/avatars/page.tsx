"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Plus, Bot } from "lucide-react";
import { useProject } from "@/entities/project";
import { useAvatars } from "@/entities/avatar";
import { AvatarCard } from "@/features/avatar";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { AvatarStatus } from "@/shared/types/api";

interface AvatarsPageProps {
  params: Promise<{ id: string }>;
}

export default function AvatarsPage({ params }: AvatarsPageProps) {
  const { id: projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const [statusFilter, setStatusFilter] = useState<AvatarStatus | "all">("all");

  const { data: avatarsData, isLoading: avatarsLoading } = useAvatars(projectId, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const isLoading = projectLoading || avatarsLoading;
  const avatars = avatarsData?.items || [];

  if (projectLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[240px]" />
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
        title="Аватары"
        description={project.name}
        actions={
          <Button asChild>
            <Link href={`/projects/${projectId}/avatars/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Создать аватар
            </Link>
          </Button>
        }
      />

      {/* Filter */}
      <div className="mb-6">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="draft">Черновики</SelectItem>
            <SelectItem value="training">В обучении</SelectItem>
            <SelectItem value="inactive">Неактивные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[240px]" />
          ))}
        </div>
      ) : avatars.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="Нет аватаров"
          description="Создайте своего первого AI-аватара для начала работы"
          action={
            <Button asChild>
              <Link href={`/projects/${projectId}/avatars/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Создать аватар
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {avatars.map((avatar) => (
            <AvatarCard key={avatar.id} avatar={avatar} projectId={projectId} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

