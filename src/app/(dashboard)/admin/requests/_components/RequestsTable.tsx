import { FileText, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { PlanRequestStatusBadge } from "@/shared/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { NumberedPaginationControls } from "@/shared/ui/pagination-controls";
import { formatDate, type UsePaginationResult } from "@/shared/lib";
import type { PlanRequestDetail } from "@/shared/types/api";
import { TypeIcon, typeLabels } from "./constants";
import { ContactInfo } from "./ContactInfo";

interface RequestsTableProps {
  requests: PlanRequestDetail[];
  isLoading: boolean;
  total?: number;
  pagination: UsePaginationResult;
  onView: (request: PlanRequestDetail) => void;
  onDelete: (request: PlanRequestDetail) => void;
}

export function RequestsTable({
  requests,
  isLoading,
  total,
  pagination,
  onView,
  onDelete,
}: RequestsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-text-muted mb-4" />
        <p className="text-text-secondary">Нет заявок</p>
      </div>
    );
  }

  return (
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
                {formatDate(request.created_at, "datetime-short")}
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
                <PlanRequestStatusBadge status={request.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onView(request)}>
                    <Eye className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(request)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <NumberedPaginationControls pagination={pagination} total={total} />
    </>
  );
}
