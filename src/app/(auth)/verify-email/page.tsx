"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { EMAIL_RESEND_COOLDOWN_SEC } from "@/shared/config";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { useVerifyEmail, useResendVerification } from "@/entities/auth";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { getApiErrorMessage, useCountdown } from "@/shared/lib";
import {
  getResendCooldownSeconds,
  type ApiErrorWithDetails,
} from "@/features/auth/lib/resend-cooldown";

type VerificationStatus = "loading" | "success" | "error" | "no-token";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>(
    token ? "loading" : "no-token"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const {
    isActive: cooldownActive,
    formatted: cooldownFormatted,
    start: startCooldown,
  } = useCountdown();

  const { mutate: verifyEmail } = useVerifyEmail();
  const { mutate: resendVerification, isPending: resending } =
    useResendVerification();

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
    if (!resendEmail || cooldownActive) return;

    resendVerification(resendEmail, {
      onSuccess: () => {
        startCooldown(EMAIL_RESEND_COOLDOWN_SEC); // 5 minutes
      },
      onError: (error) => {
        const waitSeconds = getResendCooldownSeconds(error);
        if (waitSeconds !== null) {
          startCooldown(waitSeconds);
        } else {
          setErrorMessage(getApiErrorMessage(error));
        }
      },
    });
  }, [resendEmail, cooldownActive, resendVerification, startCooldown]);

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
          <Button variant="gradient" asChild>
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
          <Button variant="gradient" onClick={() => router.push("/login")}>
            Войти в систему
          </Button>
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
          <Button variant="gradient" onClick={() => router.push("/login")}>
            Войти в систему
          </Button>
        </div>
      ) : isExpiredOrInvalid ? (
        <div className="pt-4 space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Введите ваш email для получения нового письма подтверждения
            </AlertDescription>
          </Alert>
          <Input
            type="email"
            placeholder="Ваш email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
          />
          <Button
            variant="gradient"
            onClick={handleResend}
            disabled={resending || cooldownActive || !resendEmail}
            className="w-full"
          >
            {cooldownActive
              ? `Отправить повторно (${cooldownFormatted})`
              : resending
                ? "Отправка..."
                : "Отправить письмо повторно"}
          </Button>
          <p className="text-sm text-text-muted">
            Или{" "}
            <Link href="/login" className="text-primary-link hover:underline">
              войти в систему
            </Link>
          </p>
        </div>
      ) : (
        <div className="pt-4 flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/register")}>
            Регистрация
          </Button>
          <Button variant="gradient" onClick={() => router.push("/login")}>
            Войти
          </Button>
        </div>
      )}
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-accent-primary animate-spin" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary">
        Загрузка...
      </h2>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
