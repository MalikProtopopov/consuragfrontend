"use client";

import { Settings2, Users } from "lucide-react";

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
import { UsageProgressBar } from "@/shared/ui/usage-progress-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { formatCurrency, formatCompact, type UsePaginationResult } from "@/shared/lib";
import type { BillingPlan, UserUsage } from "@/shared/types/api";

import { planOptions } from "./constants";

interface UsersUsageTableProps {
  users: UserUsage[];
  total: number | undefined;
  isLoading: boolean;
  selectedPlan: BillingPlan | "all";
  onSelectedPlanChange: (plan: BillingPlan | "all") => void;
  pagination: UsePaginationResult;
  onManageUser: (user: UserUsage) => void;
}

export function UsersUsageTable({
  users,
  total,
  isLoading,
  selectedPlan,
  onSelectedPlanChange,
  pagination,
  onManageUser,
}: UsersUsageTableProps) {
  const { page, limit, totalPages, hasNext, hasPrev } = pagination;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Пользователи</CardTitle>
            <CardDescription>
              Всего: {total ?? 0} пользователей с настроенными бюджетами
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedPlan}
              onValueChange={(v) => onSelectedPlanChange(v as BillingPlan | "all")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Все планы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все планы</SelectItem>
                {planOptions.map((plan) => (
                  <SelectItem key={plan.value} value={plan.value}>
                    {plan.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="size-12 text-text-muted mb-4" />
            <p className="text-lg font-medium text-text-primary">
              Пользователи не найдены
            </p>
            <p className="text-sm text-text-muted mt-1">
              {selectedPlan !== "all"
                ? `Нет пользователей с планом "${selectedPlan}"`
                : "На платформе пока нет пользователей с настроенными бюджетами"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>План</TableHead>
                <TableHead>Чат токены</TableHead>
                <TableHead>Embeddings</TableHead>
                <TableHead>Стоимость</TableHead>
                <TableHead className="text-right">Использование</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((userItem) => {
                const chatPercent =
                  userItem.chat_tokens_limit > 0
                    ? Math.round(
                        (userItem.chat_tokens_used / userItem.chat_tokens_limit) * 100,
                      )
                    : 0;
                const embeddingPercent =
                  userItem.embedding_tokens_limit > 0
                    ? Math.round(
                        (userItem.embedding_tokens_used /
                          userItem.embedding_tokens_limit) *
                          100,
                      )
                    : 0;

                return (
                  <TableRow key={userItem.user_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-text-primary">
                          {userItem.user_email || `${userItem.user_id.slice(0, 8)}...`}
                        </p>
                        <p className="text-xs text-text-muted">
                          {new Date(userItem.period_start).toLocaleDateString("ru-RU")} —{" "}
                          {new Date(userItem.period_end).toLocaleDateString("ru-RU")}
                        </p>
                        {userItem.user_email && (
                          <p className="text-xs text-text-muted font-mono mt-0.5">
                            ID: {userItem.user_id.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <PlanBadge plan={userItem.plan} size="sm" />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>
                          {formatCompact(userItem.chat_tokens_used)} /{" "}
                          {formatCompact(userItem.chat_tokens_limit)}
                        </p>
                        <p className="text-text-muted">{chatPercent}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>
                          {formatCompact(userItem.embedding_tokens_used)} /{" "}
                          {formatCompact(userItem.embedding_tokens_limit)}
                        </p>
                        <p className="text-text-muted">{embeddingPercent}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {formatCurrency(userItem.cost_usd)}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <UsageProgressBar
                        used={userItem.usage_percent}
                        limit={100}
                        label=""
                        showPercent={false}
                        size="sm"
                        className="w-24 ml-auto"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onManageUser(userItem)}
                      >
                        <Settings2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {total !== undefined && total > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-text-muted">
              {total > limit ? (
                <>
                  Показано {page * limit + 1} -{" "}
                  {Math.min((page + 1) * limit, total)} из {total}
                </>
              ) : (
                <>Всего: {total} пользователей</>
              )}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPrev}
                  onClick={pagination.prev}
                >
                  Назад
                </Button>
                <span className="text-sm text-text-muted px-2">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNext}
                  onClick={pagination.next}
                >
                  Вперед
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
