"use client";

import { useState } from "react";
import {
  FileText,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  Trash2,
} from "lucide-react";
import { usePlanRequests, useDeletePlanRequest } from "@/entities/plan-request";
import { PageContainer, PageHeader } from "@/widgets/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
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
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import type {
  PlanRequestType,
  PlanRequestStatus,
  PlanRequestDetail,
} from "@/shared/types/api";
import { PlanRequestDetailDialog } from "./_components/PlanRequestDetailDialog";

// Labels
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
      return <TrendingUp className="size-4" />;
    case "demo_request":
      return <Calendar className="size-4" />;
    case "contact_sales":
      return <Phone className="size-4" />;
  }
};

const ContactInfo = ({ request }: { request: PlanRequestDetail }) => {
  if (request.user?.email) {
    return (
      <div className="flex items-center gap-1.5">
        <Mail className="size-3.5 text-text-muted" />
        <span className="text-sm">{request.user.email}</span>
      </div>
    );
  }
  if (request.contact_email) {
    return (
      <div className="flex items-center gap-1.5">
        <Mail className="size-3.5 text-text-muted" />
        <span className="text-sm">{request.contact_email}</span>
      </div>
    );
  }
  if (request.contact_telegram) {
    return (
      <div className="flex items-center gap-1.5">
        <MessageCircle className="size-3.5 text-text-muted" />
        <span className="text-sm">{request.contact_telegram}</span>
      </div>
    );
  }
  if (request.contact_phone) {
    return (
      <div className="flex items-center gap-1.5">
        <Phone className="size-3.5 text-text-muted" />
        <span className="text-sm">{request.contact_phone}</span>
      </div>
    );
  }
  return <span className="text-text-muted text-sm">—</span>;
};

export default function PlanRequestsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<PlanRequestStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<PlanRequestType | "all">("all");
  const [selectedRequest, setSelectedRequest] = useState<PlanRequestDetail | null>(null);
  const [deleteRequest, setDeleteRequest] = useState<PlanRequestDetail | null>(null);
  const limit = 20;

  const { data, isLoading } = usePlanRequests({
    skip: page * limit,
    limit,
    status: statusFilter === "all" ? undefined : statusFilter,
    request_type: typeFilter === "all" ? undefined : typeFilter,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const deleteMutation = useDeletePlanRequest();

  const requests = data?.requests || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (!deleteRequest) return;
    await deleteMutation.mutateAsync(deleteRequest.id);
    setDeleteRequest(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Заявки на тарифы"
        description="Управление заявками пользователей на повышение тарифа, демо и связь с продажами"
      />

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as typeof statusFilter);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v as typeof typeFilter);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Тип заявки" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            {Object.entries(typeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto text-sm text-text-muted self-center">
          Всего: {total}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Заявки</CardTitle>
          <CardDescription>Список заявок от пользователей</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
              <p className="text-text-secondary">Нет заявок</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Контакт</TableHead>
                    <TableHead>План</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="cursor-pointer hover:bg-bg-hover">
                      <TableCell className="text-xs font-mono">
                        {formatDate(request.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon type={request.request_type} />
                          <span className="text-sm">{typeLabels[request.request_type]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ContactInfo request={request} />
                      </TableCell>
                      <TableCell>
                        {request.requested_plan ? (
                          <Badge variant="outline" className="capitalize">
                            {request.requested_plan}
                          </Badge>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[request.status]}>
                          {statusLabels[request.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteRequest(request)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 0) setPage(page - 1);
                          }}
                        />
                      </PaginationItem>
                      {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                        // Show pages around current page
                        let pageNum = i;
                        if (totalPages > 5) {
                          if (page < 3) {
                            pageNum = i;
                          } else if (page > totalPages - 3) {
                            pageNum = totalPages - 5 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              isActive={page === pageNum}
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(pageNum);
                              }}
                            >
                              {pageNum + 1}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < totalPages - 1) setPage(page + 1);
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedRequest && (
        <PlanRequestDetailDialog
          request={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRequest} onOpenChange={(open) => !open && setDeleteRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заявку?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Заявка будет удалена безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

