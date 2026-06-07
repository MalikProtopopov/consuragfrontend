"use client";

import { useState } from "react";
import { useUpdateProject } from "@/entities/project";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Spinner } from "@/shared/ui/spinner";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import type { Project } from "@/shared/types/api";

export function BasicSettings({ projectId, project }: { projectId: string; project: Project }) {
  const { mutate: updateProject, isPending } = useUpdateProject();
  const [form, setForm] = useState({
    name: project.name,
    description: project.description || "",
    slug: project.slug,
  });

  const handleSave = () => {
    updateProject(
      { id: projectId, data: form },
      {
        onSuccess: () => toast.success("Настройки сохранены"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return (
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
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">URL-идентификатор</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Описание</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
        </div>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending && <Spinner className="mr-2 h-4 w-4" />}
          Сохранить
        </Button>
      </CardContent>
    </Card>
  );
}
