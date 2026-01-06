"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/shared/lib";
import type { DailyUsage } from "@/shared/types/api";

type Period = "7d" | "30d" | "90d";

/**
 * Format date for chart display
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

/**
 * Format token value for axis/tooltip
 */
function formatTokenValue(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return value.toString();
}

interface UsageChartProps {
  data: DailyUsage[];
  period: Period;
  showCost?: boolean;
  onPeriodChange?: (period: Period) => void;
  className?: string;
}

const periodOptions: { value: Period; label: string }[] = [
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" },
  { value: "90d", label: "90 дней" },
];

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload: DailyUsage & { formattedDate: string };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  showCost?: boolean;
}

const CustomTooltip = ({ active, payload, label, showCost }: CustomTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0]?.payload;

  return (
    <div className="rounded-lg border border-border bg-bg-secondary p-3 shadow-lg">
      <p className="text-sm font-medium text-text-primary mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-text-secondary">
                {entry.dataKey === "chat_tokens" ? "Чат" : "Embeddings"}
              </span>
            </span>
            <span className="font-medium text-text-primary">
              {formatTokenValue(entry.value)}
            </span>
          </div>
        ))}
        {data && (
          <>
            <div className="border-t border-border my-2 pt-2">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-text-secondary">Запросов</span>
                <span className="font-medium text-text-primary">{data.requests}</span>
              </div>
            </div>
            {showCost && data.cost_usd > 0 && (
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-text-secondary">Стоимость</span>
                <span className="font-medium text-text-primary">
                  ${data.cost_usd.toFixed(2)}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const UsageChart = React.forwardRef<HTMLDivElement, UsageChartProps>(
  ({ data, period, showCost = false, onPeriodChange, className }, ref) => {
    const chartData = React.useMemo(() => {
      return data.map((item) => ({
        ...item,
        formattedDate: formatDate(item.date),
      }));
    }, [data]);

    return (
      <div ref={ref} className={cn("space-y-4", className)}>
        {/* Period selector */}
        {onPeriodChange && (
          <div className="flex items-center gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onPeriodChange(option.value)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  period === option.value
                    ? "bg-accent-primary text-accent-contrast"
                    : "bg-bg-hover text-text-secondary hover:text-text-primary"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Chart */}
        <div className="h-[300px] w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-text-muted">Нет данных за выбранный период</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="chatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="embeddingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="formattedDate"
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatTokenValue}
                />
                <Tooltip content={<CustomTooltip showCost={showCost} />} />
                <Legend
                  wrapperStyle={{ paddingTop: 20 }}
                  formatter={(value: string) =>
                    value === "chat_tokens" ? "Токены чата" : "Токены embeddings"
                  }
                />
                <Area
                  type="monotone"
                  dataKey="chat_tokens"
                  stroke="#4ade80"
                  strokeWidth={2}
                  fill="url(#chatGradient)"
                  name="chat_tokens"
                />
                <Area
                  type="monotone"
                  dataKey="embedding_tokens"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  fill="url(#embeddingGradient)"
                  name="embedding_tokens"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  }
);
UsageChart.displayName = "UsageChart";

export { UsageChart };
export type { Period as UsageChartPeriod };

