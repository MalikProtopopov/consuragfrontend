import { toast } from "sonner";

import { ROUTES } from "@/shared/config";

import { getApiErrorMessage, isUpsellError } from "./error-messages";

/**
 * Показать тост по ошибке API. Для тарифных/лимитных ошибок добавляет
 * действие «Повысить тариф», ведущее на страницу использования (PL-01/PL-02).
 */
export function notifyApiError(error: unknown): void {
  const message = getApiErrorMessage(error);
  if (isUpsellError(error)) {
    toast.error(message, {
      action: {
        label: "Повысить тариф",
        onClick: () => {
          window.location.href = ROUTES.SETTINGS.USAGE;
        },
      },
    });
    return;
  }
  toast.error(message);
}
