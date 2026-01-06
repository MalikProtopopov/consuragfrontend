"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { useUser, useUpdateUser } from "@/entities/user";
import { PageContainer } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import type { UserRole, UserStatus } from "@/shared/types/api";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: "saas_admin", label: "Администратор платформы", description: "Полный доступ ко всем функциям" },
  { value: "owner", label: "Владелец проектов", description: "Создание и управление проектами" },
  { value: "manager", label: "Менеджер", description: "Управление аватарами и документами" },
  { value: "content_manager", label: "Контент-менеджер", description: "Только управление документами" },
  { value: "client", label: "Клиент", description: "Базовый доступ" },
];

const statuses: { value: UserStatus; label: string }[] = [
  { value: "active", label: "Активен" },
  { value: "inactive", label: "Неактивен" },
  { value: "suspended", label: "Заблокирован" },
  { value: "pending", label: "Ожидает активации" },
];

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id: userId } = use(params);
  const router = useRouter();
  const { data: user, isLoading } = useUser(userId);
  const { mutate: updateUser, isPending: updating } = useUpdateUser();

  const [form, setForm] = useState({
    full_name: "",
    role: "client" as UserRole,
    status: "active" as UserStatus,
    is_email_verified: false,
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || "",
        role: user.role,
        status: user.status,
        is_email_verified: user.is_email_verified,
      });
    }
  }, [user]);

  const handleSave = () => {
    updateUser(
      { id: userId, data: form },
      {
        onSuccess: () => toast.success("Пользователь обновлен"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-[500px]" />
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-text-secondary">Пользователь не найден</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </div>

      {/* User Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex size-16 items-center justify-center rounded-xl bg-accent-primary/10 text-2xl font-bold text-accent-primary">
              {(user.full_name || user.email)
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-text-primary">
                {user.full_name || "Без имени"}
              </h1>
              <p className="text-text-muted">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant={user.status === "active" ? "success" : "secondary"}>
                  {statuses.find((s) => s.value === user.status)?.label}
                </Badge>
                <Badge variant="outline">{roles.find((r) => r.value === user.role)?.label}</Badge>
                {user.is_email_verified && <Badge variant="success">Email подтверждён</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>Информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-muted">ID</p>
                <p className="font-mono text-xs">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Проектов</p>
                <p className="font-medium">{user.projects_count}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Дата регистрации</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Последний вход</p>
                <p className="font-medium">
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleString("ru-RU")
                    : "—"}
                </p>
              </div>
              {user.last_login_ip && (
                <div>
                  <p className="text-sm text-text-muted">IP последнего входа</p>
                  <p className="font-mono text-sm">{user.last_login_ip}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Редактирование</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Имя</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="email_verified"
                checked={form.is_email_verified}
                onCheckedChange={(c) => setForm({ ...form, is_email_verified: !!c })}
              />
              <Label htmlFor="email_verified" className="font-normal">
                Email подтверждён
              </Label>
            </div>

            <Button onClick={handleSave} disabled={updating}>
              {updating ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Сохранить
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Role Selection */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Роль</CardTitle>
          <CardDescription>Определяет права доступа пользователя</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={form.role}
            onValueChange={(v) => setForm({ ...form, role: v as UserRole })}
            className="space-y-3"
          >
            {roles.map((role) => (
              <div key={role.value} className="flex items-start space-x-3">
                <RadioGroupItem value={role.value} id={role.value} className="mt-1" />
                <Label htmlFor={role.value} className="font-normal cursor-pointer">
                  <p className="font-medium">{role.label}</p>
                  <p className="text-sm text-text-muted">{role.description}</p>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Status Selection */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Статус</CardTitle>
          <CardDescription>Состояние аккаунта пользователя</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={form.status}
            onValueChange={(v) => setForm({ ...form, status: v as UserStatus })}
            className="space-y-3"
          >
            {statuses.map((status) => (
              <div key={status.value} className="flex items-center space-x-3">
                <RadioGroupItem value={status.value} id={`status-${status.value}`} />
                <Label htmlFor={`status-${status.value}`} className="font-normal cursor-pointer">
                  {status.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

