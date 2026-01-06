"use client";

import * as React from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { cn } from "@/shared/lib";
import { Input } from "./input";
import { Button } from "./button";
import { ValidationStatus, type ValidationState } from "./validation-status";

interface SecretInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  maskedValue?: string; // "••••••••sk-1234"
  error?: string;
  onValidate?: () => void;
  isValidating?: boolean;
  validationState?: ValidationState;
  validationMessage?: string;
  showValidateButton?: boolean;
}

// Format masked value to show only 5 dots + last visible characters
function formatMaskedValue(maskedValue: string): string {
  // Find where the dots end and actual characters begin
  const lastDotIndex = maskedValue.lastIndexOf("•");
  if (lastDotIndex === -1) return maskedValue;
  
  const suffix = maskedValue.slice(lastDotIndex + 1);
  return "•••••" + suffix;
}

const SecretInput = React.forwardRef<HTMLInputElement, SecretInputProps>(
  (
    {
      className,
      value,
      onChange,
      maskedValue,
      placeholder,
      disabled,
      error,
      onValidate,
      isValidating = false,
      validationState = "idle",
      validationMessage,
      showValidateButton = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);

    // Clear value on unmount for security
    // Use ref to capture latest onChange to avoid dependency issues
    const onChangeRef = React.useRef(onChange);
    onChangeRef.current = onChange;

    React.useEffect(() => {
      return () => {
        onChangeRef.current("");
      };
    }, []); // Empty deps = only runs on mount/unmount

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const inputType = showPassword ? "text" : "password";
    const actualValidationState = isValidating ? "loading" : validationState;

    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={ref}
              type={inputType}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              className={cn(
                "pr-10",
                error && "border-error focus-visible:ring-error"
              )}
              {...props}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={toggleVisibility}
              disabled={disabled}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="size-4 text-text-muted" />
              ) : (
                <Eye className="size-4 text-text-muted" />
              )}
              <span className="sr-only">
                {showPassword ? "Скрыть" : "Показать"}
              </span>
            </Button>
          </div>
          {showValidateButton && onValidate && (
            <Button
              type="button"
              variant="outline"
              onClick={onValidate}
              disabled={disabled || !value || isValidating}
            >
              <ShieldCheck className="size-4 mr-1.5" />
              Проверить
            </Button>
          )}
        </div>

        {/* Current masked value hint */}
        {maskedValue && (
          <p className="text-xs text-text-muted">
            Текущее значение: {formatMaskedValue(maskedValue)}
          </p>
        )}

        {/* Error message */}
        {error && <p className="text-xs text-error">{error}</p>}

        {/* Validation status */}
        {actualValidationState !== "idle" && (
          <ValidationStatus
            state={actualValidationState}
            message={validationMessage}
          />
        )}
      </div>
    );
  }
);
SecretInput.displayName = "SecretInput";

export { SecretInput };
export type { SecretInputProps };

