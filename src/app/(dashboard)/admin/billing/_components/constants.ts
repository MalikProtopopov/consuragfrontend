import type { BillingPlan } from "@/shared/types/api";

export const planOptions: { value: BillingPlan; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "scale", label: "Scale" },
  { value: "enterprise", label: "Enterprise" },
];
