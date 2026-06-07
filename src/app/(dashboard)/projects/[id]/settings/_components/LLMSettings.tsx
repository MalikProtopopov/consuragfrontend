"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Slider } from "@/shared/ui/slider";
import { Spinner } from "@/shared/ui/spinner";
import type { ProjectSettings, UpdateProjectSettingsRequest } from "@/shared/types/api";

export function LLMSettings({
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
