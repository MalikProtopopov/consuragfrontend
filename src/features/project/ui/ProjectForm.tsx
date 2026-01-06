"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Spinner } from "@/shared/ui/spinner";

const projectSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(255, "Максимум 255 символов"),
  description: z.string().max(2000, "Максимум 2000 символов").optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Только строчные латинские буквы, цифры и дефисы")
    .max(100, "Максимум 100 символов")
    .optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ProjectForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  submitLabel = "Создать проект",
}: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Название проекта *</Label>
        <Input
          id="name"
          placeholder="Мой проект"
          disabled={isLoading}
          {...register("name")}
        />
        {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL-идентификатор</Label>
        <Input
          id="slug"
          placeholder="my-project"
          disabled={isLoading}
          {...register("slug")}
        />
        {errors.slug && <p className="text-sm text-error">{errors.slug.message}</p>}
        <p className="text-xs text-text-muted">
          Уникальный идентификатор для URL. Оставьте пустым для автогенерации.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          placeholder="Краткое описание проекта..."
          rows={4}
          disabled={isLoading}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-error">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Создание...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

