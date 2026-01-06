"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Switch } from "./switch";
import { SecretInput } from "./secret-input";
import type { ValidationState } from "./validation-status";

interface ConfigFormData {
  key: string;
  value: string;
  display_name: string;
  description: string;
  is_active: boolean;
}

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  // Existing config data for editing (null for create)
  existingConfig?: {
    key: string;
    display_name: string;
    description: string | null;
    masked_value: string;
    is_active: boolean;
  } | null;
  // Key type for creating new config
  keyType?: string;
  defaultDisplayName?: string;
  defaultDescription?: string;
  placeholder?: string;
  // Handlers
  onSave: (data: ConfigFormData) => Promise<void>;
  onValidate?: (value: string) => Promise<{ valid: boolean; message?: string }>;
  // State
  isSaving?: boolean;
  showValidation?: boolean;
}

const ConfigModal = React.forwardRef<HTMLDivElement, ConfigModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      existingConfig,
      keyType,
      defaultDisplayName = "",
      defaultDescription = "",
      placeholder,
      onSave,
      onValidate,
      isSaving = false,
      showValidation = true,
    },
    ref
  ) => {
    const isEditing = !!existingConfig;

    // Form state
    const [formData, setFormData] = React.useState<ConfigFormData>({
      key: "",
      value: "",
      display_name: "",
      description: "",
      is_active: true,
    });

    const [error, setError] = React.useState<string>("");
    const [validationState, setValidationState] =
      React.useState<ValidationState>("idle");
    const [validationMessage, setValidationMessage] = React.useState<string>("");

    // Track previous isOpen to only reset form on open transition
    const prevIsOpenRef = React.useRef(false);

    // Reset form only when modal transitions from closed to open
    React.useEffect(() => {
      const wasOpen = prevIsOpenRef.current;
      prevIsOpenRef.current = isOpen;

      // Only reset form when opening (not when already open)
      if (isOpen && !wasOpen) {
        setFormData({
          key: existingConfig?.key ?? keyType ?? "",
          value: "",
          display_name: existingConfig?.display_name ?? defaultDisplayName,
          description: existingConfig?.description ?? defaultDescription,
          is_active: existingConfig?.is_active ?? true,
        });
        setError("");
        setValidationState("idle");
        setValidationMessage("");
      }
    }, [isOpen, existingConfig, keyType, defaultDisplayName, defaultDescription]);

    const handleValidate = async () => {
      if (!onValidate || !formData.value.trim()) return;

      setValidationState("loading");
      setValidationMessage("");

      try {
        const result = await onValidate(formData.value);
        setValidationState(result.valid ? "success" : "error");
        setValidationMessage(result.message ?? "");
      } catch {
        setValidationState("error");
        setValidationMessage("Ошибка при проверке ключа");
      }
    };

    const handleSave = async () => {
      // Basic validation
      // For new configs, value is required
      // For existing configs, value is optional (can update other fields only)
      if (!formData.value.trim() && !isEditing) {
        setError("Значение обязательно для создания новой конфигурации");
        return;
      }

      if (!formData.display_name.trim()) {
        setError("Название не может быть пустым");
        return;
      }

      setError("");

      try {
        await onSave(formData);
        onClose();
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Ошибка при сохранении");
        }
      }
    };

    const handleClose = () => {
      // Clear sensitive data before closing
      setFormData((prev) => ({ ...prev, value: "" }));
      onClose();
    };

    const handleOpenChange = (open: boolean) => {
      // Only handle close events, not open events (open is controlled by isOpen prop)
      if (!open) {
        handleClose();
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent ref={ref} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Secret Input */}
            <div className="space-y-2">
              <Label htmlFor="value">
                {isEditing ? "Новое значение (опционально)" : "Значение"}{" "}
                {!isEditing && <span className="text-error">*</span>}
              </Label>
              <SecretInput
                id="value"
                value={formData.value}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, value }))
                }
                maskedValue={existingConfig?.masked_value}
                placeholder={isEditing ? "Оставьте пустым, чтобы не менять" : placeholder}
                showValidateButton={showValidation && !!onValidate && !!formData.value.trim()}
                onValidate={handleValidate}
                validationState={validationState}
                validationMessage={validationMessage}
              />
              {isEditing && (
                <p className="text-xs text-text-muted">
                  Оставьте пустым, чтобы сохранить текущее значение. Можно изменить только название, описание или активность.
                </p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">
                Название <span className="text-error">*</span>
              </Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    display_name: e.target.value,
                  }))
                }
                placeholder="Отображаемое название"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Описание конфигурации"
                rows={2}
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Активен</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>

            {/* Error */}
            {error && <p className="text-sm text-error">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);
ConfigModal.displayName = "ConfigModal";

export { ConfigModal };
export type { ConfigModalProps, ConfigFormData };

