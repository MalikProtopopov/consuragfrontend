"use client";

import { useState } from "react";
import { Settings2, ChevronDown } from "lucide-react";
import {
  useCreateTelegramIntegration,
  useUpdateTelegramIntegration,
  useDeleteTelegramIntegration,
} from "@/entities/telegram";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { SecretInput } from "@/shared/ui/secret-input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Spinner } from "@/shared/ui/spinner";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/collapsible";
import { Checkbox } from "@/shared/ui/checkbox";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { toast } from "sonner";
import { notifyApiError } from "@/shared/lib";
import type { Avatar, TelegramIntegration } from "@/shared/types/api";
import { cleanToken } from "./cleanToken";

interface TelegramSetupFormProps {
  projectId: string;
  /** Текущая интеграция (если есть). Используется для инициализации формы. */
  integration?: TelegramIntegration;
  avatars: Avatar[];
}

function getInitialForm(integration?: TelegramIntegration) {
  return {
    bot_token: "", // Token is not returned from API for security
    default_avatar_id: integration?.default_avatar_id || integration?.default_avatar?.id || "",
    is_active: integration?.is_active ?? true,
    welcome_message: integration?.welcome_message || "",
    session_timeout_hours: integration?.session_timeout_hours ?? 12,
    user_rate_limit: integration?.user_rate_limit ?? 10,
    bot_rate_limit: integration?.bot_rate_limit ?? 100,
    rate_limit_window: integration?.rate_limit_window ?? 60,
    enable_history_command: integration?.enable_history_command ?? true,
    enable_clear_command: integration?.enable_clear_command ?? true,
  };
}

export function TelegramSetupForm({ projectId, integration, avatars }: TelegramSetupFormProps) {
  const hasIntegration = !!integration;

  const { mutate: createIntegration, isPending: creating } = useCreateTelegramIntegration();
  const { mutate: updateIntegration, isPending: updating } = useUpdateTelegramIntegration();
  const { mutate: deleteIntegration, isPending: deleting } = useDeleteTelegramIntegration();

  const [form, setForm] = useState(() => getInitialForm(integration));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleCreate = () => {
    const data = {
      ...form,
      bot_token: cleanToken(form.bot_token),
    };
    createIntegration(
      { projectId, data },
      {
        onSuccess: () => toast.success("Интеграция создана"),
        onError: (error) => notifyApiError(error),
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
        onError: (error) => notifyApiError(error),
      }
    );
  };

  const handleDelete = () => {
    deleteIntegration(projectId, {
      onSuccess: () => {
        toast.success("Интеграция удалена");
        setForm(getInitialForm());
        setDeleteDialogOpen(false);
      },
      onError: (error) => notifyApiError(error),
    });
  };

  return (
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
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                Удалить интеграцию
              </Button>
              <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Удалить Telegram интеграцию?"
                description="Бот будет отключен и прекратит отвечать на сообщения."
                confirmLabel="Удалить"
                variant="destructive"
                onConfirm={handleDelete}
                isPending={deleting}
              />
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
  );
}
