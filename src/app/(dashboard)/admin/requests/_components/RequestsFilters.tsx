import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { PlanRequestType, PlanRequestStatus } from "@/shared/types/api";
import { statusLabels, typeLabels } from "./constants";

type StatusFilter = PlanRequestStatus | "all";
type TypeFilter = PlanRequestType | "all";

interface RequestsFiltersProps {
  statusFilter: StatusFilter;
  typeFilter: TypeFilter;
  total: number;
  onStatusChange: (value: StatusFilter) => void;
  onTypeChange: (value: TypeFilter) => void;
}

export function RequestsFilters({
  statusFilter,
  typeFilter,
  total,
  onStatusChange,
  onTypeChange,
}: RequestsFiltersProps) {
  return (
    <div className="flex gap-4 mb-6">
      <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
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

      <Select value={typeFilter} onValueChange={(v) => onTypeChange(v as TypeFilter)}>
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

      <div className="ml-auto text-sm text-text-muted self-center">Всего: {total}</div>
    </div>
  );
}
