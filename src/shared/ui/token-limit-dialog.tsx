"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/shared/config";
import { onTokenLimitError } from "@/shared/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { UsageProgressBar } from "./usage-progress-bar";

interface TokenLimitErrorData {
  code: "TOKEN_LIMIT_EXCEEDED" | "EMBEDDING_LIMIT_EXCEEDED";
  message: string;
  details?: {
    current_usage: number;
    limit: number;
    limit_type: string;
  };
}

interface TokenLimitDialogContextValue {
  showError: (error: TokenLimitErrorData) => void;
}

const TokenLimitDialogContext = React.createContext<TokenLimitDialogContextValue | null>(
  null
);

export function useTokenLimitDialog() {
  const context = React.useContext(TokenLimitDialogContext);
  if (!context) {
    throw new Error("useTokenLimitDialog must be used within TokenLimitDialogProvider");
  }
  return context;
}

interface TokenLimitDialogProviderProps {
  children: React.ReactNode;
}

export function TokenLimitDialogProvider({ children }: TokenLimitDialogProviderProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [errorData, setErrorData] = React.useState<TokenLimitErrorData | null>(null);

  const showError = React.useCallback((error: TokenLimitErrorData) => {
    setErrorData(error);
    setIsOpen(true);

    // Also show a toast notification for quick feedback
    const isChat = error.code === "TOKEN_LIMIT_EXCEEDED";
    toast.error(isChat ? "Лимит токенов чата исчерпан" : "Лимит embeddings исчерпан", {
      description: "Улучшите план для продолжения работы",
      action: {
        label: "Улучшить",
        onClick: () => router.push(ROUTES.SETTINGS.USAGE),
      },
    });
  }, [router]);

  // Subscribe to token limit errors from API
  React.useEffect(() => {
    const unsubscribe = onTokenLimitError((error) => {
      showError(error);
    });
    return unsubscribe;
  }, [showError]);

  const handleUpgrade = () => {
    setIsOpen(false);
    router.push(ROUTES.SETTINGS.USAGE);
  };

  const handleClose = () => {
    setIsOpen(false);
    setErrorData(null);
  };

  const isChat = errorData?.code === "TOKEN_LIMIT_EXCEEDED";
  const title = isChat ? "Лимит токенов чата исчерпан" : "Лимит токенов embeddings исчерпан";

  return (
    <TokenLimitDialogContext.Provider value={{ showError }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-error/10">
                <AlertTriangle className="size-5 text-error" />
              </div>
              <div>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>
                  Вы использовали все доступные токены за этот период
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {errorData?.details && (
              <UsageProgressBar
                used={errorData.details.current_usage}
                limit={errorData.details.limit}
                label={isChat ? "Токены чата" : "Токены embeddings"}
                colorScheme="red"
              />
            )}

            <div className="flex items-center gap-2 rounded-lg bg-bg-secondary p-3">
              <Clock className="size-4 text-text-muted" />
              <p className="text-sm text-text-secondary">
                Лимиты сбрасываются в начале следующего расчетного периода
              </p>
            </div>

            {errorData?.message && (
              <p className="text-sm text-text-muted">{errorData.message}</p>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
              Подождать
            </Button>
            <Button onClick={handleUpgrade} className="w-full sm:w-auto">
              <TrendingUp className="size-4 mr-2" />
              Улучшить план
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TokenLimitDialogContext.Provider>
  );
}

