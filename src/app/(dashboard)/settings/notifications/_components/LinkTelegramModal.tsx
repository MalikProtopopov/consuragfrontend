"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Spinner } from "@/shared/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { getApiErrorMessage, useCountdown } from "@/shared/lib";
import { useGenerateLinkCode } from "@/entities/notification";

/**
 * Modal for linking Telegram.
 */
export function LinkTelegramModal({
  open,
  onOpenChange,
  onCheckStatus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckStatus: () => void;
}) {
  const { mutate: generateCode, data: linkData, isPending, error, reset } = useGenerateLinkCode();
  const [copied, setCopied] = useState(false);
  const { secondsLeft: timeLeft, formatted: timeFormatted, start, stop } = useCountdown(0);

  // Handle generate code
  const handleGenerateCode = useCallback(() => {
    generateCode(undefined, {
      onSuccess: (data) => {
        start(data.expires_in);
      },
    });
  }, [generateCode, start]);

  // Generate code on mount when open
  const hasGeneratedRef = useRef(false);
  useEffect(() => {
    if (open && !hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      handleGenerateCode();
    }
    if (!open) {
      hasGeneratedRef.current = false;
      reset();
      stop();
    }
  }, [open, handleGenerateCode, reset, stop]);

  const handleCopy = async () => {
    if (!linkData?.code) return;

    try {
      await navigator.clipboard.writeText(linkData.code);
      setCopied(true);
      toast.success("Код скопирован");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Привязка Telegram</DialogTitle>
          <DialogDescription>
            Следуйте инструкции для привязки аккаунта
          </DialogDescription>
        </DialogHeader>

        {isPending && (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
          </Alert>
        )}

        {linkData && !isPending && (
          <div className="space-y-6">
            {/* Step 1: Copy code */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                1. Скопируйте код:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-bg-secondary px-4 py-3 text-lg font-mono font-bold text-text-primary text-center">
                  {linkData.code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Step 2: Open bot */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                2. Откройте бота в Telegram:
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(linkData.bot_link, "_blank")}
              >
                <Send className="mr-2 h-4 w-4" />
                Открыть @{linkData.bot_username}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Step 3: Send command */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                3. Отправьте боту команду:
              </p>
              <code className="block rounded-lg bg-bg-secondary px-4 py-2 text-sm text-text-secondary">
                /start {linkData.code}
              </code>
            </div>

            {/* Timer and check status */}
            <div className="flex items-center justify-between">
              {timeLeft > 0 ? (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <span>Код действителен:</span>
                  <Badge variant={timeLeft < 60 ? "destructive" : "secondary"}>
                    {timeFormatted}
                  </Badge>
                </div>
              ) : (
                <Alert className="flex-1">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Код истёк. Закройте окно и попробуйте снова.
                  </AlertDescription>
                </Alert>
              )}
              {timeLeft > 0 && (
                <Button variant="outline" size="sm" onClick={onCheckStatus}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Проверить
                </Button>
              )}
            </div>

            <p className="text-xs text-text-muted text-center">
              Нажмите «Проверить» после отправки команды боту
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
