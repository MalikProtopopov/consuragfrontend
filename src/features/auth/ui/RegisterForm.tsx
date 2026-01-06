"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRegister } from "@/entities/auth";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Spinner } from "@/shared/ui/spinner";
import { getApiErrorMessage } from "@/shared/lib";
import { registerSchema, type RegisterFormData } from "../lib/validation";

export function RegisterForm() {
  const { mutate: registerUser, isPending, error } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      full_name: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser({
      email: data.email,
      password: data.password,
      full_name: data.full_name || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="full_name">Имя (необязательно)</Label>
        <Input
          id="full_name"
          type="text"
          placeholder="Иван Петров"
          autoComplete="name"
          disabled={isPending}
          {...register("full_name")}
        />
        {errors.full_name && (
          <p className="text-sm text-error">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          disabled={isPending}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-error">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isPending}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-sm text-error">{errors.password.message}</p>
        )}
        <p className="text-xs text-text-muted">
          Минимум 8 символов, заглавная и строчная буквы, цифра
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isPending}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-error">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Регистрация...
          </>
        ) : (
          "Зарегистрироваться"
        )}
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-accent-primary hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}

