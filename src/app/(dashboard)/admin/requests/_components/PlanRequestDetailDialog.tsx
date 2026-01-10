"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  User,
  Clock,
  Globe,
} from "lucide-react";
import { useUpdatePlanRequest } from "@/entities/plan-request";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Progress } from "@/shared/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import type {
  PlanRequestDetail,
  PlanRequestStatus,
  PlanRequestType,
} from "@/shared/types/api";

interface PlanRequestDetailDialogProps {
  request: PlanRequestDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<PlanRequestStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Завершена",
  rejected: "Отклонена",
};

const typeLabels: Record<PlanRequestType, string> = {
  plan_upgrade: "Повышение тарифа",
  demo_request: "Запрос демо",
  contact_sales: "Связь с продажами",
};

const statusColors: Record<
  PlanRequestStatus,
  "default" | "secondary" | "success" | "destructive" | "warning" | "outline"
> = {
  new: "warning",
  in_progress: "default",
  completed: "success",
  rejected: "destructive",
};

const TypeIcon = ({ type }: { type: PlanRequestType }) => {
  switch (type) {
    case "plan_upgrade":
      return <TrendingUp className="size-5" />;
    case "demo_request":
      return <Calendar className="size-5" />;
    case "contact_sales":
      return <Phone className="size-5" />;
  }
};

export function PlanRequestDetailDialog({
  request,
  open,
  onOpenChange,
}: PlanRequestDetailDialogProps) {
  const [status, setStatus] = useState<PlanRequestStatus>(request.status);
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || "");
  const updateMutation = useUpdatePlanRequest();

  // Reset form when request changes
  useEffect(() => {
    setStatus(request.status);
    setAdminNotes(request.admin_notes || "");
  }, [request]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasChanges = status !== request.status || adminNotes !== (request.admin_notes || "");

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: request.id,
      data: {
        status,
        admin_notes: adminNotes || undefined,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent-primary/10">
              <TypeIcon type={request.request_type} />
            </div>
            <div>
              <DialogTitle>{typeLabels[request.request_type]}</DialogTitle>
              <DialogDescription className="font-mono text-xs">
                ID: {request.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status & Date */}
          <div className="flex items-center justify-between">
            <Badge variant={statusColors[request.status]} className="text-sm">
              {statusLabels[request.status]}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm text-text-muted">
              <Clock className="size-4" />
              {formatDate(request.created_at)}
            </div>
          </div>

          {/* Requested Plan */}
          {request.requested_plan && (
            <div className="p-4 rounded-lg bg-bg-secondary">
              <p className="text-sm text-text-muted mb-1">Запрашиваемый план</p>
              <p className="text-lg font-semibold capitalize">{request.requested_plan}</p>
            </div>
          )}

          <Separator />

          {/* Contacts */}
          <div>
            <h4 className="text-sm font-medium mb-3">Контакты</h4>
            <div className="space-y-2">
              {request.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-text-muted" />
                  <span>{request.contact_email}</span>
                </div>
              )}
              {request.contact_telegram && (
                <div className="flex items-center gap-2">
                  <MessageCircle className="size-4 text-text-muted" />
                  <span>{request.contact_telegram}</span>
                </div>
              )}
              {request.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-text-muted" />
                  <span>{request.contact_phone}</span>
                </div>
              )}
              {!request.contact_email &&
                !request.contact_telegram &&
                !request.contact_phone &&
                !request.user && (
                  <p className="text-text-muted text-sm">Контактные данные не указаны</p>
                )}
            </div>
          </div>

          {/* User Info (if authenticated) */}
          {request.user && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Пользователь</h4>
                <div className="p-4 rounded-lg bg-bg-secondary space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-text-muted" />
                    <span className="font-medium">
                      {request.user.full_name || request.user.email}
                    </span>
                    <Badge variant="outline" className="ml-auto capitalize">
                      {request.user.role}
                    </Badge>
                  </div>
                  {request.user.full_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="size-4 text-text-muted" />
                      <span>{request.user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Clock className="size-4" />
                    <span>
                      Зарегистрирован:{" "}
                      {new Date(request.user.created_at).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Current Budget */}
          {request.current_budget && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Текущий бюджет</h4>
                <div className="p-4 rounded-lg bg-bg-secondary space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-muted">Текущий план</span>
                    <Badge variant="secondary" className="capitalize">
                      {request.current_budget.plan}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Chat токены</span>
                      <span>
                        {request.current_budget.chat_tokens_used.toLocaleString()} /{" "}
                        {request.current_budget.chat_tokens_limit.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        (request.current_budget.chat_tokens_used /
                          request.current_budget.chat_tokens_limit) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Embedding токены</span>
                      <span>
                        {request.current_budget.embedding_tokens_used.toLocaleString()} /{" "}
                        {request.current_budget.embedding_tokens_limit.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        (request.current_budget.embedding_tokens_used /
                          request.current_budget.embedding_tokens_limit) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-text-muted">Общее использование</span>
                    <span className="font-medium">
                      {request.current_budget.usage_percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Message */}
          {request.message && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-3">Сообщение</h4>
                <div className="p-4 rounded-lg bg-bg-secondary">
                  <p className="text-sm whitespace-pre-wrap">{request.message}</p>
                </div>
              </div>
            </>
          )}

          {/* IP Address */}
          {request.ip_address && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Globe className="size-3" />
              <span>IP: {request.ip_address}</span>
            </div>
          )}

          <Separator />

          {/* Admin Controls */}
          <div>
            <h4 className="text-sm font-medium mb-3">Управление</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as PlanRequestStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-notes">Заметки администратора</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Добавьте заметки по обработке заявки..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Processed Info */}
          {request.processed_at && (
            <div className="text-xs text-text-muted space-y-1">
              <p>Обработана: {formatDate(request.processed_at)}</p>
              {request.processed_by && (
                <p>Администратор: {request.processed_by}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || updateMutation.isPending}>
            {updateMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

