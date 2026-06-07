import { TrendingUp, Calendar, Phone } from "lucide-react";
import type { PlanRequestType, PlanRequestStatus } from "@/shared/types/api";

export const statusLabels: Record<PlanRequestStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Завершена",
  rejected: "Отклонена",
};

export const typeLabels: Record<PlanRequestType, string> = {
  plan_upgrade: "Повышение тарифа",
  demo_request: "Запрос демо",
  contact_sales: "Связь с продажами",
};

export const TypeIcon = ({ type }: { type: PlanRequestType }) => {
  switch (type) {
    case "plan_upgrade":
      return <TrendingUp className="size-4" />;
    case "demo_request":
      return <Calendar className="size-4" />;
    case "contact_sales":
      return <Phone className="size-4" />;
  }
};
