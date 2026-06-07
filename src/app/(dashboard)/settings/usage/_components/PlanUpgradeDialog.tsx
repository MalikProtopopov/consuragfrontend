"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { useCreatePlanRequest } from "@/entities/plan-request";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Spinner } from "@/shared/ui/spinner";
import type { BillingPlan } from "@/shared/types/api";

const AVAILABLE_PLANS: { value: BillingPlan; label: string }[] = [
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "scale", label: "Scale" },
  { value: "enterprise", label: "Enterprise" },
];

/**
 * PL-05 — краткое сравнение тарифов (источник: бэк `billing/config.py`).
 * Держать в синхроне с бэкендом при изменении тарифной сетки.
 */
const PLAN_HIGHLIGHTS: Partial<
  Record<BillingPlan, { tokens: string; resources: string; features: string[] }>
> = {
  starter: {
    tokens: "100K чат · 50K embedding",
    resources: "3 проекта · 5 аватаров · 50 документов",
    features: ["Telegram-интеграция", "Все модели LLM", "Полная аналитика"],
  },
  growth: {
    tokens: "500K чат · 200K embedding",
    resources: "10 проектов · 20 аватаров · 200 документов",
    features: ["Всё из Starter", "API-доступ", "Кастомный брендинг"],
  },
  scale: {
    tokens: "2M чат · 1M embedding",
    resources: "50 проектов · 100 аватаров · 1000 документов",
    features: ["Всё из Growth", "White-label", "Webhooks", "SLA"],
  },
  enterprise: {
    tokens: "10M чат · 5M embedding",
    resources: "Практически без лимитов",
    features: ["Всё из Scale", "Кастомные интеграции", "On-premise", "Выделенная поддержка"],
  },
};

interface PlanUpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Текущий план — исключается из списка доступных. */
  currentPlan: BillingPlan | undefined;
}

export function PlanUpgradeDialog({
  open,
  onOpenChange,
  currentPlan,
}: PlanUpgradeDialogProps) {
  const [selectedPlan, setSelectedPlan] = React.useState<BillingPlan | "">("");
  const [upgradeMessage, setUpgradeMessage] = React.useState("");

  const { mutate: createPlanRequest, isPending: isSubmitting } =
    useCreatePlanRequest();

  const handleUpgradeSubmit = () => {
    if (!selectedPlan) return;

    createPlanRequest(
      {
        request_type: "plan_upgrade",
        requested_plan: selectedPlan,
        message: upgradeMessage || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedPlan("");
          setUpgradeMessage("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Улучшить план</DialogTitle>
          <DialogDescription>
            Выберите желаемый план и отправьте заявку. Мы свяжемся с вами в ближайшее время.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="plan">Желаемый план</Label>
            <Select
              value={selectedPlan}
              onValueChange={(value) => setSelectedPlan(value as BillingPlan)}
            >
              <SelectTrigger id="plan">
                <SelectValue placeholder="Выберите план" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_PLANS.filter(
                  (p) => p.value !== currentPlan && p.value !== "starter"
                ).map((plan) => (
                  <SelectItem key={plan.value} value={plan.value}>
                    {plan.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedPlan && PLAN_HIGHLIGHTS[selectedPlan] && (
            <div className="rounded-lg border border-border bg-bg-secondary p-3 text-sm">
              <p className="font-medium text-text-primary">
                Что входит в {AVAILABLE_PLANS.find((p) => p.value === selectedPlan)?.label}
              </p>
              <ul className="mt-2 space-y-1.5 text-text-secondary">
                <li>Токены: {PLAN_HIGHLIGHTS[selectedPlan]!.tokens}</li>
                <li>Лимиты: {PLAN_HIGHLIGHTS[selectedPlan]!.resources}</li>
                {PLAN_HIGHLIGHTS[selectedPlan]!.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5">
                    <Check className="size-3.5 shrink-0 text-success" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="message">Сообщение (необязательно)</Label>
            <Textarea
              id="message"
              placeholder="Расскажите о ваших потребностях..."
              value={upgradeMessage}
              onChange={(e) => setUpgradeMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Отмена
          </Button>
          <Button
            onClick={handleUpgradeSubmit}
            disabled={!selectedPlan || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 size-4" />
                Отправка...
              </>
            ) : (
              "Отправить заявку"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
