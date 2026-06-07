"use client";

import * as React from "react";
import {
  useUsageSummary,
  useUsageHistory,
  useUsageBreakdown,
  usePlanInfo,
} from "@/entities/billing";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { LimitAlert } from "@/shared/ui/limit-alert";
import { type UsageChartPeriod } from "@/shared/ui/usage-chart";
import {
  UsageSummaryCards,
  TokenUsageCard,
  UsageBreakdownTabs,
  PlanInfoCard,
  UsageChartDynamic,
} from "./_components";

export default function UsagePage() {
  const [chartPeriod, setChartPeriod] = React.useState<UsageChartPeriod>("30d");

  const { data: summary, isLoading: summaryLoading } = useUsageSummary();
  const { data: history, isLoading: historyLoading } = useUsageHistory(
    chartPeriod === "7d" ? 7 : chartPeriod === "30d" ? 30 : 90
  );
  const { data: breakdown, isLoading: breakdownLoading } = useUsageBreakdown();
  const { data: planInfo, isLoading: planLoading } = usePlanInfo();

  const isLoading = summaryLoading || planLoading;

  return (
    <PageContainer>
      <PageHeader
        title="Использование и лимиты"
        description="Отслеживайте использование токенов и управляйте своим планом"
      />

      <div className="space-y-6">
        {/* Limit Alert */}
        {summary && (
          <LimitAlert
            usagePercent={summary.total_usage_percent}
            daysRemaining={summary.days_remaining}
          />
        )}

        {/* Summary Cards */}
        <UsageSummaryCards summary={summary} isLoading={isLoading} />

        {/* Token Usage Details */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TokenUsageCard
            title="Токены чата"
            description="Использование токенов для генерации ответов в чате"
            isLoading={isLoading}
            available={!!summary}
            used={summary?.chat_tokens_used ?? 0}
            limit={summary?.chat_tokens_limit ?? 0}
            bonus={summary?.chat_bonus_tokens ?? 0}
            remaining={summary?.chat_tokens_remaining ?? 0}
            overage={summary?.chat_overage_tokens ?? 0}
            overagePricePer1k={summary?.overage_price_per_1k_chat ?? null}
          />
          <TokenUsageCard
            title="Токены embeddings"
            description="Использование токенов для индексации документов"
            isLoading={isLoading}
            available={!!summary}
            used={summary?.embedding_tokens_used ?? 0}
            limit={summary?.embedding_tokens_limit ?? 0}
            bonus={summary?.embedding_bonus_tokens ?? 0}
            remaining={summary?.embedding_tokens_remaining ?? 0}
            overage={summary?.embedding_overage_tokens ?? 0}
            overagePricePer1k={summary?.overage_price_per_1k_embedding ?? null}
          />
        </div>

        {/* Usage History Chart */}
        <Card>
          <CardHeader>
            <CardTitle>История использования</CardTitle>
            <CardDescription>
              График использования токенов за выбранный период
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <UsageChartDynamic
                data={history?.data ?? []}
                period={chartPeriod}
                showCost
                onPeriodChange={setChartPeriod}
              />
            )}
          </CardContent>
        </Card>

        {/* Usage Breakdown */}
        <UsageBreakdownTabs breakdown={breakdown} isLoading={breakdownLoading} />

        {/* Plan Information */}
        <PlanInfoCard
          planInfo={planInfo}
          isLoading={planLoading}
          currentPlan={summary?.plan}
        />
      </div>
    </PageContainer>
  );
}
