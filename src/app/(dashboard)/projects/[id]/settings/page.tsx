"use client";

import { use } from "react";
import {
  useProject,
  useProjectSettings,
  useUpdateProjectSettings,
} from "@/entities/project";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Skeleton } from "@/shared/ui/skeleton";
import { AccessDenied, isPermissionError } from "@/shared/ui/access-denied";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import type { UpdateProjectSettingsRequest } from "@/shared/types/api";
import { BasicSettings, TOVSettings, LLMSettings, RAGSettings, DangerZone } from "./_components";

interface ProjectSettingsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { id: projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useProjectSettings(projectId);
  const { mutate: updateSettings, isPending: updatingSettings } = useUpdateProjectSettings();

  const isLoading = projectLoading || settingsLoading;

  // Handle permission error
  if (settingsError && isPermissionError(settingsError)) {
    return (
      <PageContainer>
        <PageHeader title="Настройки проекта" description={project?.name || ""} />
        <AccessDenied
          message="У вас нет прав для просмотра настроек этого проекта. Обратитесь к администратору для получения доступа."
          backHref={`/projects/${projectId}`}
        />
      </PageContainer>
    );
  }

  const handleUpdateSettings = (data: UpdateProjectSettingsRequest) => {
    updateSettings(
      { id: projectId, data },
      {
        onSuccess: () => toast.success("Настройки сохранены"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[400px]" />
      </PageContainer>
    );
  }

  if (!project || !settings) {
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
      <PageHeader title="Настройки проекта" description={project.name} />

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Основные</TabsTrigger>
          <TabsTrigger value="tov">Тон голоса</TabsTrigger>
          <TabsTrigger value="llm">LLM</TabsTrigger>
          <TabsTrigger value="rag">RAG</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <BasicSettings key={project.id} projectId={projectId} project={project} />
          <DangerZone project={project} />
        </TabsContent>

        <TabsContent value="tov">
          <TOVSettings settings={settings} onSave={handleUpdateSettings} isLoading={updatingSettings} />
        </TabsContent>

        <TabsContent value="llm">
          <LLMSettings settings={settings} onSave={handleUpdateSettings} isLoading={updatingSettings} />
        </TabsContent>

        <TabsContent value="rag">
          <RAGSettings settings={settings} onSave={handleUpdateSettings} isLoading={updatingSettings} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
