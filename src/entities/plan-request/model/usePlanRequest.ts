import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { planRequestApi } from "../api/planRequestApi";
import type {
  PlanRequestListParams,
  UpdatePlanRequestData,
  CreatePlanRequestData,
} from "@/shared/types/api";

// Query keys
export const planRequestKeys = {
  all: ["plan-requests"] as const,
  lists: () => [...planRequestKeys.all, "list"] as const,
  list: (params?: PlanRequestListParams) => [...planRequestKeys.lists(), params] as const,
  details: () => [...planRequestKeys.all, "detail"] as const,
  detail: (id: string) => [...planRequestKeys.details(), id] as const,
};

/**
 * Hook to fetch plan requests list (admin only)
 */
export function usePlanRequests(params?: PlanRequestListParams) {
  return useQuery({
    queryKey: planRequestKeys.list(params),
    queryFn: () => planRequestApi.getList(params),
  });
}

/**
 * Hook to fetch single plan request (admin only)
 */
export function usePlanRequest(id: string) {
  return useQuery({
    queryKey: planRequestKeys.detail(id),
    queryFn: () => planRequestApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to update plan request (admin only)
 */
export function useUpdatePlanRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequestData }) =>
      planRequestApi.update(id, data),
    onSuccess: (updatedRequest) => {
      queryClient.invalidateQueries({ queryKey: planRequestKeys.lists() });
      queryClient.setQueryData(
        planRequestKeys.detail(updatedRequest.id),
        updatedRequest
      );
      toast.success("Заявка обновлена", {
        description: "Статус заявки успешно изменён",
      });
    },
    onError: (error) => {
      console.error("Failed to update plan request:", error);
      toast.error("Ошибка обновления", {
        description: "Не удалось обновить заявку. Попробуйте еще раз.",
      });
    },
  });
}

/**
 * Hook to delete plan request (admin only)
 */
export function useDeletePlanRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => planRequestApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planRequestKeys.lists() });
      toast.success("Заявка удалена", {
        description: "Заявка успешно удалена",
      });
    },
    onError: (error) => {
      console.error("Failed to delete plan request:", error);
      toast.error("Ошибка удаления", {
        description: "Не удалось удалить заявку. Попробуйте еще раз.",
      });
    },
  });
}

/**
 * Hook to create plan request (public)
 */
export function useCreatePlanRequest() {
  return useMutation({
    mutationFn: (data: CreatePlanRequestData) => planRequestApi.create(data),
    onSuccess: () => {
      toast.success("Заявка отправлена", {
        description: "Мы свяжемся с вами в ближайшее время",
      });
    },
    onError: (error) => {
      console.error("Failed to create plan request:", error);
      toast.error("Ошибка отправки", {
        description: "Не удалось отправить заявку. Попробуйте еще раз.",
      });
    },
  });
}

