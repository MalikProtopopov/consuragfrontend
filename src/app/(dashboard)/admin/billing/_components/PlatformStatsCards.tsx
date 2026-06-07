"use client";

import { Coins, DollarSign, TrendingUp, Users } from "lucide-react";

import { StatsCard } from "@/shared/ui/stats-card";
import { formatCurrency, formatCompact } from "@/shared/lib";
import type { PlatformUsage } from "@/shared/types/api";

interface PlatformStatsCardsProps {
  data: PlatformUsage | undefined;
  isLoading: boolean;
}

export function PlatformStatsCards({ data, isLoading }: PlatformStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Всего пользователей"
        value={isLoading ? "..." : data?.total_users_with_budgets ?? 0}
        icon={Users}
      />
      <StatsCard
        title="Токенов сегодня"
        value={isLoading ? "..." : formatCompact(data?.today.tokens ?? 0)}
        description={data ? formatCurrency(data.today.cost_usd) : undefined}
        icon={Coins}
      />
      <StatsCard
        title="Токенов за месяц"
        value={isLoading ? "..." : formatCompact(data?.this_month.tokens ?? 0)}
        description={data ? formatCurrency(data.this_month.cost_usd) : undefined}
        icon={TrendingUp}
      />
      <StatsCard
        title="Запросов за месяц"
        value={isLoading ? "..." : formatCompact(data?.this_month.requests ?? 0)}
        icon={DollarSign}
      />
    </div>
  );
}
