"use client";

import * as React from "react";

import { Badge, type BadgeProps } from "@/shared/ui/badge";
import type {
  AvatarStatus,
  ConversationStatus,
  EndUserStatus,
  PlanRequestStatus,
  UserStatus,
} from "@/shared/types/api";

/**
 * Единый компонент для статус-бейджей с per-domain конфигами.
 *
 * Объединяет инлайн-маппинги `status → variant/label`, разбросанные по страницам
 * (end-user, conversation, avatar, telegram is_active, plan-request).
 *
 * Палитра: используем subtle-варианты `Badge`, т.к. белый текст на success/warning
 * не проходит контраст (docs/UI_REDESIGN_PLAN.md §1.2).
 *
 * Использование:
 *   <StatusBadge domain="endUser" value={user.status} />
 *   <EndUserStatusBadge status={user.status} />
 *   <ActiveStatusBadge active={integration.is_active} />
 */

type StatusVariant = NonNullable<BadgeProps["variant"]>;

interface StatusEntry {
  label: string;
  variant: StatusVariant;
}

type DomainConfig<T extends string> = Record<T, StatusEntry>;

const endUserConfig: DomainConfig<EndUserStatus> = {
  active: { label: "Активен", variant: "success-subtle" },
  blocked: { label: "Заблокирован", variant: "error-subtle" },
  archived: { label: "Архив", variant: "secondary" },
};

const conversationConfig: DomainConfig<ConversationStatus> = {
  active: { label: "Активен", variant: "success-subtle" },
  ended: { label: "Завершён", variant: "secondary" },
  archived: { label: "Архив", variant: "secondary" },
};

const avatarConfig: DomainConfig<AvatarStatus> = {
  active: { label: "Активен", variant: "success-subtle" },
  draft: { label: "Черновик", variant: "secondary" },
  inactive: { label: "Неактивен", variant: "outline" },
  training: { label: "Обучается", variant: "info-subtle" },
};

const platformUserConfig: DomainConfig<UserStatus> = {
  active: { label: "Активен", variant: "success-subtle" },
  inactive: { label: "Неактивен", variant: "secondary" },
  suspended: { label: "Заблокирован", variant: "error-subtle" },
  pending: { label: "Ожидает активации", variant: "warning-subtle" },
};

const planRequestConfig: DomainConfig<PlanRequestStatus> = {
  new: { label: "Новая", variant: "warning-subtle" },
  in_progress: { label: "В работе", variant: "info-subtle" },
  completed: { label: "Завершена", variant: "success-subtle" },
  rejected: { label: "Отклонена", variant: "error-subtle" },
};

// boolean-домен (telegram is_active, telegram-сессии)
type ActiveValue = boolean;
const activeConfig: DomainConfig<"true" | "false"> = {
  true: { label: "Активен", variant: "success-subtle" },
  false: { label: "Неактивен", variant: "secondary" },
};

const domainConfigs = {
  endUser: endUserConfig,
  conversation: conversationConfig,
  avatar: avatarConfig,
  platformUser: platformUserConfig,
  planRequest: planRequestConfig,
} as const;

type DomainValueMap = {
  endUser: EndUserStatus;
  conversation: ConversationStatus;
  avatar: AvatarStatus;
  platformUser: UserStatus;
  planRequest: PlanRequestStatus;
  active: ActiveValue;
};

type Domain = keyof DomainValueMap;

type StatusBadgeProps<D extends Domain> = {
  domain: D;
  value: DomainValueMap[D];
  /** Кастомный лейбл (напр. "Опубликован" для аватара или "@username" для telegram). */
  label?: React.ReactNode;
} & Omit<BadgeProps, "variant" | "children">;

function resolveEntry<D extends Domain>(
  domain: D,
  value: DomainValueMap[D],
): StatusEntry {
  if (domain === "active") {
    return activeConfig[(value as ActiveValue) ? "true" : "false"];
  }
  const config = domainConfigs[domain as Exclude<Domain, "active">];
  const entry = (config as Record<string, StatusEntry>)[String(value)];
  // fallback на случай неизвестного статуса с бэкенда — показываем сырое значение
  return entry ?? { label: String(value), variant: "outline" };
}

function StatusBadge<D extends Domain>({
  domain,
  value,
  label,
  ...badgeProps
}: StatusBadgeProps<D>) {
  const entry = resolveEntry(domain, value);
  return (
    <Badge variant={entry.variant} {...badgeProps}>
      {label ?? entry.label}
    </Badge>
  );
}

// --- Тонкие обёртки под конкретные домены (эргономика на call-sites) ---

type DomainBadgeProps<D extends Domain> = Omit<
  StatusBadgeProps<D>,
  "domain" | "value"
>;

function EndUserStatusBadge({
  status,
  ...rest
}: { status: EndUserStatus } & DomainBadgeProps<"endUser">) {
  return <StatusBadge domain="endUser" value={status} {...rest} />;
}

function ConversationStatusBadge({
  status,
  ...rest
}: { status: ConversationStatus } & DomainBadgeProps<"conversation">) {
  return <StatusBadge domain="conversation" value={status} {...rest} />;
}

function AvatarStatusBadge({
  status,
  ...rest
}: { status: AvatarStatus } & DomainBadgeProps<"avatar">) {
  return <StatusBadge domain="avatar" value={status} {...rest} />;
}

function PlatformUserStatusBadge({
  status,
  ...rest
}: { status: UserStatus } & DomainBadgeProps<"platformUser">) {
  return <StatusBadge domain="platformUser" value={status} {...rest} />;
}

function PlanRequestStatusBadge({
  status,
  ...rest
}: { status: PlanRequestStatus } & DomainBadgeProps<"planRequest">) {
  return <StatusBadge domain="planRequest" value={status} {...rest} />;
}

function ActiveStatusBadge({
  active,
  ...rest
}: { active: boolean } & DomainBadgeProps<"active">) {
  return <StatusBadge domain="active" value={active} {...rest} />;
}

export {
  StatusBadge,
  EndUserStatusBadge,
  ConversationStatusBadge,
  AvatarStatusBadge,
  PlatformUserStatusBadge,
  PlanRequestStatusBadge,
  ActiveStatusBadge,
};
