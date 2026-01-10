"use client";

import * as React from "react";
import {
  Coins,
  DollarSign,
  Gift,
  RefreshCw,
  Settings2,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  usePlatformUsage,
  useUsersUsage,
  useUserBudget,
  useUpdateUserLimits,
  useUpdateUserPlan,
  useAddBonusTokens,
  useResetUserPeriod,
} from "@/entities/billing";
import { isAdmin, useAuthStore } from "@/entities/auth";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { StatsCard } from "@/shared/ui/stats-card";
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
import { Switch } from "@/shared/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { toast } from "sonner";
import type { BillingPlan, UsersUsageParams, UserUsage } from "@/shared/types/api";

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
 * Format compact number
 */
function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return value.toString();
}

const planOptions: { value: BillingPlan; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "growth", label: "Growth" },
  { value: "scale", label: "Scale" },
  { value: "enterprise", label: "Enterprise" },
];

export default function AdminBillingPage() {
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = React.useState<BillingPlan | "all">("all");
  const [page, setPage] = React.useState(0);
  const [selectedUser, setSelectedUser] = React.useState<UserUsage | null>(null);
  const [isManageDialogOpen, setIsManageDialogOpen] = React.useState(false);

  const params: UsersUsageParams = {
    skip: page * 20,
    limit: 20,
    plan: selectedPlan !== "all" ? selectedPlan : undefined,
    sort_by: "tokens_used",
    sort_order: "desc",
  };

  const { data: platformUsage, isLoading: platformLoading } = usePlatformUsage();
  const { data: usersUsage, isLoading: usersLoading } = useUsersUsage(params);

  const handleManageUser = (userItem: UserUsage) => {
    setSelectedUser(userItem);
    setIsManageDialogOpen(true);
  };

  // Get users from response (backend returns 'users' not 'items')
  const users = usersUsage?.users ?? [];
  
  // Calculate pagination info
  const totalPages = usersUsage ? Math.ceil(usersUsage.total / 20) : 0;
  const hasNextPage = (page + 1) * 20 < (usersUsage?.total ?? 0);
  const hasPrevPage = page > 0;

  // Check admin access
  if (!isAdmin(user)) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-text-muted">У вас нет доступа к этой странице</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Управление биллингом"
        description="Статистика платформы и управление лимитами пользователей"
      />

      <div className="space-y-6">

      {/* Platform Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Всего пользователей"
          value={platformLoading ? "..." : platformUsage?.total_users_with_budgets ?? 0}
          icon={Users}
        />
        <StatsCard
          title="Токенов сегодня"
          value={
            platformLoading ? "..." : formatCompact(platformUsage?.today.tokens ?? 0)
          }
          description={
            platformUsage ? formatCurrency(platformUsage.today.cost_usd) : undefined
          }
          icon={Coins}
        />
        <StatsCard
          title="Токенов за месяц"
          value={
            platformLoading
              ? "..."
              : formatCompact(platformUsage?.this_month.tokens ?? 0)
          }
          description={
            platformUsage
              ? formatCurrency(platformUsage.this_month.cost_usd)
              : undefined
          }
          icon={TrendingUp}
        />
        <StatsCard
          title="Запросов за месяц"
          value={
            platformLoading
              ? "..."
              : formatCompact(platformUsage?.this_month.requests ?? 0)
          }
          icon={DollarSign}
        />
      </div>

      {/* Users by Plan Distribution */}
      {platformUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Распределение по планам</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-5">
              {planOptions.map((plan) => {
                const count = platformUsage.users_by_plan[plan.value] ?? 0;
                const total = platformUsage.total_users_with_budgets || 1;
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
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Пользователи</CardTitle>
              <CardDescription>
                Всего: {usersUsage?.total ?? 0} пользователей с настроенными бюджетами
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedPlan}
                onValueChange={(v) => {
                  setSelectedPlan(v as BillingPlan | "all");
                  setPage(0); // Reset page when filter changes
                }}
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
          {usersLoading ? (
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
                  <TableHead>ID пользователя</TableHead>
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
                  const chatPercent = userItem.chat_tokens_limit > 0 
                    ? Math.round((userItem.chat_tokens_used / userItem.chat_tokens_limit) * 100)
                    : 0;
                  const embeddingPercent = userItem.embedding_tokens_limit > 0
                    ? Math.round((userItem.embedding_tokens_used / userItem.embedding_tokens_limit) * 100)
                    : 0;
                  
                  return (
                    <TableRow key={userItem.user_id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm text-text-primary">
                            {userItem.user_id.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-text-muted">
                            {new Date(userItem.period_start).toLocaleDateString("ru-RU")} — {new Date(userItem.period_end).toLocaleDateString("ru-RU")}
                          </p>
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
                          <p className="text-text-muted">
                            {chatPercent}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>
                            {formatCompact(userItem.embedding_tokens_used)} /{" "}
                            {formatCompact(userItem.embedding_tokens_limit)}
                          </p>
                          <p className="text-text-muted">
                            {embeddingPercent}%
                          </p>
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
                          onClick={() => handleManageUser(userItem)}
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
          {usersUsage && usersUsage.total > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <p className="text-sm text-text-muted">
                {usersUsage.total > 20 ? (
                  <>
                    Показано {page * 20 + 1} - {Math.min((page + 1) * 20, usersUsage.total)}{" "}
                    из {usersUsage.total}
                  </>
                ) : (
                  <>Всего: {usersUsage.total} пользователей</>
                )}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrevPage}
                    onClick={() => setPage(page - 1)}
                  >
                    Назад
                  </Button>
                  <span className="text-sm text-text-muted px-2">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNextPage}
                    onClick={() => setPage(page + 1)}
                  >
                    Вперед
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Management Dialog */}
      {selectedUser && (
        <UserManageDialog
          user={selectedUser}
          open={isManageDialogOpen}
          onOpenChange={setIsManageDialogOpen}
        />
      )}
      </div>
    </PageContainer>
  );
}

// User Management Dialog Component
interface UserManageDialogProps {
  user: UserUsage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UserManageDialog({ user, open, onOpenChange }: UserManageDialogProps) {
  const [activeTab, setActiveTab] = React.useState("limits");

  // Form states
  const [chatLimit, setChatLimit] = React.useState(user.chat_tokens_limit.toString());
  const [embeddingLimit, setEmbeddingLimit] = React.useState(
    user.embedding_tokens_limit.toString()
  );
  const [hardLimit, setHardLimit] = React.useState(true);
  // Note: overage_allowed is controlled at plan level, not at user level
  const [newPlan, setNewPlan] = React.useState<BillingPlan>(user.plan);
  const [bonusChatTokens, setBonusChatTokens] = React.useState("");
  const [bonusEmbeddingTokens, setBonusEmbeddingTokens] = React.useState("");
  const [bonusReason, setBonusReason] = React.useState("");

  // Mutations
  const updateLimits = useUpdateUserLimits();
  const updatePlan = useUpdateUserPlan();
  const addBonus = useAddBonusTokens();
  const resetPeriod = useResetUserPeriod();

  // Load user budget data for full details
  const { data: budget } = useUserBudget(user.user_id);

  React.useEffect(() => {
    if (budget) {
      setChatLimit(budget.monthly_chat_limit.toString());
      setEmbeddingLimit(budget.monthly_embedding_limit.toString());
      setHardLimit(budget.hard_limit_enabled);
      setNewPlan(budget.plan);
    }
  }, [budget]);
  
  // Calculate days remaining
  const daysRemaining = React.useMemo(() => {
    const end = new Date(user.period_end);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [user.period_end]);

  const handleUpdateLimits = async () => {
    try {
      await updateLimits.mutateAsync({
        userId: user.user_id,
        data: {
          monthly_chat_limit: parseInt(chatLimit, 10),
          monthly_embedding_limit: parseInt(embeddingLimit, 10),
          hard_limit_enabled: hardLimit,
        },
      });
      toast.success("Лимиты обновлены");
    } catch {
      toast.error("Ошибка при обновлении лимитов");
    }
  };

  const handleUpdatePlan = async () => {
    try {
      await updatePlan.mutateAsync({
        userId: user.user_id,
        data: { plan: newPlan },
      });
      toast.success("План обновлен");
    } catch {
      toast.error("Ошибка при обновлении плана");
    }
  };

  const handleAddBonus = async () => {
    try {
      await addBonus.mutateAsync({
        userId: user.user_id,
        data: {
          chat_tokens: bonusChatTokens ? parseInt(bonusChatTokens, 10) : undefined,
          embedding_tokens: bonusEmbeddingTokens
            ? parseInt(bonusEmbeddingTokens, 10)
            : undefined,
          reason: bonusReason || undefined,
        },
      });
      toast.success("Бонусные токены добавлены");
      setBonusChatTokens("");
      setBonusEmbeddingTokens("");
      setBonusReason("");
    } catch {
      toast.error("Ошибка при добавлении бонусных токенов");
    }
  };

  const handleResetPeriod = async () => {
    try {
      await resetPeriod.mutateAsync(user.user_id);
      toast.success("Период сброшен");
    } catch {
      toast.error("Ошибка при сбросе периода");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Управление пользователем</DialogTitle>
          <DialogDescription>
            <span className="font-mono text-xs">{user.user_id}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Current Usage Summary */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-sm text-text-muted">План</p>
            <PlanBadge plan={budget?.plan ?? user.plan} />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-text-muted">Использование</p>
            <p className="text-lg font-semibold text-text-primary">
              {(budget?.total_usage_percent ?? user.usage_percent).toFixed(1)}%
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="limits">Лимиты</TabsTrigger>
            <TabsTrigger value="plan">План</TabsTrigger>
            <TabsTrigger value="bonus">Бонусы</TabsTrigger>
            <TabsTrigger value="reset">Сброс</TabsTrigger>
          </TabsList>

          {/* Limits Tab */}
          <TabsContent value="limits" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="chatLimit">Лимит токенов чата</Label>
              <Input
                id="chatLimit"
                type="number"
                value={chatLimit}
                onChange={(e) => setChatLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="embeddingLimit">Лимит токенов embeddings</Label>
              <Input
                id="embeddingLimit"
                type="number"
                value={embeddingLimit}
                onChange={(e) => setEmbeddingLimit(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="hardLimit">Жесткий лимит</Label>
              <Switch
                id="hardLimit"
                checked={hardLimit}
                onCheckedChange={setHardLimit}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleUpdateLimits}
              disabled={updateLimits.isPending}
            >
              <Settings2 className="size-4 mr-2" />
              {updateLimits.isPending ? "Сохранение..." : "Сохранить лимиты"}
            </Button>
          </TabsContent>

          {/* Plan Tab */}
          <TabsContent value="plan" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Новый план</Label>
              <Select value={newPlan} onValueChange={(v) => setNewPlan(v as BillingPlan)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {planOptions.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleUpdatePlan}
              disabled={updatePlan.isPending || newPlan === (budget?.plan ?? user.plan)}
            >
              <TrendingUp className="size-4 mr-2" />
              {updatePlan.isPending ? "Сохранение..." : "Изменить план"}
            </Button>
          </TabsContent>

          {/* Bonus Tab */}
          <TabsContent value="bonus" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="bonusChat">Бонусные токены чата</Label>
              <Input
                id="bonusChat"
                type="number"
                placeholder="0"
                value={bonusChatTokens}
                onChange={(e) => setBonusChatTokens(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonusEmbed">Бонусные токены embeddings</Label>
              <Input
                id="bonusEmbed"
                type="number"
                placeholder="0"
                value={bonusEmbeddingTokens}
                onChange={(e) => setBonusEmbeddingTokens(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bonusReason">Причина (опционально)</Label>
              <Input
                id="bonusReason"
                placeholder="Промо акция..."
                value={bonusReason}
                onChange={(e) => setBonusReason(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleAddBonus}
              disabled={addBonus.isPending || (!bonusChatTokens && !bonusEmbeddingTokens)}
            >
              <Gift className="size-4 mr-2" />
              {addBonus.isPending ? "Добавление..." : "Добавить бонусы"}
            </Button>
          </TabsContent>

          {/* Reset Tab */}
          <TabsContent value="reset" className="space-y-4 mt-4">
            <div className="rounded-lg bg-warning/10 p-4">
              <p className="text-sm text-warning font-medium">Внимание</p>
              <p className="text-sm text-text-secondary mt-1">
                Сброс периода обнулит счетчик использованных токенов и начнет новый
                расчетный период. Это действие нельзя отменить.
              </p>
            </div>
            <div className="text-sm text-text-muted">
              <p>Текущий период:</p>
              <p>
                {new Date(user.period_start).toLocaleDateString("ru-RU")} —{" "}
                {new Date(user.period_end).toLocaleDateString("ru-RU")}
              </p>
              <p className="mt-1">Осталось дней: {daysRemaining}</p>
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleResetPeriod}
              disabled={resetPeriod.isPending}
            >
              <RefreshCw className="size-4 mr-2" />
              {resetPeriod.isPending ? "Сброс..." : "Сбросить период"}
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

