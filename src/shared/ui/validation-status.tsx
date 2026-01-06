"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib";

type ValidationState = "idle" | "loading" | "success" | "error";

interface ValidationStatusProps {
  state: ValidationState;
  message?: string;
  className?: string;
}

const ValidationStatus = React.forwardRef<HTMLDivElement, ValidationStatusProps>(
  ({ state, message, className }, ref) => {
    if (state === "idle") {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 text-sm",
          state === "loading" && "text-text-muted",
          state === "success" && "text-success",
          state === "error" && "text-error",
          className
        )}
      >
        {state === "loading" && (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>{message || "Проверка..."}</span>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle2 className="size-4" />
            <span>{message || "Ключ действителен"}</span>
          </>
        )}
        {state === "error" && (
          <>
            <XCircle className="size-4" />
            <span>{message || "Ключ недействителен"}</span>
          </>
        )}
      </div>
    );
  }
);
ValidationStatus.displayName = "ValidationStatus";

export { ValidationStatus };
export type { ValidationState, ValidationStatusProps };

