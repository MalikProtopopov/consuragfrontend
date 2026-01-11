"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Key } from "lucide-react";
import { useChangePassword } from "@/entities/auth";
import { changePasswordSchema, type ChangePasswordFormData } from "@/features/auth";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Spinner } from "@/shared/ui/spinner";
import { toast } from "sonner";
import { getApiErrorMessage, getApiErrorField } from "@/shared/lib";

export default function ChangePasswordPage() {
  const { mutate: changePassword, isPending, error } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(
      {
        current_password: data.current_password,
        new_password: data.new_password,
      },
      {
        onSuccess: () => {
          toast.success("Пароль успешно изменён");
          reset();
        },
        onError: (error) => {
          const errorMessage = getApiErrorMessage(error);
          const errorField = getApiErrorField(error);
          
          // Show error under specific field if provided
          if (errorField && errorField in data) {
            setError(errorField as keyof ChangePasswordFormData, {
              type: "server",
              message: errorMessage,
            });
          } else {
            toast.error(errorMessage);
          }
        },
      }
    );
  };

  return (
    <PageContainer maxWidth="md">
      <PageHeader title="Смена пароля" description="Обновите пароль вашего аккаунта" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Изменить пароль
          </CardTitle>
          <CardDescription>
            Введите текущий пароль и придумайте новый
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="current_password">Текущий пароль</Label>
              <Input
                id="current_password"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                {...register("current_password")}
              />
              {errors.current_password && (
                <p className="text-sm text-error">{errors.current_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">Новый пароль</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                {...register("new_password")}
              />
              {errors.new_password && (
                <p className="text-sm text-error">{errors.new_password.message}</p>
              )}
              <p className="text-xs text-text-muted">
                Минимум 8 символов, заглавная и строчная буквы, цифра
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Подтверждение пароля</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                {...register("confirm_password")}
              />
              {errors.confirm_password && (
                <p className="text-sm text-error">{errors.confirm_password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Сохранение...
                </>
              ) : (
                "Изменить пароль"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

