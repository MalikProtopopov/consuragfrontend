"use client";

import * as React from "react";
import { Calendar, Clock, CreditCard, FileText, TrendingUp } from "lucide-react";
import {
  useUsageSummary,
  useUsageHistory,
  useUsageBreakdown,
  usePlanInfo,
} from "@/entities/billing";
import { useCreatePlanRequest } from "@/entities/plan-request";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { UsageProgressBar } from "@/shared/ui/usage-progress-bar";
import { PlanBadge } from "@/shared/ui/plan-badge";
import { LimitAlert } from "@/shared/ui/limit-alert";
import { UsageChart, type UsageChartPeriod } from "@/shared/ui/usage-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Spinner } from "@/shared/ui/spinner";
import type { BillingPlan } from "@/shared/types/api";

/**
 * Format currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format date
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const AVAILABLE_PLANS: { value: BillingPlan; label: string }[] = [
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "scale", label: "Scale" },
  { value: "enterprise", label: "Enterprise" },
];

export default function UsagePage() {
  const [chartPeriod, setChartPeriod] = React.useState<UsageChartPeriod>("30d");
  const [upgradeDialogOpen, setUpgradeDialogOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<BillingPlan | "">("");
  const [upgradeMessage, setUpgradeMessage] = React.useState("");

  const { data: summary, isLoading: summaryLoading } = useUsageSummary();
  const { data: history, isLoading: historyLoading } = useUsageHistory(
    chartPeriod === "7d" ? 7 : chartPeriod === "30d" ? 30 : 90
  );
  const { data: breakdown, isLoading: breakdownLoading } = useUsageBreakdown();
  const { data: planInfo, isLoading: planLoading } = usePlanInfo();
  const { mutate: createPlanRequest, isPending: isSubmitting } = useCreatePlanRequest();

  const isLoading = summaryLoading || planLoading;

  const handleUpgradeSubmit = () => {
    if (!selectedPlan) return;
    
    createPlanRequest(
      {
        request_type: "plan_upgrade",
        requested_plan: selectedPlan,
        message: upgradeMessage || undefined,
      },
      {
        onSuccess: () => {
          setUpgradeDialogOpen(false);
          setSelectedPlan("");
          setUpgradeMessage("");
        },
      }
    );
  };

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

      {/* Token Usage Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chat Tokens */}
        <Card>
          <CardHeader>
            <CardTitle>Токены чата</CardTitle>
            <CardDescription>
              Использование токенов для генерации ответов в чате
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : (
              summary && (
                <>
                  <UsageProgressBar
                    used={summary.chat_tokens_used}
                    limit={summary.chat_tokens_limit}
                    bonus={summary.chat_bonus_tokens}
                    label="Использовано"
                    size="lg"
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-muted">Осталось</p>
                      <p className="font-medium text-text-primary">
                        {(summary.chat_tokens_remaining ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted">Бонусные</p>
                      <p className="font-medium text-text-primary">
                        {(summary.chat_bonus_tokens ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {(summary.chat_overage_tokens ?? 0) > 0 && (
                    <div className="rounded-lg bg-warning/10 p-3 text-sm">
                      <p className="text-warning font-medium">
                        Перерасход: {(summary.chat_overage_tokens ?? 0).toLocaleString()} токенов
                      </p>
                      {summary.overage_price_per_1k_chat && (
                        <p className="text-text-muted mt-1">
                          ${summary.overage_price_per_1k_chat} за 1000 токенов
                        </p>
                      )}
                    </div>
                  )}
                </>
              )
            )}
          </CardContent>
        </Card>

        {/* Embedding Tokens */}
        <Card>
          <CardHeader>
            <CardTitle>Токены embeddings</CardTitle>
            <CardDescription>
              Использование токенов для индексации документов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : (
              summary && (
                <>
                  <UsageProgressBar
                    used={summary.embedding_tokens_used}
                    limit={summary.embedding_tokens_limit}
                    bonus={summary.embedding_bonus_tokens}
                    label="Использовано"
                    size="lg"
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-muted">Осталось</p>
                      <p className="font-medium text-text-primary">
                        {(summary.embedding_tokens_remaining ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-muted">Бонусные</p>
                      <p className="font-medium text-text-primary">
                        {(summary.embedding_bonus_tokens ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {(summary.embedding_overage_tokens ?? 0) > 0 && (
                    <div className="rounded-lg bg-warning/10 p-3 text-sm">
                      <p className="text-warning font-medium">
                        Перерасход: {(summary.embedding_overage_tokens ?? 0).toLocaleString()} токенов
                      </p>
                      {summary.overage_price_per_1k_embedding && (
                        <p className="text-text-muted mt-1">
                          ${summary.overage_price_per_1k_embedding} за 1000 токенов
                        </p>
                      )}
                    </div>
                  )}
                </>
              )
            )}
          </CardContent>
        </Card>
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
            <UsageChart
              data={history?.data ?? []}
              period={chartPeriod}
              showCost
              onPeriodChange={setChartPeriod}
            />
          )}
        </CardContent>
      </Card>

      {/* Usage Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Детализация использования</CardTitle>
              <CardDescription>
                Распределение использования токенов по проектам, аватарам, операциям и моделям
              </CardDescription>
            </div>
            <FileText className="size-5 text-text-muted" />
          </div>
        </CardHeader>
        <CardContent>
          {breakdownLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !breakdown ? (
            <p className="text-center text-text-muted py-8">
              Нет данных об использовании
            </p>
          ) : (
            <Tabs defaultValue="by_operation" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="by_operation">По операциям</TabsTrigger>
                <TabsTrigger value="by_model">По моделям</TabsTrigger>
                <TabsTrigger value="by_project">По проектам</TabsTrigger>
                <TabsTrigger value="by_avatar">По аватарам</TabsTrigger>
              </TabsList>

              {/* By Operation */}
              <TabsContent value="by_operation">
                {!breakdown.by_operation?.length ? (
                  <p className="text-center text-text-muted py-4">Нет данных</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Тип операции</TableHead>
                        <TableHead className="text-right">Токены</TableHead>
                        <TableHead className="text-right">Запросы</TableHead>
                        <TableHead className="text-right">Стоимость</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdown.by_operation.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.operation_type === "chat"
                              ? "Чат"
                              : item.operation_type === "embedding"
                                ? "Embedding"
                                : item.operation_type === "rerank"
                                  ? "Rerank"
                                  : item.operation_type}
                          </TableCell>
                          <TableCell className="text-right">
                            {(item.tokens ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">{item.requests}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.cost_usd)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* By Model */}
              <TabsContent value="by_model">
                {!breakdown.by_model?.length ? (
                  <p className="text-center text-text-muted py-4">Нет данных</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Модель</TableHead>
                        <TableHead className="text-right">Токены</TableHead>
                        <TableHead className="text-right">Запросы</TableHead>
                        <TableHead className="text-right">Стоимость</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdown.by_model.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.model}</TableCell>
                          <TableCell className="text-right">
                            {(item.tokens ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">{item.requests}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.cost_usd)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* By Project */}
              <TabsContent value="by_project">
                {!breakdown.by_project?.length ? (
                  <p className="text-center text-text-muted py-4">Нет данных</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Проект ID</TableHead>
                        <TableHead className="text-right">Токены</TableHead>
                        <TableHead className="text-right">Запросы</TableHead>
                        <TableHead className="text-right">Стоимость</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdown.by_project.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium font-mono text-xs">
                            {item.project_id}
                          </TableCell>
                          <TableCell className="text-right">
                            {(item.tokens ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">{item.requests}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.cost_usd)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* By Avatar */}
              <TabsContent value="by_avatar">
                {!breakdown.by_avatar?.length ? (
                  <p className="text-center text-text-muted py-4">Нет данных</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Аватар ID</TableHead>
                        <TableHead className="text-right">Токены</TableHead>
                        <TableHead className="text-right">Запросы</TableHead>
                        <TableHead className="text-right">Стоимость</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdown.by_avatar.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium font-mono text-xs">
                            {item.avatar_id}
                          </TableCell>
                          <TableCell className="text-right">
                            {(item.tokens ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">{item.requests}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.cost_usd)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Информация о плане</CardTitle>
              <CardDescription>
                Текущий план и его возможности
              </CardDescription>
            </div>
            {summary && <PlanBadge plan={summary.plan} />}
          </div>
        </CardHeader>
        <CardContent>
          {planLoading ? (
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
                {summary?.plan !== "enterprise" && (
                  <div className="pt-4 border-t border-border">
                    <Button onClick={() => setUpgradeDialogOpen(true)}>
                      <TrendingUp className="size-4 mr-2" />
                      Улучшить план
                    </Button>
                  </div>
                )}

                {/* Plan Upgrade Dialog */}
                <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Улучшить план</DialogTitle>
                      <DialogDescription>
                        Выберите желаемый план и отправьте заявку. Мы свяжемся с вами в ближайшее время.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="plan">Желаемый план</Label>
                        <Select
                          value={selectedPlan}
                          onValueChange={(value) => setSelectedPlan(value as BillingPlan)}
                        >
                          <SelectTrigger id="plan">
                            <SelectValue placeholder="Выберите план" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_PLANS.filter(
                              (p) => p.value !== summary?.plan && p.value !== "starter"
                            ).map((plan) => (
                              <SelectItem key={plan.value} value={plan.value}>
                                {plan.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Сообщение (необязательно)</Label>
                        <Textarea
                          id="message"
                          placeholder="Расскажите о ваших потребностях..."
                          value={upgradeMessage}
                          onChange={(e) => setUpgradeMessage(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setUpgradeDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={handleUpgradeSubmit}
                        disabled={!selectedPlan || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner className="mr-2 size-4" />
                            Отправка...
                          </>
                        ) : (
                          "Отправить заявку"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )
          )}
        </CardContent>
      </Card>
      </div>
    </PageContainer>
  );
}

