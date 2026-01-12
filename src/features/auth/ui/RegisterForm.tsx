"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, CheckCircle2 } from "lucide-react";
import { useRegister } from "@/entities/auth";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/shared/ui/password-input";
import { Label } from "@/shared/ui/label";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Spinner } from "@/shared/ui/spinner";
import { getApiErrorMessage } from "@/shared/lib";
import { registerSchema, type RegisterFormData } from "../lib/validation";
import { ResendVerificationButton } from "./ResendVerificationButton";

export function RegisterForm() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
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
    registerUser(
      {
        email: data.email,
        password: data.password,
        full_name: data.full_name || undefined,
      },
      {
        onSuccess: ({ email }) => {
          setRegisteredEmail(email);
        },
      }
    );
  };

  // Show email verification screen after successful registration
  if (registeredEmail) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center">
          <Mail className="w-8 h-8 text-accent-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-text-primary">
            Подтвердите ваш email
          </h2>
          <p className="text-text-secondary">
            Мы отправили письмо на адрес:
          </p>
          <p className="font-medium text-text-primary">{registeredEmail}</p>
        </div>

        <div className="p-4 bg-bg-tertiary rounded-lg text-sm text-text-secondary space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            <p>Перейдите по ссылке в письме для активации аккаунта</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            <p>Ссылка действительна 24 часа</p>
          </div>
        </div>

        <div className="pt-2">
          <ResendVerificationButton
            email={registeredEmail}
            variant="outline"
            className="w-full"
            initialCooldown={300}
          />
        </div>

        <p className="text-sm text-text-muted">
          Не получили письмо? Проверьте папку «Спам»
        </p>

        <div className="pt-2 border-t border-border">
          <p className="text-sm text-text-secondary pt-4">
            Уже подтвердили email?{" "}
            <Link href="/login" className="text-accent-primary hover:underline">
              Войти в систему
            </Link>
          </p>
        </div>
      </div>
    );
  }

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
        <PasswordInput
          id="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isPending}
          error={!!errors.password}
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
        <PasswordInput
          id="confirmPassword"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isPending}
          error={!!errors.confirmPassword}
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
