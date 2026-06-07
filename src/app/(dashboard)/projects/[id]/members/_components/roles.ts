import type { ProjectMemberRole } from "@/shared/types/api";

/** Человекочитаемые названия ролей участника проекта (R-01/R-02). */
export const PROJECT_ROLE_LABELS: Record<ProjectMemberRole, string> = {
  owner: "Владелец",
  admin: "Администратор",
  manager: "Менеджер",
  content_manager: "Контент-менеджер",
  viewer: "Наблюдатель",
};

/** Роли, которые можно назначить участнику (без owner — он закреплён за создателем). */
export const ASSIGNABLE_PROJECT_ROLES: ProjectMemberRole[] = [
  "admin",
  "manager",
  "content_manager",
  "viewer",
];
