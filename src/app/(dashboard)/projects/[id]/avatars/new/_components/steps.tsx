"use client";

import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DEFAULT_AVATAR_COLOR } from "@/shared/config";
import type { CreateAvatarRequest } from "@/shared/types/api";

export type UpdateForm = <K extends keyof CreateAvatarRequest>(
  key: K,
  value: CreateAvatarRequest[K]
) => void;

interface StepProps {
  formData: CreateAvatarRequest;
  updateForm: UpdateForm;
}

export const steps = [
  { title: "Основное", description: "Название и описание" },
  { title: "Промпты", description: "Настройки поведения" },
  { title: "Внешний вид", description: "Оформление" },
  { title: "LLM", description: "Параметры модели" },
];

export function Step1Basic({ formData, updateForm }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Название аватара *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateForm("name", e.target.value)}
          placeholder="Консультант по продуктам"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => updateForm("description", e.target.value)}
          placeholder="AI-консультант для ответов на вопросы о продуктах и услугах"
          rows={4}
        />
      </div>
    </div>
  );
}

export function Step2Prompts({ formData, updateForm }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="system_prompt">Системный промпт</Label>
        <Textarea
          id="system_prompt"
          value={formData.system_prompt || ""}
          onChange={(e) => updateForm("system_prompt", e.target.value)}
          placeholder="Ты — вежливый AI-консультант. Отвечай кратко и по делу..."
          rows={4}
        />
        <p className="text-xs text-text-muted">
          Инструкции, определяющие поведение и стиль ответов аватара
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="welcome_message">Приветственное сообщение</Label>
        <Textarea
          id="welcome_message"
          value={formData.welcome_message || ""}
          onChange={(e) => updateForm("welcome_message", e.target.value)}
          placeholder="Здравствуйте! Я AI-консультант. Чем могу помочь?"
          rows={2}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fallback_message">Сообщение при отсутствии ответа</Label>
        <Textarea
          id="fallback_message"
          value={formData.fallback_message || ""}
          onChange={(e) => updateForm("fallback_message", e.target.value)}
          placeholder="К сожалению, я не нашёл информации по вашему вопросу..."
          rows={2}
        />
      </div>
    </div>
  );
}

export function Step3Appearance({ formData, updateForm }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="avatar_image_url">URL изображения</Label>
        <Input
          id="avatar_image_url"
          value={formData.avatar_image_url || ""}
          onChange={(e) => updateForm("avatar_image_url", e.target.value)}
          placeholder="https://example.com/avatar.png"
        />
        <p className="text-xs text-text-muted">
          URL изображения для аватара (рекомендуется квадратное)
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="primary_color">Основной цвет</Label>
        <div className="flex gap-3">
          <Input
            id="primary_color"
            type="color"
            value={formData.primary_color || DEFAULT_AVATAR_COLOR}
            onChange={(e) => updateForm("primary_color", e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input
            value={formData.primary_color || DEFAULT_AVATAR_COLOR}
            onChange={(e) => updateForm("primary_color", e.target.value)}
            placeholder={DEFAULT_AVATAR_COLOR}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}

export function Step4LLM({ formData, updateForm }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Модель</Label>
        <Select
          value={formData.llm_model || "gpt-4-turbo-preview"}
          onValueChange={(v) => updateForm("llm_model", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-text-muted">
          Оставьте пустым для использования настроек проекта
        </p>
      </div>
      <div className="space-y-2">
        <Label>Температура: {formData.llm_temperature}</Label>
        <Slider
          value={[formData.llm_temperature || 0.7]}
          onValueChange={([v]) => updateForm("llm_temperature", v)}
          min={0}
          max={2}
          step={0.1}
        />
        <p className="text-xs text-text-muted">0 = детерминированный, 2 = креативный</p>
      </div>
      <div className="space-y-2">
        <Label>Top K: {formData.rag_top_k}</Label>
        <Slider
          value={[formData.rag_top_k || 5]}
          onValueChange={([v]) => updateForm("rag_top_k", v)}
          min={1}
          max={20}
          step={1}
        />
        <p className="text-xs text-text-muted">Количество релевантных документов для контекста</p>
      </div>
    </div>
  );
}
