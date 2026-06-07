"use client";

import { MessageSquare, Activity, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";
import { StatsCard } from "@/shared/ui/stats-card";
import type { UpdateAvatarRequest, AvatarStatus, AvatarStats } from "@/shared/types/api";

interface AvatarSettingsTabsProps {
  form: UpdateAvatarRequest;
  setForm: React.Dispatch<React.SetStateAction<UpdateAvatarRequest>>;
  onSave: (data: Partial<UpdateAvatarRequest>) => void;
  updating: boolean;
  stats?: AvatarStats;
}

export function AvatarSettingsTabs({
  form,
  setForm,
  onSave,
  updating,
  stats,
}: AvatarSettingsTabsProps) {
  return (
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
                onSave({ name: form.name, description: form.description, status: form.status })
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
                onSave({
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
                onSave({
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
                onSave({
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
            <StatsCard
              title="Токенов"
              value={(stats.total_tokens_used ?? 0).toLocaleString()}
              icon={Activity}
            />
            <StatsCard
              title="Сообщений/сессия"
              value={(stats.avg_messages_per_session ?? 0).toFixed(1)}
              icon={MessageSquare}
            />
            <StatsCard title="Документов" value={stats.documents_count ?? 0} icon={FileText} />
            <StatsCard title="Чанков" value={stats.indexed_chunks_count ?? 0} icon={Activity} />
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
  );
}
