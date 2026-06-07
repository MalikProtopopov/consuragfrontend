import type { Metadata } from "next";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Вход | Avatar AI",
  description: "Войдите в свой аккаунт Avatar AI",
};

export default function LoginPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
        Вход в аккаунт
      </h2>
      <LoginForm />
    </div>
  );
}

