"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { PlanBadge } from "@/shared/ui/plan-badge";
import type { PlatformUsage } from "@/shared/types/api";

import { planOptions } from "./constants";

interface UsersByPlanCardProps {
  data: PlatformUsage;
}

export function UsersByPlanCard({ data }: UsersByPlanCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Распределение по планам</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-5">
          {planOptions.map((plan) => {
            const count = data.users_by_plan[plan.value] ?? 0;
            const total = data.total_users_with_budgets || 1;
            const percent = Math.round((count / total) * 100);
            return (
              <div
                key={plan.value}
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-border"
              >
                <PlanBadge plan={plan.value} size="sm" />
                <p className="text-2xl font-bold text-text-primary mt-2">{count}</p>
                <p className="text-sm text-text-muted">{percent}%</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
