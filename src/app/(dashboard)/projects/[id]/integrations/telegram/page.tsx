"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Check, X } from "lucide-react";
import { useProject } from "@/entities/project";
import {
  useTelegramIntegration,
  useCreateTelegramIntegration,
  useUpdateTelegramIntegration,
  useDeleteTelegramIntegration,
  useSetTelegramWebhook,
  useDeleteTelegramWebhook,
  WebhookConfigError,
} from "@/entities/telegram";
import { useAvatars } from "@/entities/avatar";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SecretInput } from "@/shared/ui/secret-input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Badge } from "@/shared/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/shared/ui/dialog";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";

interface TelegramPageProps {
  params: Promise<{ id: string }>;
}

export default function TelegramPage({ params }: TelegramPageProps) {
  const { id: projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: integration, isLoading: integrationLoading, error: integrationError } = useTelegramIntegration(projectId);
  const { data: avatarsData } = useAvatars(projectId, { status: "active" });

  const { mutate: createIntegration, isPending: creating } = useCreateTelegramIntegration();
  const { mutate: updateIntegration, isPending: updating } = useUpdateTelegramIntegration();
  const { mutate: deleteIntegration, isPending: deleting } = useDeleteTelegramIntegration();
  const { mutate: setWebhook, isPending: settingWebhook } = useSetTelegramWebhook();
  const { mutate: deleteWebhook, isPending: deletingWebhook } = useDeleteTelegramWebhook();

  const [form, setForm] = useState({
    bot_token: "",
    avatar_id: "",
    is_active: true,
    welcome_message: "",
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const hasIntegration = !!integration && !integrationError;
  const avatars = avatarsData?.items || [];

  // Initialize form when integration loads
  useEffect(() => {
    if (integration) {
      setForm({
        bot_token: "", // Token is not returned from API for security
        avatar_id: integration.avatar_id || "",
        is_active: integration.is_active,
        welcome_message: integration.welcome_message || "",
      });
    }
  }, [integration]);

  // Clean token from invisible characters and whitespace
  const cleanToken = (token: string) => {
    return token
      .trim()
      .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "") // Remove zero-width and non-breaking spaces
      .replace(/\s/g, ""); // Remove any remaining whitespace
  };

  const handleCreate = () => {
    const data = {
      ...form,
      bot_token: cleanToken(form.bot_token),
    };
    createIntegration(
      { projectId, data },
      {
        onSuccess: () => toast.success("Интеграция создана"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleUpdate = () => {
    const cleanedToken = cleanToken(form.bot_token);
    // Only include bot_token if user entered a new value
    const data = {
      avatar_id: form.avatar_id,
      welcome_message: form.welcome_message,
      is_active: form.is_active,
      ...(cleanedToken && { bot_token: cleanedToken }),
    };
    updateIntegration(
      { projectId, data },
      {
        onSuccess: () => toast.success("Интеграция обновлена"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  const handleDelete = () => {
    deleteIntegration(projectId, {
      onSuccess: () => {
        toast.success("Интеграция удалена");
        setForm({ bot_token: "", avatar_id: "", is_active: true, welcome_message: "" });
        setDeleteDialogOpen(false);
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  const handleSetWebhook = () => {
    setWebhook(projectId, {
      onSuccess: () => toast.success("Webhook успешно установлен!"),
      onError: (error) => {
        // Handle specific webhook configuration error
        if (error instanceof WebhookConfigError) {
          toast.error(error.message);
          return;
        }
        // Handle other API errors
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  const handleDeleteWebhook = () => {
    deleteWebhook(projectId, {
      onSuccess: () => toast.success("Webhook удален"),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  const isLoading = projectLoading || integrationLoading;

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
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
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            К проекту
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Telegram интеграция"
        description="Подключите бота Telegram к вашему AI-аватару"
      />

      {/* Status Card */}
      {hasIntegration && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#0088cc]/10">
                  <Send className="size-6 text-[#0088cc]" />
                </div>
                <div>
                  <p className="font-medium text-text-primary">
                    @{integration.bot_username || "bot"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={integration.is_active ? "success" : "secondary"}>
                      {integration.is_active ? "Активен" : "Неактивен"}
                    </Badge>
                    {integration.webhook_set ? (
                      <Badge variant="success">
                        <Check className="mr-1 h-3 w-3" />
                        Webhook
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <X className="mr-1 h-3 w-3" />
                        Webhook
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {integration.webhook_set ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteWebhook}
                    disabled={deletingWebhook}
                  >
                    {deletingWebhook ? <Spinner className="h-4 w-4" /> : "Удалить webhook"}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSetWebhook}
                    disabled={settingWebhook}
                  >
                    {settingWebhook ? <Spinner className="h-4 w-4" /> : "Установить webhook"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup / Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>{hasIntegration ? "Настройки" : "Настройка бота"}</CardTitle>
          <CardDescription>
            {hasIntegration
              ? "Измените настройки Telegram бота"
              : "Введите токен бота от @BotFather"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasIntegration && (
            <Alert>
              <AlertDescription>
                1. Создайте бота через @BotFather в Telegram
                <br />
                2. Скопируйте токен бота
                <br />
                3. Вставьте токен в поле ниже
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="bot_token">
              {hasIntegration ? "Новый токен бота (опционально)" : "Токен бота"}{" "}
              {!hasIntegration && <span className="text-error">*</span>}
            </Label>
            <SecretInput
              id="bot_token"
              value={form.bot_token}
              onChange={(value) => setForm({ ...form, bot_token: value })}
              maskedValue={integration?.masked_bot_token ?? undefined}
              placeholder={hasIntegration ? "Оставьте пустым, чтобы не менять" : "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"}
            />
            {hasIntegration ? (
              <p className="text-xs text-text-muted">
                Оставьте пустым, чтобы сохранить текущий токен
              </p>
            ) : (
              <p className="text-xs text-text-muted">
                Получите токен от @BotFather в Telegram
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Аватар *</Label>
            <Select
              value={form.avatar_id}
              onValueChange={(v) => setForm({ ...form, avatar_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите аватар" />
              </SelectTrigger>
              <SelectContent>
                {avatars.map((avatar) => (
                  <SelectItem key={avatar.id} value={avatar.id}>
                    {avatar.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-text-muted">
              Аватар, который будет отвечать на сообщения в Telegram
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="welcome_message">Приветственное сообщение</Label>
            <Input
              id="welcome_message"
              value={form.welcome_message}
              onChange={(e) => setForm({ ...form, welcome_message: e.target.value })}
              placeholder="Привет! Я AI-помощник..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={form.is_active}
              onCheckedChange={(c) => setForm({ ...form, is_active: c })}
            />
            <Label htmlFor="is_active" className="font-normal">
              Бот активен
            </Label>
          </div>

          <div className="flex justify-between">
            {hasIntegration ? (
              <>
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Удалить интеграцию</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Удалить Telegram интеграцию?</DialogTitle>
                    </DialogHeader>
                    <p className="text-text-secondary">
                      Бот будет отключен и прекратит отвечать на сообщения.
                    </p>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                        {deleting && <Spinner className="mr-2 h-4 w-4" />}
                        Удалить
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={handleUpdate} disabled={updating}>
                  {updating && <Spinner className="mr-2 h-4 w-4" />}
                  Сохранить
                </Button>
              </>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={creating || !form.bot_token || !form.avatar_id}
                className="ml-auto"
              >
                {creating && <Spinner className="mr-2 h-4 w-4" />}
                Подключить бота
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

