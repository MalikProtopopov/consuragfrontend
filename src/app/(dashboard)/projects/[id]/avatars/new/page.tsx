"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, Sliders } from "lucide-react";
import { useCreateAvatar } from "@/entities/avatar";
import { useProject } from "@/entities/project";
import { PageContainer } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import { Spinner } from "@/shared/ui/spinner";
import { Skeleton } from "@/shared/ui/skeleton";
import { toast } from "sonner";
import { cn, notifyApiError } from "@/shared/lib";
import { DEFAULT_AVATAR_COLOR } from "@/shared/config";
import type { CreateAvatarRequest } from "@/shared/types/api";
import { Step1Basic, Step2Prompts, Step3Appearance, Step4LLM } from "./_components";

interface CreateAvatarPageProps {
  params: Promise<{ id: string }>;
}

/**
 * A-05: создание аватара в один экран — обязательно только имя, остальное
 * (промпт/оформление/модель) — в «Расширенных настройках» с дефолтами.
 * llm_model не хардкодим (пусто → дефолтная модель бэкенда; снимает L-02 на фронте).
 */
export default function CreateAvatarPage({ params }: CreateAvatarPageProps) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { mutate: createAvatar, isPending } = useCreateAvatar();

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAvatarRequest>({
    name: "",
    description: "",
    system_prompt: "",
    welcome_message: "",
    fallback_message: "",
    avatar_image_url: "",
    primary_color: DEFAULT_AVATAR_COLOR,
    llm_model: "",
    llm_temperature: 0.7,
    rag_top_k: 5,
  });

  const updateForm = <K extends keyof CreateAvatarRequest>(key: K, value: CreateAvatarRequest[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canCreate = formData.name.trim().length > 0;

  const handleSubmit = () => {
    if (isPending || !canCreate) return;
    // Шлём только заполненное; пустые поля → бэкенд применит дефолты.
    const data: CreateAvatarRequest = {
      name: formData.name.trim(),
      ...(formData.description?.trim() && { description: formData.description.trim() }),
      ...(formData.system_prompt?.trim() && { system_prompt: formData.system_prompt }),
      ...(formData.welcome_message?.trim() && { welcome_message: formData.welcome_message }),
      ...(formData.fallback_message?.trim() && { fallback_message: formData.fallback_message }),
      ...(formData.avatar_image_url?.trim() && { avatar_image_url: formData.avatar_image_url }),
      ...(formData.primary_color && { primary_color: formData.primary_color }),
      ...(formData.llm_model?.trim() && { llm_model: formData.llm_model }),
      ...(typeof formData.llm_temperature === "number" && { llm_temperature: formData.llm_temperature }),
      ...(typeof formData.rag_top_k === "number" && { rag_top_k: formData.rag_top_k }),
    };

    createAvatar(
      { projectId, data },
      {
        onSuccess: () => toast.success("Аватар создан — загрузите документы, чтобы он отвечал"),
        onError: notifyApiError,
      },
    );
  };

  if (projectLoading) {
    return (
      <PageContainer maxWidth="lg">
        <Skeleton className="h-[400px]" />
      </PageContainer>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-text-secondary">Проект не найден</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <h1 className="sr-only">Создание аватара</h1>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          К аватарам
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Создание аватара</CardTitle>
          <CardDescription>
            Дайте имя — остальное настроится по умолчанию. Всё можно изменить позже.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Step1Basic formData={formData} updateForm={updateForm} />

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-text-primary"
              >
                <Sliders className="size-4 shrink-0" />
                Расширенные настройки (промпт, оформление, модель)
                <ChevronDown
                  className={cn("ml-auto size-4 transition-transform", advancedOpen && "rotate-180")}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-8 pt-6">
              <Step2Prompts formData={formData} updateForm={updateForm} />
              <Step3Appearance formData={formData} updateForm={updateForm} />
              <Step4LLM formData={formData} updateForm={updateForm} />
            </CollapsibleContent>
          </Collapsible>

          <div className="flex justify-end border-t border-border pt-6">
            <Button onClick={handleSubmit} disabled={isPending || !canCreate}>
              {isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Создание...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Создать аватар
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
