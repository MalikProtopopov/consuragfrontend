import { z } from "zod";

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email обязателен")
    .email("Некорректный email"),
  password: z
    .string()
    .min(1, "Пароль обязателен")
    .min(8, "Минимум 8 символов"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register form schema
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email обязателен")
      .email("Некорректный email"),
    password: z
      .string()
      .min(1, "Пароль обязателен")
      .min(8, "Минимум 8 символов")
      .regex(/[A-Z]/, "Должна быть хотя бы одна заглавная буква")
      .regex(/[a-z]/, "Должна быть хотя бы одна строчная буква")
      .regex(/[0-9]/, "Должна быть хотя бы одна цифра"),
    confirmPassword: z
      .string()
      .min(1, "Подтверждение пароля обязательно"),
    full_name: z
      .string()
      .max(255, "Максимум 255 символов")
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Change password form schema
 */
export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Текущий пароль обязателен"),
    new_password: z
      .string()
      .min(1, "Новый пароль обязателен")
      .min(8, "Минимум 8 символов")
      .regex(/[A-Z]/, "Должна быть хотя бы одна заглавная буква")
      .regex(/[a-z]/, "Должна быть хотя бы одна строчная буква")
      .regex(/[0-9]/, "Должна быть хотя бы одна цифра"),
    confirm_password: z
      .string()
      .min(1, "Подтверждение пароля обязательно"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Пароли не совпадают",
    path: ["confirm_password"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Profile update form schema
 */
export const profileSchema = z.object({
  full_name: z
    .string()
    .max(255, "Максимум 255 символов")
    .optional(),
  avatar_url: z
    .string()
    .url("Некорректный URL")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

