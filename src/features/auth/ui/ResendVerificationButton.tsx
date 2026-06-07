"use client";

import { useCallback } from "react";
import { EMAIL_RESEND_COOLDOWN_SEC } from "@/shared/config";
import { Mail } from "lucide-react";
import { useResendVerification } from "@/entities/auth";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { toast } from "sonner";
import { getApiErrorMessage, useCountdown, formatDuration } from "@/shared/lib";
import {
  getResendCooldownSeconds,
  type ApiErrorWithDetails,
} from "@/features/auth/lib/resend-cooldown";

interface ResendVerificationButtonProps {
  email: string;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "gradient"
    | "gradient-burgundy";
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
  const {
    isActive: cooldownActive,
    formatted: cooldownFormatted,
    start: startCooldown,
  } = useCountdown(initialCooldown);
  const { mutate: resendVerification, isPending } = useResendVerification();

  const handleResend = useCallback(() => {
    if (!email || cooldownActive || isPending) return;

    resendVerification(email, {
      onSuccess: () => {
        startCooldown(EMAIL_RESEND_COOLDOWN_SEC); // 5 minutes
        toast.success("Письмо отправлено", {
          description: "Проверьте вашу почту для подтверждения email",
        });
      },
      onError: (error) => {
        const apiError = error as ApiErrorWithDetails;
        const waitSeconds = getResendCooldownSeconds(error);
        if (waitSeconds !== null) {
          startCooldown(waitSeconds);
          toast.info("Подождите", {
            description: `Повторная отправка будет доступна через ${formatDuration(waitSeconds)}`,
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
  }, [email, cooldownActive, isPending, resendVerification, startCooldown]);

  const isDisabled = isPending || cooldownActive || !email;

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
      ) : cooldownActive ? (
        <>
          {showIcon && <Mail className="mr-2 h-4 w-4" />}
          Повторно через {cooldownFormatted}
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

