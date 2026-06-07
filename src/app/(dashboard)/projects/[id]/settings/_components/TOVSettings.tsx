"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";
import type { ProjectSettings, UpdateProjectSettingsRequest } from "@/shared/types/api";

export function TOVSettings({
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
