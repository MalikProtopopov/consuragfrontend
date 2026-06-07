"use client";

import { Calendar, Clock, CreditCard, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { PlanBadge } from "@/shared/ui/plan-badge";
import type { UsageSummary } from "@/shared/types/api";
import { formatCurrency, formatDate } from "@/shared/lib";

interface UsageSummaryCardsProps {
  summary: UsageSummary | undefined;
  isLoading: boolean;
}

export function UsageSummaryCards({ summary, isLoading }: UsageSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Current Plan */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-text-muted">
            Текущий план
          </CardTitle>
          <CreditCard className="size-4 text-text-muted" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <div className="flex items-center gap-2">
              {summary && <PlanBadge plan={summary.plan} size="lg" />}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Days Remaining */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-text-muted">
            До сброса лимитов
          </CardTitle>
          <Clock className="size-4 text-text-muted" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <div className="text-2xl font-bold text-text-primary">
              {summary?.days_remaining} дн.
            </div>
          )}
          {summary && (
            <p className="text-xs text-text-muted mt-1">
              до {formatDate(summary.period_end)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Total Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-text-muted">
            Общее использование
          </CardTitle>
          <TrendingUp className="size-4 text-text-muted" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <div className="text-2xl font-bold text-text-primary">
              {summary?.total_usage_percent}%
            </div>
          )}
          {summary && (
            <p className="text-xs text-text-muted mt-1">
              {(summary.total_tokens_used ?? 0).toLocaleString()} токенов
            </p>
          )}
        </CardContent>
      </Card>

      {/* Estimated Cost */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-text-muted">
            Расчетная стоимость
          </CardTitle>
          <Calendar className="size-4 text-text-muted" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <div className="text-2xl font-bold text-text-primary">
              {formatCurrency(summary?.estimated_cost_usd ?? 0)}
            </div>
          )}
          {summary && summary.overage_cost_usd > 0 && (
            <p className="text-xs text-warning mt-1">
              + {formatCurrency(summary.overage_cost_usd)} перерасход
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
