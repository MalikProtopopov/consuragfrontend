"use client";

import { use, useState, useRef, useEffect } from "react";
import { useProject, useProjectSettings, useUpdateProject, useUpdateProjectSettings } from "@/entities/project";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Slider } from "@/shared/ui/slider";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { AccessDenied, isPermissionError } from "@/shared/ui/access-denied";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import type { ProjectSettings, UpdateProjectSettingsRequest } from "@/shared/types/api";

interface ProjectSettingsPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { id: projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: settings, isLoading: settingsLoading, error: settingsError } = useProjectSettings(projectId);
  const { mutate: updateProject, isPending: updatingProject } = useUpdateProject();
  const { mutate: updateSettings, isPending: updatingSettings } = useUpdateProjectSettings();

  const [basicForm, setBasicForm] = useState<{ name: string; description: string; slug: string }>({
    name: "",
    description: "",
    slug: "",
  });
  
  const isFormInitialized = useRef(false);

  // Initialize form when project loads (only once)
  useEffect(() => {
    if (project && !isFormInitialized.current) {
      setBasicForm({
        name: project.name,
        description: project.description || "",
        slug: project.slug,
      });
      isFormInitialized.current = true;
    }
  }, [project]);

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

  const handleUpdateBasic = () => {
    updateProject(
      { id: projectId, data: basicForm },
      {
        onSuccess: () => toast.success("Настройки сохранены"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

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

        {/* Basic Settings */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>Настройки названия и описания проекта</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={basicForm.name}
                  onChange={(e) => setBasicForm({ ...basicForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL-идентификатор</Label>
                <Input
                  id="slug"
                  value={basicForm.slug}
                  onChange={(e) => setBasicForm({ ...basicForm, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={basicForm.description}
                  onChange={(e) => setBasicForm({ ...basicForm, description: e.target.value })}
                  rows={4}
                />
              </div>
              <Button onClick={handleUpdateBasic} disabled={updatingProject}>
                {updatingProject && <Spinner className="mr-2 h-4 w-4" />}
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TOV Settings */}
        <TabsContent value="tov">
          <TOVSettings settings={settings} onSave={handleUpdateSettings} isLoading={updatingSettings} />
        </TabsContent>

        {/* LLM Settings */}
        <TabsContent value="llm">
          <LLMSettings settings={settings} onSave={handleUpdateSettings} isLoading={updatingSettings} />
        </TabsContent>

        {/* RAG Settings */}
        <TabsContent value="rag">
          <RAGSettings settings={settings} onSave={handleUpdateSettings} isLoading={updatingSettings} />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

// TOV Settings Component
function TOVSettings({
  settings,
  onSave,
  isLoading,
}: {
  settings: ProjectSettings;
  onSave: (data: UpdateProjectSettingsRequest) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    tov_formality: settings.tov_formality,
    tov_personality: settings.tov_personality,
    tov_language: settings.tov_language,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Тон голоса (TOV)</CardTitle>
        <CardDescription>Настройки стиля общения AI-аватаров</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Формальность</Label>
          <Select value={form.tov_formality} onValueChange={(v) => setForm({ ...form, tov_formality: v as typeof form.tov_formality })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Формальный</SelectItem>
              <SelectItem value="professional">Профессиональный</SelectItem>
              <SelectItem value="casual">Повседневный</SelectItem>
              <SelectItem value="friendly">Дружеский</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Персональность</Label>
          <Select value={form.tov_personality} onValueChange={(v) => setForm({ ...form, tov_personality: v as typeof form.tov_personality })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="helpful">Помощник</SelectItem>
              <SelectItem value="expert">Эксперт</SelectItem>
              <SelectItem value="friendly">Дружелюбный</SelectItem>
              <SelectItem value="strict">Строгий</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Язык</Label>
          <Select value={form.tov_language} onValueChange={(v) => setForm({ ...form, tov_language: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => onSave(form)} disabled={isLoading}>
          {isLoading && <Spinner className="mr-2 h-4 w-4" />}
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}

// LLM Settings Component
function LLMSettings({
  settings,
  onSave,
  isLoading,
}: {
  settings: ProjectSettings;
  onSave: (data: UpdateProjectSettingsRequest) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    llm_model: settings.llm_model,
    llm_temperature: settings.llm_temperature,
    llm_max_tokens: settings.llm_max_tokens,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки LLM</CardTitle>
        <CardDescription>Параметры языковой модели</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Модель</Label>
          <Select value={form.llm_model} onValueChange={(v) => setForm({ ...form, llm_model: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Температура: {form.llm_temperature}</Label>
          <Slider
            value={[form.llm_temperature ?? 0.7]}
            onValueChange={([v]) => setForm({ ...form, llm_temperature: v ?? 0.7 })}
            min={0}
            max={2}
            step={0.1}
          />
          <p className="text-xs text-text-muted">0 = детерминированный, 2 = креативный</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="max_tokens">Максимум токенов</Label>
          <Input
            id="max_tokens"
            type="number"
            value={form.llm_max_tokens}
            onChange={(e) => setForm({ ...form, llm_max_tokens: parseInt(e.target.value) || 0 })}
            min={100}
            max={4096}
          />
        </div>
        <Button onClick={() => onSave(form)} disabled={isLoading}>
          {isLoading && <Spinner className="mr-2 h-4 w-4" />}
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}

// RAG Settings Component
function RAGSettings({
  settings,
  onSave,
  isLoading,
}: {
  settings: ProjectSettings;
  onSave: (data: UpdateProjectSettingsRequest) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    rag_chunk_size: settings.rag_chunk_size,
    rag_chunk_overlap: settings.rag_chunk_overlap,
    rag_top_k: settings.rag_top_k,
    embedding_model: settings.embedding_model,
    custom_system_prompt: settings.custom_system_prompt || "",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки RAG</CardTitle>
        <CardDescription>Параметры поиска и обработки документов</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="chunk_size">Размер чанка</Label>
            <Input
              id="chunk_size"
              type="number"
              value={form.rag_chunk_size}
              onChange={(e) => setForm({ ...form, rag_chunk_size: parseInt(e.target.value) || 0 })}
              min={100}
              max={2048}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chunk_overlap">Перекрытие</Label>
            <Input
              id="chunk_overlap"
              type="number"
              value={form.rag_chunk_overlap}
              onChange={(e) => setForm({ ...form, rag_chunk_overlap: parseInt(e.target.value) || 0 })}
              min={0}
              max={500}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Top K: {form.rag_top_k}</Label>
          <Slider
            value={[form.rag_top_k ?? 5]}
            onValueChange={([v]) => setForm({ ...form, rag_top_k: v ?? 5 })}
            min={1}
            max={20}
            step={1}
          />
          <p className="text-xs text-text-muted">Количество релевантных чанков для контекста</p>
        </div>
        <div className="space-y-2">
          <Label>Модель эмбеддингов</Label>
          <Select value={form.embedding_model} onValueChange={(v) => setForm({ ...form, embedding_model: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
              <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
              <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="system_prompt">Системный промпт</Label>
          <Textarea
            id="system_prompt"
            value={form.custom_system_prompt}
            onChange={(e) => setForm({ ...form, custom_system_prompt: e.target.value })}
            rows={6}
            placeholder="Кастомные инструкции для AI..."
          />
        </div>
        <Button onClick={() => onSave(form)} disabled={isLoading}>
          {isLoading && <Spinner className="mr-2 h-4 w-4" />}
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}

