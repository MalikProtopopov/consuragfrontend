"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useCreateUser } from "@/entities/user";
import { PageContainer } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";
import { Spinner } from "@/shared/ui/spinner";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";
import type { UserRole, UserStatus } from "@/shared/types/api";

export default function CreateUserPage() {
  const router = useRouter();
  const { mutate: createUser, isPending } = useCreateUser();

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "client" as UserRole,
    status: "active" as UserStatus,
    is_email_verified: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser(form, {
      onSuccess: () => {
        toast.success("Пользователь создан");
        router.push("/admin/users");
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    });
  };

  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Создание пользователя</CardTitle>
          <CardDescription>Добавьте нового пользователя в платформу</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Имя</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="saas_admin">Администратор</SelectItem>
                    <SelectItem value="owner">Владелец</SelectItem>
                    <SelectItem value="manager">Менеджер</SelectItem>
                    <SelectItem value="content_manager">Контент-менеджер</SelectItem>
                    <SelectItem value="client">Клиент</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as UserStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="inactive">Неактивен</SelectItem>
                    <SelectItem value="pending">Ожидает активации</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Отмена
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Создание...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Создать
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

