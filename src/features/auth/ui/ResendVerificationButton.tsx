"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail } from "lucide-react";
import { useResendVerification } from "@/entities/auth";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib";

interface ApiErrorWithDetails {
  error?: {
    code?: string;
    details?: {
      wait_seconds?: number;
    };
  };
  code?: string;
}

interface ResendVerificationButtonProps {
  email: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  initialCooldown?: number;
}

export function ResendVerificationButton({
  email,
  variant = "outline",
  size = "default",
  className,
  showIcon = true,
  initialCooldown = 0,
}: ResendVerificationButtonProps) {
  const [cooldown, setCooldown] = useState(initialCooldown);
  const { mutate: resendVerification, isPending } = useResendVerification();

  // Countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((c) => c - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [cooldown]);

  const formatCooldown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = useCallback(() => {
    if (!email || cooldown > 0 || isPending) return;

    resendVerification(email, {
      onSuccess: () => {
        setCooldown(300); // 5 minutes
        toast.success("Письмо отправлено", {
          description: "Проверьте вашу почту для подтверждения email",
        });
      },
      onError: (error) => {
        const apiError = error as ApiErrorWithDetails;
        if (apiError.error?.code === "AUTH_EMAIL_RESEND_COOLDOWN") {
          const waitSeconds = apiError.error.details?.wait_seconds || 300;
          setCooldown(waitSeconds);
          toast.info("Подождите", {
            description: `Повторная отправка будет доступна через ${formatCooldown(waitSeconds)}`,
          });
        } else if (apiError.error?.code === "AUTH_EMAIL_ALREADY_VERIFIED") {
          toast.success("Email уже подтверждён", {
            description: "Вы можете войти в систему",
          });
        } else {
          toast.error("Ошибка", {
            description: getApiErrorMessage(error),
          });
        }
      },
    });
  }, [email, cooldown, isPending, resendVerification]);

  const isDisabled = isPending || cooldown > 0 || !email;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleResend}
      disabled={isDisabled}
      className={className}
    >
      {isPending ? (
        <>
          <Spinner className="mr-2 h-4 w-4" />
          Отправка...
        </>
      ) : cooldown > 0 ? (
        <>
          {showIcon && <Mail className="mr-2 h-4 w-4" />}
          Повторно через {formatCooldown(cooldown)}
        </>
      ) : (
        <>
          {showIcon && <Mail className="mr-2 h-4 w-4" />}
          Отправить письмо повторно
        </>
      )}
    </Button>
  );
}

