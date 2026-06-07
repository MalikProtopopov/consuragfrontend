"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Slider } from "@/shared/ui/slider";
import { Spinner } from "@/shared/ui/spinner";
import type { ProjectSettings, UpdateProjectSettingsRequest } from "@/shared/types/api";

export function RAGSettings({
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
