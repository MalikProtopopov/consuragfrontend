import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Регистрация | Avatar AI",
  description: "Создайте аккаунт Avatar AI",
};

export default function RegisterPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-text-primary mb-6 text-center">
        Создание аккаунта
      </h2>
      <RegisterForm />
    </div>
  );
}

