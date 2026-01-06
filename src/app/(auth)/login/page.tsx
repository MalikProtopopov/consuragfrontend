import type { Metadata } from "next";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Вход | AI Avatar Platform",
  description: "Войдите в свой аккаунт AI Avatar Platform",
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

