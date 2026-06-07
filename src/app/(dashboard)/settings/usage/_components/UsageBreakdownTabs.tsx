"use client";

import * as React from "react";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import type {
  AvatarBreakdownItem,
  ModelBreakdownItem,
  OperationBreakdownItem,
  ProjectBreakdownItem,
  UsageBreakdown,
} from "@/shared/types/api";
import { formatCurrency } from "@/shared/lib";

type BreakdownItem =
  | OperationBreakdownItem
  | ModelBreakdownItem
  | ProjectBreakdownItem
  | AvatarBreakdownItem;

function operationLabel(type: OperationBreakdownItem["operation_type"]): string {
  return type === "chat"
    ? "Чат"
    : type === "embedding"
      ? "Embedding"
      : type === "rerank"
        ? "Rerank"
        : type;
}

interface BreakdownTableProps<T extends BreakdownItem> {
  items: T[] | undefined;
  /** Заголовок первой колонки. */
  label: string;
  /** Контент первой ячейки строки. */
  renderName: (item: T) => React.ReactNode;
  /** Доп. className для первой ячейки. */
  nameClassName?: string;
}

function BreakdownTable<T extends BreakdownItem>({
  items,
  label,
  renderName,
  nameClassName = "font-medium",
}: BreakdownTableProps<T>) {
  if (!items?.length) {
    return <p className="text-center text-text-muted py-4">Нет данных</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{label}</TableHead>
          <TableHead className="text-right">Токены</TableHead>
          <TableHead className="text-right">Запросы</TableHead>
          <TableHead className="text-right">Стоимость</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={index}>
            <TableCell className={nameClassName}>{renderName(item)}</TableCell>
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
  );
}

interface UsageBreakdownTabsProps {
  breakdown: UsageBreakdown | undefined;
  isLoading: boolean;
}

export function UsageBreakdownTabs({ breakdown, isLoading }: UsageBreakdownTabsProps) {
  return (
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
        {isLoading ? (
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

            <TabsContent value="by_operation">
              <BreakdownTable
                items={breakdown.by_operation}
                label="Тип операции"
                renderName={(item) => operationLabel(item.operation_type)}
              />
            </TabsContent>

            <TabsContent value="by_model">
              <BreakdownTable
                items={breakdown.by_model}
                label="Модель"
                renderName={(item) => item.model}
              />
            </TabsContent>

            <TabsContent value="by_project">
              <BreakdownTable
                items={breakdown.by_project}
                label="Проект ID"
                nameClassName="font-medium font-mono text-xs"
                renderName={(item) => item.project_id}
              />
            </TabsContent>

            <TabsContent value="by_avatar">
              <BreakdownTable
                items={breakdown.by_avatar}
                label="Аватар ID"
                nameClassName="font-medium font-mono text-xs"
                renderName={(item) => item.avatar_id}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
