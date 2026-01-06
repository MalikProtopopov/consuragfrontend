import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  Document,
  DocumentsListResponse,
  DocumentsListParams,
  ChunksListResponse,
  ChunksListParams,
  UploadDocumentResponse,
  ReindexResponse,
  DeleteResponse,
} from "@/shared/types/api";

/**
 * Document API methods
 */
export const documentApi = {
  /**
   * Get documents list for avatar
   */
  list: async (
    projectId: string,
    avatarId: string,
    params?: DocumentsListParams
  ): Promise<DocumentsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params?.status) queryParams.set("status", params.status);

    const query = queryParams.toString();
    const baseUrl = API_ENDPOINTS.DOCUMENTS.LIST(projectId, avatarId);
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    return apiClient.get<DocumentsListResponse>(url);
  },

  /**
   * Get document by ID
   */
  getById: async (
    projectId: string,
    avatarId: string,
    documentId: string
  ): Promise<Document> => {
    return apiClient.get<Document>(
      API_ENDPOINTS.DOCUMENTS.BY_ID(projectId, avatarId, documentId)
    );
  },

  /**
   * Upload document
   */
  upload: async (
    projectId: string,
    avatarId: string,
    file: File
  ): Promise<UploadDocumentResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.upload<UploadDocumentResponse>(
      API_ENDPOINTS.DOCUMENTS.UPLOAD(projectId, avatarId),
      formData
    );
  },

  /**
   * Delete document
   */
  delete: async (
    projectId: string,
    avatarId: string,
    documentId: string
  ): Promise<DeleteResponse> => {
    return apiClient.delete<DeleteResponse>(
      API_ENDPOINTS.DOCUMENTS.DELETE(projectId, avatarId, documentId)
    );
  },

  /**
   * Reindex document
   */
  reindex: async (
    projectId: string,
    avatarId: string,
    documentId: string
  ): Promise<ReindexResponse> => {
    return apiClient.post<void, ReindexResponse>(
      API_ENDPOINTS.DOCUMENTS.REINDEX(projectId, avatarId, documentId)
    );
  },

  /**
   * Get document chunks
   */
  getChunks: async (
    projectId: string,
    avatarId: string,
    documentId: string,
    params?: ChunksListParams
  ): Promise<ChunksListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.set("skip", String(params.skip));
    if (params?.limit !== undefined) queryParams.set("limit", String(params.limit));

    const query = queryParams.toString();
    const baseUrl = API_ENDPOINTS.DOCUMENTS.CHUNKS(projectId, avatarId, documentId);
    const url = query ? `${baseUrl}?${query}` : baseUrl;

    // API возвращает массив напрямую
    return apiClient.get<ChunksListResponse>(url);
  },
};

