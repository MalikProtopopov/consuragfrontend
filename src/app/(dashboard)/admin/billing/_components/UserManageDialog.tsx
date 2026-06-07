"use client";

import * as React from "react";
import { Gift, RefreshCw, Settings2, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import {
  useUserBudget,
  useUpdateUserLimits,
  useUpdateUserPlan,
  useAddBonusTokens,
  useResetUserPeriod,
} from "@/entities/billing";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { PlanBadge } from "@/shared/ui/plan-badge";
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
import type { BillingPlan, UserBudget, UserUsage } from "@/shared/types/api";

import { planOptions } from "./constants";

interface UserManageDialogProps {
  user: UserUsage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserManageDialog({ user, open, onOpenChange }: UserManageDialogProps) {
  // Load user budget data for full details
  const { data: budget } = useUserBudget(user.user_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Управление пользователем</DialogTitle>
          <DialogDescription>
            {user.user_email ? (
              <>
                <span className="font-medium">{user.user_email}</span>
                <span className="text-xs text-text-muted font-mono ml-2">
                  ({user.user_id.slice(0, 8)}...)
                </span>
              </>
            ) : (
              <span className="font-mono text-xs">{user.user_id}</span>
            )}
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

        {/*
          Remount the form on `key` once the budget is loaded so the form
          state initializes directly from budget data — avoids the
          set-state-in-effect anti-pattern (T-3).
        */}
        <UserManageForm
          key={budget ? "budget" : "initial"}
          user={user}
          budget={budget}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

interface UserManageFormProps {
  user: UserUsage;
  budget: UserBudget | undefined;
  onClose: () => void;
}

function UserManageForm({ user, budget, onClose }: UserManageFormProps) {
  const [activeTab, setActiveTab] = React.useState("limits");

  // Form states — initialized from budget when available, else from user.
  const [chatLimit, setChatLimit] = React.useState(
    (budget?.monthly_chat_limit ?? user.chat_tokens_limit).toString(),
  );
  const [embeddingLimit, setEmbeddingLimit] = React.useState(
    (budget?.monthly_embedding_limit ?? user.embedding_tokens_limit).toString(),
  );
  const [hardLimit, setHardLimit] = React.useState(budget?.hard_limit_enabled ?? true);
  // Note: overage_allowed is controlled at plan level, not at user level
  const [newPlan, setNewPlan] = React.useState<BillingPlan>(budget?.plan ?? user.plan);
  const [bonusChatTokens, setBonusChatTokens] = React.useState("");
  const [bonusEmbeddingTokens, setBonusEmbeddingTokens] = React.useState("");
  const [bonusReason, setBonusReason] = React.useState("");

  // Mutations
  const updateLimits = useUpdateUserLimits();
  const updatePlan = useUpdateUserPlan();
  const addBonus = useAddBonusTokens();
  const resetPeriod = useResetUserPeriod();

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
    <>
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
        <Button variant="outline" onClick={onClose}>
          Закрыть
        </Button>
      </DialogFooter>
    </>
  );
}
