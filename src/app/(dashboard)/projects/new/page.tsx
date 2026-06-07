"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCreateProject } from "@/entities/project";
import { ProjectForm } from "@/features/project";
import { PageContainer } from "@/widgets/app-shell";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { toast } from "sonner";
import { notifyApiError } from "@/shared/lib";

export default function CreateProjectPage() {
  const router = useRouter();
  const { mutate: createProject, isPending } = useCreateProject();

  const handleSubmit = (data: { name: string; description?: string; slug?: string }) => {
    createProject(data, {
      onSuccess: () => {
        toast.success("Проект успешно создан");
      },
      onError: (error) => {
        notifyApiError(error);
      },
    });
  };

  return (
    <PageContainer maxWidth="lg">
      <h1 className="sr-only">Создание проекта</h1>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Создание проекта</CardTitle>
          <CardDescription>
            Создайте новый проект для организации ваших AI-аватаров и документов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm onSubmit={handleSubmit} isLoading={isPending} />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

