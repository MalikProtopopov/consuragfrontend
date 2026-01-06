"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, Globe, X } from "lucide-react";
import {
  useAvatar,
  useAvatarStats,
  useUpdateAvatar,
  useDeleteAvatar,
  usePublishAvatar,
  useUnpublishAvatar,
} from "@/entities/avatar";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { StatsCard } from "@/shared/ui/stats-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/shared/ui/dialog";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import { MessageSquare, ThumbsUp, ThumbsDown, Activity } from "lucide-react";
import type { UpdateAvatarRequest, AvatarStatus } from "@/shared/types/api";

interface AvatarSettingsPageProps {
  params: Promise<{ id: string; avatarId: string }>;
}

export default function AvatarSettingsPage({ params }: AvatarSettingsPageProps) {
  const { id: projectId, avatarId } = use(params);
  const { data: avatar, isLoading } = useAvatar(projectId, avatarId);
  const { data: stats } = useAvatarStats(projectId, avatarId);
  const { mutate: updateAvatar, isPending: updating } = useUpdateAvatar();
  const { mutate: deleteAvatar, isPending: deleting } = useDeleteAvatar();
  const { mutate: publish, isPending: publishing } = usePublishAvatar();
  const { mutate: unpublish, isPending: unpublishing } = useUnpublishAvatar();

  const [form, setForm] = useState<UpdateAvatarRequest>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Initialize form when avatar loads
  useEffect(() => {
    if (avatar) {
      setForm({
        name: avatar.name,
        description: avatar.description || "",
        status: avatar.status,
        system_prompt: avatar.system_prompt || "",
        welcome_message: avatar.welcome_message || "",
        fallback_message: avatar.fallback_message || "",
        avatar_image_url: avatar.avatar_image_url || "",
        primary_color: avatar.primary_color || "#ffcd33",
        llm_model: avatar.llm_model || "",
        llm_temperature: avatar.llm_temperature || 0.7,
        rag_top_k: avatar.rag_top_k || 5,
      });
    }
  }, [avatar]);

  const handleSave = (data: Partial<UpdateAvatarRequest>) => {
    updateAvatar(
      { projectId, avatarId, data },
      {
        onSuccess: () => toast.success("Настройки сохранены"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handlePublish = () => {
    publish(
      { projectId, avatarId },
      {
        onSuccess: () => toast.success("Аватар опубликован"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleUnpublish = () => {
    unpublish(
      { projectId, avatarId },
      {
        onSuccess: () => toast.success("Аватар снят с публикации"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleDelete = () => {
    deleteAvatar(
      { projectId, avatarId },
      {
        onSuccess: () => toast.success("Аватар удален"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[500px]" />
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
          <Link href={`/projects/${projectId}/avatars`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К аватарам
          </Link>
        </Button>
      </div>

      <PageHeader
        title={avatar.name}
        description={avatar.description || "Настройки аватара"}
        actions={
          <div className="flex gap-2">
            {avatar.is_published ? (
              <Button
                variant="outline"
                onClick={handleUnpublish}
                disabled={unpublishing}
              >
                {unpublishing ? <Spinner className="mr-2 h-4 w-4" /> : <X className="mr-2 h-4 w-4" />}
                Снять с публикации
              </Button>
            ) : (
              <Button onClick={handlePublish} disabled={publishing}>
                {publishing ? <Spinner className="mr-2 h-4 w-4" /> : <Globe className="mr-2 h-4 w-4" />}
                Опубликовать
              </Button>
            )}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Удалить аватар?</DialogTitle>
                </DialogHeader>
                <p className="text-text-secondary">
                  Это действие необратимо. Будут удалены все документы и история чатов.
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                    {deleting && <Spinner className="mr-2 h-4 w-4" />}
                    Удалить
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Status Badge */}
      <div className="flex gap-2 mb-6">
        <Badge variant={avatar.status === "active" ? "success" : "secondary"}>
          {avatar.status}
        </Badge>
        {avatar.is_published && <Badge variant="success">Опубликован</Badge>}
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Основные</TabsTrigger>
          <TabsTrigger value="prompts">Промпты</TabsTrigger>
          <TabsTrigger value="llm">LLM</TabsTrigger>
          <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
        </TabsList>

        {/* Basic Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as AvatarStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="inactive">Неактивен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() =>
                  handleSave({
                    name: form.name,
                    description: form.description,
                    status: form.status,
                  })
                }
                disabled={updating}
              >
                {updating && <Spinner className="mr-2 h-4 w-4" />}
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle>Настройки промптов</CardTitle>
              <CardDescription>Определите поведение и стиль общения аватара</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system_prompt">Системный промпт</Label>
                <Textarea
                  id="system_prompt"
                  value={form.system_prompt || ""}
                  onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcome_message">Приветственное сообщение</Label>
                <Textarea
                  id="welcome_message"
                  value={form.welcome_message || ""}
                  onChange={(e) => setForm({ ...form, welcome_message: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fallback_message">Сообщение при отсутствии ответа</Label>
                <Textarea
                  id="fallback_message"
                  value={form.fallback_message || ""}
                  onChange={(e) => setForm({ ...form, fallback_message: e.target.value })}
                  rows={3}
                />
              </div>
              <Button
                onClick={() =>
                  handleSave({
                    system_prompt: form.system_prompt,
                    welcome_message: form.welcome_message,
                    fallback_message: form.fallback_message,
                  })
                }
                disabled={updating}
              >
                {updating && <Spinner className="mr-2 h-4 w-4" />}
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LLM Tab */}
        <TabsContent value="llm">
          <Card>
            <CardHeader>
              <CardTitle>Настройки LLM</CardTitle>
              <CardDescription>Параметры языковой модели для этого аватара</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Модель</Label>
                <Select
                  value={form.llm_model || "default"}
                  onValueChange={(v) => setForm({ ...form, llm_model: v === "default" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Использовать настройки проекта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Настройки проекта</SelectItem>
                    <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Температура: {form.llm_temperature}</Label>
                <Slider
                  value={[form.llm_temperature || 0.7]}
                  onValueChange={([v]) => setForm({ ...form, llm_temperature: v })}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>
              <div className="space-y-2">
                <Label>Top K: {form.rag_top_k}</Label>
                <Slider
                  value={[form.rag_top_k || 5]}
                  onValueChange={([v]) => setForm({ ...form, rag_top_k: v })}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
              <Button
                onClick={() =>
                  handleSave({
                    llm_model: form.llm_model || undefined,
                    llm_temperature: form.llm_temperature,
                    rag_top_k: form.rag_top_k,
                  })
                }
                disabled={updating}
              >
                {updating && <Spinner className="mr-2 h-4 w-4" />}
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Внешний вид</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar_image_url">URL изображения</Label>
                <Input
                  id="avatar_image_url"
                  value={form.avatar_image_url || ""}
                  onChange={(e) => setForm({ ...form, avatar_image_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary_color">Основной цвет</Label>
                <div className="flex gap-3">
                  <Input
                    type="color"
                    value={form.primary_color || "#ffcd33"}
                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={form.primary_color || "#ffcd33"}
                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  handleSave({
                    avatar_image_url: form.avatar_image_url || undefined,
                    primary_color: form.primary_color,
                  })
                }
                disabled={updating}
              >
                {updating && <Spinner className="mr-2 h-4 w-4" />}
                Сохранить
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          {stats ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <StatsCard title="Сессий" value={stats.total_sessions ?? 0} icon={MessageSquare} />
              <StatsCard title="Сообщений" value={stats.total_messages ?? 0} icon={MessageSquare} />
              <StatsCard title="Токенов" value={(stats.total_tokens ?? 0).toLocaleString()} icon={Activity} />
              <StatsCard
                title="Сообщений/сессия"
                value={(stats.average_messages_per_session ?? 0).toFixed(1)}
                icon={MessageSquare}
              />
              <StatsCard title="Положительных" value={stats.positive_feedback_count ?? 0} icon={ThumbsUp} />
              <StatsCard title="Отрицательных" value={stats.negative_feedback_count ?? 0} icon={ThumbsDown} />
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-text-muted">Статистика загружается...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

