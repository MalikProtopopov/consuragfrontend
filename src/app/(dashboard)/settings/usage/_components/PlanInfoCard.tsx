"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { PlanBadge } from "@/shared/ui/plan-badge";
import type { BillingPlan, PlanInfo } from "@/shared/types/api";
import { formatCurrency } from "@/shared/lib";
import { PlanUpgradeDialog } from "./PlanUpgradeDialog";

interface PlanInfoCardProps {
  planInfo: PlanInfo | undefined;
  isLoading: boolean;
  /** Текущий план пользователя (из summary). */
  currentPlan: BillingPlan | undefined;
}

export function PlanInfoCard({ planInfo, isLoading, currentPlan }: PlanInfoCardProps) {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = React.useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Информация о плане</CardTitle>
            <CardDescription>Текущий план и его возможности</CardDescription>
          </div>
          {currentPlan && <PlanBadge plan={currentPlan} />}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          planInfo && (
            <div className="space-y-6">
              {/* Limits */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-text-muted">Токены чата / мес.</p>
                  <p className="text-xl font-bold text-text-primary">
                    {(planInfo.monthly_chat_limit ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-text-muted">Токены embeddings / мес.</p>
                  <p className="text-xl font-bold text-text-primary">
                    {(planInfo.monthly_embedding_limit ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-text-muted">Стоимость</p>
                  <p className="text-xl font-bold text-text-primary">
                    {planInfo.price_usd === 0
                      ? "Бесплатно"
                      : `${formatCurrency(planInfo.price_usd)} / мес.`}
                  </p>
                </div>
              </div>

              {/* Resource Limits */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-text-muted">Макс. проектов</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {planInfo.max_projects}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Аватаров на проект</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {planInfo.max_avatars_per_project}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Документов на аватар</p>
                  <p className="text-lg font-semibold text-text-primary">
                    {planInfo.max_documents_per_avatar}
                  </p>
                </div>
              </div>

              {/* Features */}
              {planInfo.features.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-text-primary mb-2">
                    Возможности плана
                  </p>
                  <ul className="space-y-1">
                    {planInfo.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-text-secondary"
                      >
                        <span className="text-success">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Upgrade Button */}
              {currentPlan !== "enterprise" && (
                <div className="pt-4 border-t border-border">
                  <Button onClick={() => setUpgradeDialogOpen(true)}>
                    <TrendingUp className="size-4 mr-2" />
                    Улучшить план
                  </Button>
                </div>
              )}

              <PlanUpgradeDialog
                open={upgradeDialogOpen}
                onOpenChange={setUpgradeDialogOpen}
                currentPlan={currentPlan}
              />
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
