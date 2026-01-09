"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Check, X, Settings2, BarChart3, MessageSquare, ChevronDown, Copy, Link2, Bot } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import { Checkbox } from "@/shared/ui/checkbox";
import { ROUTES } from "@/shared/config";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";

interface TelegramPageProps {
  params: Promise<{ id: string }>;
}

export default function TelegramPage({ params }: TelegramPageProps) {
  const { id: projectId } = use(params);
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: integration, isLoading: integrationLoading, error: integrationError } = useTelegramIntegration(projectId);
  const { data: avatarsData } = useAvatars(projectId);

  const { mutate: createIntegration, isPending: creating } = useCreateTelegramIntegration();
  const { mutate: updateIntegration, isPending: updating } = useUpdateTelegramIntegration();
  const { mutate: deleteIntegration, isPending: deleting } = useDeleteTelegramIntegration();
  const { mutate: setWebhook, isPending: settingWebhook } = useSetTelegramWebhook();
  const { mutate: deleteWebhook, isPending: deletingWebhook } = useDeleteTelegramWebhook();

  const [form, setForm] = useState({
    bot_token: "",
    default_avatar_id: "",
    is_active: true,
    welcome_message: "",
    // Advanced settings
    session_timeout_hours: 12,
    user_rate_limit: 10,
    bot_rate_limit: 100,
    rate_limit_window: 60,
    enable_history_command: true,
    enable_clear_command: true,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const hasIntegration = !!integration && !integrationError;
  const avatars = avatarsData?.items || [];


  // Initialize form when integration loads
  useEffect(() => {
    if (integration) {
      const avatarId = integration.default_avatar_id || integration.default_avatar?.id || "";
      
      // Use setTimeout to ensure state update happens after React StrictMode's effect cleanup
      setTimeout(() => {
        setForm((prev) => ({
          ...prev,
          bot_token: "", // Token is not returned from API for security
          default_avatar_id: avatarId,
          is_active: integration.is_active,
          welcome_message: integration.welcome_message || "",
          session_timeout_hours: integration.session_timeout_hours ?? 12,
          user_rate_limit: integration.user_rate_limit ?? 10,
          bot_rate_limit: integration.bot_rate_limit ?? 100,
          rate_limit_window: integration.rate_limit_window ?? 60,
          enable_history_command: integration.enable_history_command ?? true,
          enable_clear_command: integration.enable_clear_command ?? true,
        }));
      }, 0);
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
      default_avatar_id: form.default_avatar_id,
      welcome_message: form.welcome_message,
      is_active: form.is_active,
      // Advanced settings
      session_timeout_hours: form.session_timeout_hours,
      user_rate_limit: form.user_rate_limit,
      bot_rate_limit: form.bot_rate_limit,
      rate_limit_window: form.rate_limit_window,
      enable_history_command: form.enable_history_command,
      enable_clear_command: form.enable_clear_command,
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
        setForm({
          bot_token: "",
          default_avatar_id: "",
          is_active: true,
          welcome_message: "",
          session_timeout_hours: 12,
          user_rate_limit: 10,
          bot_rate_limit: 100,
          rate_limit_window: 60,
          enable_history_command: true,
          enable_clear_command: true,
        });
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

      {/* Avatar Warning */}
      {hasIntegration && !integration.default_avatar_id && (
        <Alert className="mb-6 border-warning bg-warning/10">
          <AlertDescription className="text-warning">
            <strong>Аватар не выбран!</strong> Бот не сможет отвечать на сообщения пока не будет выбран аватар.
            Выберите аватар в настройках ниже.
          </AlertDescription>
        </Alert>
      )}

      {/* Status Card */}
      {hasIntegration && (
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                    {integration.is_webhook_active ? (
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
              <div className="flex flex-wrap gap-2">
                {integration.is_webhook_active ? (
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

            {/* Webhook URL Section */}
            {integration.webhook_url && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-secondary">Webhook URL</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={integration.webhook_url}
                    readOnly
                    className="font-mono text-xs bg-bg-secondary"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(integration.webhook_url || "");
                      toast.success("URL скопирован");
                    }}
                    title="Копировать URL"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Selected Avatar Section */}
            {integration.default_avatar && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="h-4 w-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-secondary">Аватар для ответов</span>
                </div>
                <div className="flex items-center gap-3">
                  {integration.default_avatar.avatar_image_url ? (
                    <div 
                      className="size-10 rounded-lg overflow-hidden flex-shrink-0"
                      style={integration.default_avatar.primary_color ? {
                        boxShadow: `0 0 0 2px ${integration.default_avatar.primary_color}20`
                      } : undefined}
                    >
                      <img
                        src={integration.default_avatar.avatar_image_url}
                        alt={integration.default_avatar.name}
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div 
                      className="size-10 rounded-lg bg-bg-secondary flex items-center justify-center flex-shrink-0"
                      style={integration.default_avatar.primary_color ? {
                        backgroundColor: `${integration.default_avatar.primary_color}20`
                      } : undefined}
                    >
                      <Bot 
                        className="size-5" 
                        style={integration.default_avatar.primary_color ? {
                          color: integration.default_avatar.primary_color
                        } : undefined}
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary truncate">
                      {integration.default_avatar.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge 
                        variant={integration.default_avatar.is_published ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {integration.default_avatar.is_published ? "Опубликован" : "Черновик"}
                      </Badge>
                      {integration.default_avatar.description && (
                        <span className="text-xs text-text-muted truncate">
                          {integration.default_avatar.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Cards */}
      {hasIntegration && (
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <Link href={ROUTES.TELEGRAM_STATS(projectId)}>
            <Card className="hover:border-accent-primary transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent-primary/10">
                    <BarChart3 className="size-5 text-accent-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Статистика</p>
                    <p className="text-sm text-text-muted">Просмотр метрик и событий</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href={ROUTES.TELEGRAM_SESSIONS(projectId)}>
            <Card className="hover:border-accent-primary transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-accent-primary/10">
                    <MessageSquare className="size-5 text-accent-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">Сессии</p>
                    <p className="text-sm text-text-muted">История чатов пользователей</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
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
            <Label>Аватар <span className="text-error">*</span></Label>
            <Select
              value={form.default_avatar_id}
              onValueChange={(v) => setForm({ ...form, default_avatar_id: v })}
            >
              <SelectTrigger className={!form.default_avatar_id ? "border-warning" : ""}>
                <SelectValue placeholder="Выберите аватар" />
              </SelectTrigger>
              <SelectContent>
                {/* Show integration's current avatar first if it's not in loaded avatars list */}
                {integration?.default_avatar && 
                  !avatars.some(a => a.id === integration.default_avatar?.id) && (
                    <SelectItem key={integration.default_avatar.id} value={integration.default_avatar.id}>
                      {integration.default_avatar.name}
                    </SelectItem>
                  )}
                {avatars.map((avatar) => (
                  <SelectItem key={avatar.id} value={avatar.id}>
                    {avatar.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!form.default_avatar_id ? (
              <p className="text-xs text-warning">
                Выберите аватар для ответов бота. Без аватара бот не сможет отвечать на сообщения.
              </p>
            ) : (
              <p className="text-xs text-text-muted">
                Аватар, который будет отвечать на сообщения в Telegram
              </p>
            )}
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

          {/* Advanced Settings */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Расширенные настройки
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-6">
              {/* Session Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-text-primary">Настройки сессий</h4>
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Таймаут сессии (часы)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    min={1}
                    max={168}
                    value={form.session_timeout_hours}
                    onChange={(e) => setForm({ ...form, session_timeout_hours: parseInt(e.target.value) || 12 })}
                  />
                  <p className="text-xs text-text-muted">
                    После этого времени создается новый контекст (1-168 часов)
                  </p>
                </div>
              </div>

              {/* Rate Limiting */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-text-primary">Ограничение запросов</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="user_rate_limit">Лимит пользователя</Label>
                    <Input
                      id="user_rate_limit"
                      type="number"
                      min={1}
                      max={100}
                      value={form.user_rate_limit}
                      onChange={(e) => setForm({ ...form, user_rate_limit: parseInt(e.target.value) || 10 })}
                    />
                    <p className="text-xs text-text-muted">сообщ./мин (1-100)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bot_rate_limit">Лимит бота</Label>
                    <Input
                      id="bot_rate_limit"
                      type="number"
                      min={10}
                      max={1000}
                      value={form.bot_rate_limit}
                      onChange={(e) => setForm({ ...form, bot_rate_limit: parseInt(e.target.value) || 100 })}
                    />
                    <p className="text-xs text-text-muted">сообщ./мин (10-1000)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate_limit_window">Окно лимита</Label>
                    <Input
                      id="rate_limit_window"
                      type="number"
                      min={10}
                      max={300}
                      value={form.rate_limit_window}
                      onChange={(e) => setForm({ ...form, rate_limit_window: parseInt(e.target.value) || 60 })}
                    />
                    <p className="text-xs text-text-muted">секунд (10-300)</p>
                  </div>
                </div>
              </div>

              {/* Bot Commands */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-text-primary">Команды бота</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable_history"
                      checked={form.enable_history_command}
                      onCheckedChange={(c) => setForm({ ...form, enable_history_command: c === true })}
                    />
                    <Label htmlFor="enable_history" className="font-normal">
                      Включить команду /history
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable_clear"
                      checked={form.enable_clear_command}
                      onCheckedChange={(c) => setForm({ ...form, enable_clear_command: c === true })}
                    />
                    <Label htmlFor="enable_clear" className="font-normal">
                      Включить команду /clear
                    </Label>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

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
                <Button onClick={handleUpdate} disabled={updating || !form.default_avatar_id}>
                  {updating && <Spinner className="mr-2 h-4 w-4" />}
                  Сохранить
                </Button>
              </>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={creating || !form.bot_token || !form.default_avatar_id}
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
