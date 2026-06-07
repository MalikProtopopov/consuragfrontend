"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/shared/ui/skeleton";
import type { UsageChartPeriod } from "@/shared/ui/usage-chart";
import type { DailyUsage } from "@/shared/types/api";

/**
 * Динамическая обёртка над UsageChart (T-26).
 *
 * UsageChart тянет recharts — крупнейший static-чанк (~331KB). Грузим его
 * только на странице usage через next/dynamic({ ssr:false }) со скелетоном,
 * чтобы recharts не попадал в общий First Load JS остальных роутов.
 *
 * Сам UsageChart лежит в shared/ui и не меняется — здесь только ленивый импорт.
 */
const UsageChart = dynamic(
  () => import("@/shared/ui/usage-chart").then((m) => m.UsageChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />,
  }
);

interface UsageChartDynamicProps {
  data: DailyUsage[];
  period: UsageChartPeriod;
  showCost?: boolean;
  onPeriodChange?: (period: UsageChartPeriod) => void;
  className?: string;
}

export function UsageChartDynamic(props: UsageChartDynamicProps) {
  return <UsageChart {...props} />;
}
