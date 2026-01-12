"use client";

import { useState, useEffect } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { useAuthStore, useUpdateProfile } from "@/entities/auth";
import { ResendVerificationButton } from "@/features/auth";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";

const roleLabels: Record<string, string> = {
  saas_admin: "Администратор платформы",
  owner: "Владелец проектов",
  manager: "Менеджер",
  content_manager: "Контент-менеджер",
  client: "Клиент",
};

export default function ProfilePage() {
  const { user, isLoading } = useAuthStore();
  const { mutate: updateProfile, isPending: updating } = useUpdateProfile();

  const [form, setForm] = useState({
    full_name: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user]);

  const handleSave = () => {
    updateProfile(form, {
      onSuccess: () => toast.success("Профиль обновлен"),
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  if (isLoading || !user) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[400px]" />
      </PageContainer>
    );
  }

  const displayName = user.full_name || user.email;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <PageContainer maxWidth="lg">
      <PageHeader title="Профиль" description="Управление личными данными" />

      {/* Email Verification Warning */}
      {!user.is_email_verified && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Email не подтверждён</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              Для полного доступа к функциям платформы подтвердите ваш email адрес.
              Проверьте почту {user.email} или запросите новое письмо.
            </p>
            <ResendVerificationButton
              email={user.email}
              variant="outline"
              size="sm"
            />
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              {user.avatar_url && <AvatarImage src={user.avatar_url} alt={displayName} />}
              <AvatarFallback className="bg-accent-primary/10 text-accent-primary text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{displayName}</h2>
              <p className="text-text-muted">{user.email}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="outline">{roleLabels[user.role] || user.role}</Badge>
                {user.is_email_verified ? (
                  <Badge variant="success">Email подтверждён</Badge>
                ) : (
                  <Badge variant="warning">Email не подтверждён</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Редактирование</CardTitle>
            <CardDescription>Измените ваши личные данные</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Имя</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Ваше имя"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar_url">URL аватара</Label>
              <Input
                id="avatar_url"
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.png"
              />
            </div>
            <Button onClick={handleSave} disabled={updating}>
              {updating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Информация об аккаунте</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-text-muted">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">ID пользователя</p>
                <p className="font-mono text-xs">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Роль</p>
                <p className="font-medium">{roleLabels[user.role] || user.role}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Дата регистрации</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString("ru-RU")}
                </p>
              </div>
              {user.last_login_at && (
                <div>
                  <p className="text-sm text-text-muted">Последний вход</p>
                  <p className="font-medium">
                    {new Date(user.last_login_at).toLocaleString("ru-RU")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

