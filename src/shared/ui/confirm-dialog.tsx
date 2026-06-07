"use client";

import * as React from "react";

import { cn } from "@/shared/lib";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { buttonVariants } from "./button";
import { Spinner } from "./spinner";

export type ConfirmVariant = "default" | "destructive";

export interface ConfirmDialogProps {
  /** Управляемое состояние открытия. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Заголовок диалога. */
  title: React.ReactNode;
  /** Описание / поясняющий текст. */
  description?: React.ReactNode;
  /** Текст кнопки подтверждения. По умолчанию «Подтвердить». */
  confirmLabel?: string;
  /** Текст кнопки отмены. По умолчанию «Отмена». */
  cancelLabel?: string;
  /** Визуальный акцент кнопки подтверждения. */
  variant?: ConfirmVariant;
  /** Обработчик подтверждения. Может быть async. */
  onConfirm: () => void | Promise<void>;
  /** Состояние выполнения: блокирует кнопки и показывает спиннер. */
  isPending?: boolean;
}

/**
 * Стилизованный диалог подтверждения на базе shadcn `AlertDialog`.
 * Замена нативного `window.confirm` для управляемых сценариев.
 *
 * Для императивного вызова прямо из обработчика используйте {@link useConfirm}.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Подтвердить",
  cancelLabel = "Отмена",
  variant = "default",
  onConfirm,
  isPending = false,
}: ConfirmDialogProps) {
  const handleConfirm = (event: React.MouseEvent) => {
    // Не закрываем диалог автоматически — закрытием управляет вызывающий код
    // (например, после успешной мутации), чтобы спиннер был виден до конца.
    event.preventDefault();
    void onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className={cn(
              variant === "destructive" &&
                buttonVariants({ variant: "destructive" })
            )}
          >
            {isPending ? <Spinner size="sm" className="text-current" /> : null}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------------------------------------------------------------------------
// Императивный API: useConfirm() — прямая замена window.confirm
// ---------------------------------------------------------------------------

export interface ConfirmOptions {
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve: ((value: boolean) => void) | null;
}

const INITIAL_STATE: ConfirmState = {
  open: false,
  title: "",
  resolve: null,
};

/**
 * Провайдер императивного подтверждения. Монтируется один раз в корне дерева
 * (рядом с другими провайдерами) и предоставляет один общий диалог для всех
 * вызовов {@link useConfirm}.
 */
export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ConfirmState>(INITIAL_STATE);

  const confirm = React.useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, open: true, resolve });
    });
  }, []);

  const settle = React.useCallback((result: boolean) => {
    setState((prev) => {
      prev.resolve?.(result);
      return { ...prev, open: false, resolve: null };
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state.open}
        onOpenChange={(next) => {
          // Закрытие любым способом (Esc, клик по фону, Отмена) = отказ.
          if (!next) settle(false);
        }}
        title={state.title}
        description={state.description}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        variant={state.variant}
        onConfirm={() => settle(true)}
      />
    </ConfirmContext.Provider>
  );
}

/**
 * Хук-замена нативного `window.confirm`.
 *
 * @example
 * const confirm = useConfirm();
 * const ok = await confirm({ title: "Удалить?", variant: "destructive" });
 * if (!ok) return;
 */
export function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within <ConfirmDialogProvider>");
  }
  return ctx;
}
