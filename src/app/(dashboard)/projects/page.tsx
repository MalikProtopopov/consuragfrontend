"use client";

import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { useProjects } from "@/entities/project";
import { useAuthStore, canCreateProject } from "@/entities/auth";
import { ProjectCard } from "@/features/project";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/ui/empty-state";

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useProjects();

  const projects = data?.items || [];
  const canCreate = canCreateProject(user);

  return (
    <PageContainer>
      <PageHeader
        title="Проекты"
        description="Управляйте вашими AI-аватарами и базами знаний"
        actions={
          canCreate && (
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Создать проект
              </Link>
            </Button>
          )
        }
      />

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Нет проектов"
          description={
            canCreate
              ? "Создайте свой первый проект для начала работы с AI-аватарами"
              : "У вас пока нет доступных проектов"
          }
          action={
            canCreate && (
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать проект
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

