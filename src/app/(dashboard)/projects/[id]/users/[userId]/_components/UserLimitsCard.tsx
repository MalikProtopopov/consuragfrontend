"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useUpdateEndUserLimits } from "@/entities/end-user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Progress } from "@/shared/ui/progress";
import { getApiErrorMessage } from "@/shared/lib";
import { toast } from "sonner";
import type { EndUserLimits, UpdateEndUserLimitsRequest } from "@/shared/types/api";

interface UserLimitsCardProps {
  projectId: string;
  endUserId: string;
  limits: EndUserLimits;
}

export function UserLimitsCard({ projectId, endUserId, limits }: UserLimitsCardProps) {
  const { mutate: updateLimits, isPending: isUpdatingLimits } = useUpdateEndUserLimits();

  const [limitsForm, setLimitsForm] = useState<UpdateEndUserLimitsRequest>({
    daily_tokens_limit: limits.daily_tokens_limit,
    monthly_tokens_limit: limits.monthly_tokens_limit,
    daily_messages_limit: limits.daily_messages_limit,
    monthly_messages_limit: limits.monthly_messages_limit,
    rate_limit_per_minute: limits.rate_limit_per_minute,
  });
  const [isModified, setIsModified] = useState(false);

  const handleSaveLimits = () => {
    updateLimits(
      { projectId, endUserId, data: limitsForm },
      {
        onSuccess: () => {
          toast.success("Лимиты обновлены");
          setIsModified(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Лимиты</CardTitle>
            <CardDescription>Ограничения использования</CardDescription>
          </div>
          {isModified && (
            <Button size="sm" onClick={handleSaveLimits} disabled={isUpdatingLimits}>
              <Save className="mr-2 h-4 w-4" />
              Сохранить
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily tokens */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-text-secondary">Дневной лимит токенов</Label>
            <Input
              type="number"
              placeholder="Без лимита"
              value={limitsForm.daily_tokens_limit ?? ""}
              onChange={(e) => {
                setLimitsForm({
                  ...limitsForm,
                  daily_tokens_limit: e.target.value ? Number(e.target.value) : null,
                });
                setIsModified(true);
              }}
              className="w-32 h-8 text-right"
            />
          </div>
          {limits.daily_tokens_limit && (
            <div className="space-y-1">
              <Progress value={(limits.tokens_used_today / limits.daily_tokens_limit) * 100} />
              <p className="text-xs text-text-muted text-right">
                {(limits.tokens_used_today ?? 0).toLocaleString()} /{" "}
                {(limits.daily_tokens_limit ?? 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Monthly tokens */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-text-secondary">Месячный лимит токенов</Label>
            <Input
              type="number"
              placeholder="Без лимита"
              value={limitsForm.monthly_tokens_limit ?? ""}
              onChange={(e) => {
                setLimitsForm({
                  ...limitsForm,
                  monthly_tokens_limit: e.target.value ? Number(e.target.value) : null,
                });
                setIsModified(true);
              }}
              className="w-32 h-8 text-right"
            />
          </div>
          {limits.monthly_tokens_limit && (
            <div className="space-y-1">
              <Progress value={(limits.tokens_used_month / limits.monthly_tokens_limit) * 100} />
              <p className="text-xs text-text-muted text-right">
                {(limits.tokens_used_month ?? 0).toLocaleString()} /{" "}
                {(limits.monthly_tokens_limit ?? 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Daily messages */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-text-secondary">Дневной лимит сообщений</Label>
            <Input
              type="number"
              placeholder="Без лимита"
              value={limitsForm.daily_messages_limit ?? ""}
              onChange={(e) => {
                setLimitsForm({
                  ...limitsForm,
                  daily_messages_limit: e.target.value ? Number(e.target.value) : null,
                });
                setIsModified(true);
              }}
              className="w-32 h-8 text-right"
            />
          </div>
          {limits.daily_messages_limit && (
            <div className="space-y-1">
              <Progress
                value={(limits.messages_sent_today / limits.daily_messages_limit) * 100}
              />
              <p className="text-xs text-text-muted text-right">
                {limits.messages_sent_today} / {limits.daily_messages_limit}
              </p>
            </div>
          )}
        </div>

        {/* Rate limit */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-text-secondary">Rate limit (сообщ/мин)</Label>
            <Input
              type="number"
              value={limitsForm.rate_limit_per_minute ?? limits.rate_limit_per_minute}
              onChange={(e) => {
                setLimitsForm({
                  ...limitsForm,
                  rate_limit_per_minute: Number(e.target.value),
                });
                setIsModified(true);
              }}
              className="w-32 h-8 text-right"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
