"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { useVerifyEmail, useResendVerification } from "@/entities/auth";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { getApiErrorMessage } from "@/shared/lib";

type VerificationStatus = "loading" | "success" | "error" | "no-token";

interface ApiErrorWithDetails {
  error?: {
    code?: string;
    details?: {
      wait_seconds?: number;
    };
  };
  code?: string;
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>(
    token ? "loading" : "no-token"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resendEmail, setResendEmail] = useState("");

  const { mutate: verifyEmail } = useVerifyEmail();
  const { mutate: resendVerification, isPending: resending } =
    useResendVerification();

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((c) => c - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [cooldown]);

  // Verify email on mount
  useEffect(() => {
    if (!token) return;

    verifyEmail(token, {
      onSuccess: (data) => {
        setStatus("success");
        setVerifiedEmail(data.email);
      },
      onError: (error) => {
        setStatus("error");
        setErrorMessage(getApiErrorMessage(error));
        const apiError = error as ApiErrorWithDetails;
        setErrorCode(apiError.error?.code || apiError.code || null);
      },
    });
  }, [token, verifyEmail]);

  const handleResend = useCallback(() => {
    if (!resendEmail || cooldown > 0) return;

    resendVerification(resendEmail, {
      onSuccess: () => {
        setCooldown(300); // 5 minutes
      },
      onError: (error) => {
        const apiError = error as ApiErrorWithDetails;
        if (apiError.error?.code === "AUTH_EMAIL_RESEND_COOLDOWN") {
          const waitSeconds = apiError.error.details?.wait_seconds || 300;
          setCooldown(waitSeconds);
        } else {
          setErrorMessage(getApiErrorMessage(error));
        }
      },
    });
  }, [resendEmail, cooldown, resendVerification]);

  const formatCooldown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // No token state
  if (status === "no-token") {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
          <XCircle className="w-6 h-6 text-warning" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          Токен не найден
        </h2>
        <p className="text-text-secondary">
          В ссылке отсутствует токен подтверждения.
          <br />
          Убедитесь, что вы перешли по полной ссылке из письма.
        </p>
        <div className="pt-4">
          <Button asChild>
            <Link href="/login">Перейти ко входу</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          Подтверждаем ваш email...
        </h2>
        <p className="text-text-secondary">Пожалуйста, подождите</p>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-success" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          Email подтверждён!
        </h2>
        <p className="text-text-secondary">
          {verifiedEmail && (
            <>
              Адрес <span className="font-medium">{verifiedEmail}</span>{" "}
              успешно подтверждён.
              <br />
            </>
          )}
          Теперь вы можете войти в систему.
        </p>
        <div className="pt-4">
          <Button onClick={() => router.push("/login")}>Войти в систему</Button>
        </div>
      </div>
    );
  }

  // Error state
  const isAlreadyVerified = errorCode === "AUTH_EMAIL_ALREADY_VERIFIED";
  const isExpiredOrInvalid =
    errorCode === "AUTH_TOKEN_EXPIRED" || errorCode === "AUTH_INVALID_TOKEN";

  return (
    <div className="text-center space-y-4">
      <div
        className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
          isAlreadyVerified ? "bg-success/10" : "bg-error/10"
        }`}
      >
        {isAlreadyVerified ? (
          <CheckCircle2 className="w-6 h-6 text-success" />
        ) : (
          <XCircle className="w-6 h-6 text-error" />
        )}
      </div>
      <h2 className="text-xl font-semibold text-text-primary">
        {isAlreadyVerified ? "Email уже подтверждён" : "Ошибка подтверждения"}
      </h2>
      <p className="text-text-secondary">{errorMessage}</p>

      {isAlreadyVerified ? (
        <div className="pt-4">
          <Button onClick={() => router.push("/login")}>Войти в систему</Button>
        </div>
      ) : isExpiredOrInvalid ? (
        <div className="pt-4 space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Введите ваш email для получения нового письма подтверждения
            </AlertDescription>
          </Alert>
          <input
            type="email"
            placeholder="Ваш email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-bg-primary text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
          <Button
            onClick={handleResend}
            disabled={resending || cooldown > 0 || !resendEmail}
            className="w-full"
          >
            {cooldown > 0
              ? `Отправить повторно (${formatCooldown(cooldown)})`
              : resending
                ? "Отправка..."
                : "Отправить письмо повторно"}
          </Button>
          <p className="text-sm text-text-muted">
            Или{" "}
            <Link href="/login" className="text-accent-primary hover:underline">
              войти в систему
            </Link>
          </p>
        </div>
      ) : (
        <div className="pt-4 flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/register")}>
            Регистрация
          </Button>
          <Button onClick={() => router.push("/login")}>Войти</Button>
        </div>
      )}
    </div>
  );
}

