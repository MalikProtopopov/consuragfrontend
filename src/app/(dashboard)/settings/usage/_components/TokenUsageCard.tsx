"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { UsageProgressBar } from "@/shared/ui/usage-progress-bar";

interface TokenUsageCardProps {
  title: string;
  description: string;
  isLoading: boolean;
  /** Данные доступны (summary загружен). Если false и не идёт загрузка — контент не рендерится. */
  available: boolean;
  used: number;
  limit: number;
  bonus: number;
  remaining: number;
  overage: number;
  overagePricePer1k: number | null;
}

export function TokenUsageCard({
  title,
  description,
  isLoading,
  available,
  used,
  limit,
  bonus,
  remaining,
  overage,
  overagePricePer1k,
}: TokenUsageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        ) : (
          available && (
          <>
            <UsageProgressBar
              used={used}
              limit={limit}
              bonus={bonus}
              label="Использовано"
              size="lg"
            />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted">Осталось</p>
                <p className="font-medium text-text-primary">
                  {(remaining ?? 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Бонусные</p>
                <p className="font-medium text-text-primary">
                  {(bonus ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
            {(overage ?? 0) > 0 && (
              <div className="rounded-lg bg-warning/10 p-3 text-sm">
                <p className="text-warning font-medium">
                  Перерасход: {(overage ?? 0).toLocaleString()} токенов
                </p>
                {overagePricePer1k && (
                  <p className="text-text-muted mt-1">
                    ${overagePricePer1k} за 1000 токенов
                  </p>
                )}
              </div>
            )}
          </>
          )
        )}
      </CardContent>
    </Card>
  );
}
