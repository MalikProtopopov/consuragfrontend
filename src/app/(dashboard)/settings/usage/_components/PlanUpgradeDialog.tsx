"use client";

import * as React from "react";
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
