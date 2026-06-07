"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useCreateAvatar } from "@/entities/avatar";
import { useProject } from "@/entities/project";
import { PageContainer } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Stepper, StepperItem } from "@/shared/ui/stepper";
import { Spinner } from "@/shared/ui/spinner";
import { Skeleton } from "@/shared/ui/skeleton";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import { DEFAULT_AVATAR_COLOR } from "@/shared/config";
import type { CreateAvatarRequest } from "@/shared/types/api";
import {
  steps,
  Step1Basic,
  Step2Prompts,
  Step3Appearance,
  Step4LLM,
} from "./_components";

interface CreateAvatarPageProps {
  params: Promise<{ id: string }>;
}

export default function CreateAvatarPage({ params }: CreateAvatarPageProps) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { mutate: createAvatar, isPending } = useCreateAvatar();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CreateAvatarRequest>({
    name: "",
    description: "",
    system_prompt: "",
    welcome_message: "",
    fallback_message: "",
    avatar_image_url: "",
    primary_color: DEFAULT_AVATAR_COLOR,
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
    if (isSubmitting || isPending) return;
    setIsSubmitting(true);

    createAvatar(
      { projectId, data: formData },
      {
        onSuccess: () => {
          toast.success("Аватар успешно создан");
          // Не сбрасываем isSubmitting - редирект произойдет автоматически из useCreateAvatar
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error));
          setIsSubmitting(false);
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
            {currentStep === 0 && <Step1Basic formData={formData} updateForm={updateForm} />}
            {currentStep === 1 && <Step2Prompts formData={formData} updateForm={updateForm} />}
            {currentStep === 2 && <Step3Appearance formData={formData} updateForm={updateForm} />}
            {currentStep === 3 && <Step4LLM formData={formData} updateForm={updateForm} />}
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
              <Button onClick={handleSubmit} disabled={isSubmitting || isPending || !canGoNext()}>
                {isSubmitting || isPending ? (
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
