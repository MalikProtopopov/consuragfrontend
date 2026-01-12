"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useCreateAvatar } from "@/entities/avatar";
import { useProject } from "@/entities/project";
import { PageContainer } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Stepper, StepperItem } from "@/shared/ui/stepper";
import { Spinner } from "@/shared/ui/spinner";
import { Skeleton } from "@/shared/ui/skeleton";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import type { CreateAvatarRequest } from "@/shared/types/api";

interface CreateAvatarPageProps {
  params: Promise<{ id: string }>;
}

const steps = [
  { title: "Основное", description: "Название и описание" },
  { title: "Промпты", description: "Настройки поведения" },
  { title: "Внешний вид", description: "Оформление" },
  { title: "LLM", description: "Параметры модели" },
];

export default function CreateAvatarPage({ params }: CreateAvatarPageProps) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { mutate: createAvatar, isPending } = useCreateAvatar();

  const isSubmittingRef = useRef(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CreateAvatarRequest>({
    name: "",
    description: "",
    system_prompt: "",
    welcome_message: "",
    fallback_message: "",
    avatar_image_url: "",
    primary_color: "#ffcd33",
    llm_model: "gpt-4-turbo-preview",
    llm_temperature: 0.7,
    rag_top_k: 5,
  });

  const updateForm = <K extends keyof CreateAvatarRequest>(key: K, value: CreateAvatarRequest[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canGoNext = () => {
    if (currentStep === 0) {
      return formData.name.trim().length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    if (isSubmittingRef.current || isPending) return;
    isSubmittingRef.current = true;

    createAvatar(
      { projectId, data: formData },
      {
        onSuccess: () => {
          toast.success("Аватар успешно создан");
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
        },
        onSettled: () => {
          isSubmittingRef.current = false;
        },
      }
    );
  };

  if (projectLoading) {
    return (
      <PageContainer maxWidth="lg">
        <Skeleton className="h-[600px]" />
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
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? "К аватарам" : "Назад"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Создание аватара</CardTitle>
          <CardDescription>Настройте вашего AI-консультанта</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stepper */}
          <Stepper currentStep={currentStep} className="mb-8">
            {steps.map((step, index) => (
              <StepperItem
                key={index}
                title={step.title}
                description={step.description}
                isCompleted={index < currentStep}
                isCurrent={index === currentStep}
              />
            ))}
          </Stepper>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {currentStep === 0 && (
              <Step1Basic formData={formData} updateForm={updateForm} />
            )}
            {currentStep === 1 && (
              <Step2Prompts formData={formData} updateForm={updateForm} />
            )}
            {currentStep === 2 && (
              <Step3Appearance formData={formData} updateForm={updateForm} />
            )}
            {currentStep === 3 && (
              <Step4LLM formData={formData} updateForm={updateForm} />
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentStep === 0 ? "Отмена" : "Назад"}
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} disabled={!canGoNext()}>
                Далее
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isPending || !canGoNext()}>
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
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

// Step 1: Basic Info
function Step1Basic({
  formData,
  updateForm,
}: {
  formData: CreateAvatarRequest;
  updateForm: <K extends keyof CreateAvatarRequest>(key: K, value: CreateAvatarRequest[K]) => void;
}) {
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

// Step 2: Prompts
function Step2Prompts({
  formData,
  updateForm,
}: {
  formData: CreateAvatarRequest;
  updateForm: <K extends keyof CreateAvatarRequest>(key: K, value: CreateAvatarRequest[K]) => void;
}) {
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

// Step 3: Appearance
function Step3Appearance({
  formData,
  updateForm,
}: {
  formData: CreateAvatarRequest;
  updateForm: <K extends keyof CreateAvatarRequest>(key: K, value: CreateAvatarRequest[K]) => void;
}) {
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
            value={formData.primary_color || "#ffcd33"}
            onChange={(e) => updateForm("primary_color", e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input
            value={formData.primary_color || "#ffcd33"}
            onChange={(e) => updateForm("primary_color", e.target.value)}
            placeholder="#ffcd33"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}

// Step 4: LLM Settings
function Step4LLM({
  formData,
  updateForm,
}: {
  formData: CreateAvatarRequest;
  updateForm: <K extends keyof CreateAvatarRequest>(key: K, value: CreateAvatarRequest[K]) => void;
}) {
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

