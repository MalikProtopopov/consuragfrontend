import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  Project,
  ProjectDetail,
  ProjectSettings,
  ProjectsListResponse,
  ProjectsListParams,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectSettingsRequest,
  ProjectMember,
  MembersListResponse,
  AddMemberRequest,
  UpdateMemberRequest,
  DeleteResponse,
} from "@/shared/types/api";

/**
 * Project API methods
 */
export const projectApi = {
  /**
   * Get projects list
   */
  list: async (params?: ProjectsListParams): Promise<ProjectsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.status) queryParams.set("status", params.status);
    if (params?.search) queryParams.set("search", params.search);

    const query = queryParams.toString();
    const url = query ? `${API_ENDPOINTS.PROJECTS.LIST}?${query}` : API_ENDPOINTS.PROJECTS.LIST;

    return apiClient.get<ProjectsListResponse>(url);
  },

  /**
   * Get project by ID
   */
  getById: async (id: string): Promise<ProjectDetail> => {
    return apiClient.get<ProjectDetail>(API_ENDPOINTS.PROJECTS.BY_ID(id));
  },

  /**
   * Create new project
   */
  create: async (data: CreateProjectRequest): Promise<Project> => {
    return apiClient.post<CreateProjectRequest, Project>(
      API_ENDPOINTS.PROJECTS.CREATE,
      data
    );
  },

  /**
   * Update project
   */
  update: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    return apiClient.put<UpdateProjectRequest, Project>(
      API_ENDPOINTS.PROJECTS.UPDATE(id),
      data
    );
  },

  /**
   * Delete project
   */
  delete: async (id: string): Promise<DeleteResponse> => {
    return apiClient.delete<DeleteResponse>(API_ENDPOINTS.PROJECTS.DELETE(id));
  },

  /**
   * Get project settings
   */
  getSettings: async (id: string): Promise<ProjectSettings> => {
    return apiClient.get<ProjectSettings>(API_ENDPOINTS.PROJECTS.SETTINGS(id));
  },

  /**
   * Update project settings
   */
  updateSettings: async (
    id: string,
    data: UpdateProjectSettingsRequest
  ): Promise<ProjectSettings> => {
    return apiClient.put<UpdateProjectSettingsRequest, ProjectSettings>(
      API_ENDPOINTS.PROJECTS.UPDATE_SETTINGS(id),
      data
    );
  },

  /**
   * Get project members
   */
  getMembers: async (id: string): Promise<MembersListResponse> => {
    return apiClient.get<MembersListResponse>(API_ENDPOINTS.PROJECTS.MEMBERS(id));
  },

  /**
   * Add member to project
   */
  addMember: async (projectId: string, data: AddMemberRequest): Promise<ProjectMember> => {
    return apiClient.post<AddMemberRequest, ProjectMember>(
      API_ENDPOINTS.PROJECTS.ADD_MEMBER(projectId),
      data
    );
  },

  /**
   * Update member
   */
  updateMember: async (
    projectId: string,
    userId: string,
    data: UpdateMemberRequest
  ): Promise<ProjectMember> => {
    return apiClient.put<UpdateMemberRequest, ProjectMember>(
      API_ENDPOINTS.PROJECTS.UPDATE_MEMBER(projectId, userId),
      data
    );
  },

  /**
   * Remove member from project
   */
  removeMember: async (projectId: string, userId: string): Promise<DeleteResponse> => {
    return apiClient.delete<DeleteResponse>(
      API_ENDPOINTS.PROJECTS.REMOVE_MEMBER(projectId, userId)
    );
  },
};

