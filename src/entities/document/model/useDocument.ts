"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "../api/documentApi";
import type { DocumentsListParams, ChunksListParams } from "@/shared/types/api";

/**
 * Query keys for documents
 */
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (projectId: string, avatarId: string, params?: DocumentsListParams) =>
    [...documentKeys.lists(), projectId, avatarId, params] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (projectId: string, avatarId: string, documentId: string) =>
    [...documentKeys.details(), projectId, avatarId, documentId] as const,
  chunks: (projectId: string, avatarId: string, documentId: string, params?: ChunksListParams) =>
    [...documentKeys.all, "chunks", projectId, avatarId, documentId, params] as const,
};

/**
 * Hook to get documents list
 */
export function useDocuments(
  projectId: string,
  avatarId: string,
  params?: DocumentsListParams
) {
  return useQuery({
    queryKey: documentKeys.list(projectId, avatarId, params),
    queryFn: () => documentApi.list(projectId, avatarId, params),
    enabled: !!projectId && !!avatarId,
    refetchInterval: (query) => {
      // Auto-refetch if any document is processing
      const data = query.state.data;
      if (data?.items.some((doc) => 
        ["pending", "uploading", "parsing", "chunking", "embedding"].includes(doc.parsing_status)
      )) {
        return 3000; // Refetch every 3 seconds
      }
      return false;
    },
  });
}

/**
 * Hook to get document by ID
 */
export function useDocument(projectId: string, avatarId: string, documentId: string) {
  return useQuery({
    queryKey: documentKeys.detail(projectId, avatarId, documentId),
    queryFn: () => documentApi.getById(projectId, avatarId, documentId),
    enabled: !!projectId && !!avatarId && !!documentId,
  });
}

/**
 * Hook to get document chunks
 */
export function useDocumentChunks(
  projectId: string,
  avatarId: string,
  documentId: string,
  params?: ChunksListParams
) {
  return useQuery({
    queryKey: documentKeys.chunks(projectId, avatarId, documentId, params),
    queryFn: () => documentApi.getChunks(projectId, avatarId, documentId, params),
    enabled: !!projectId && !!avatarId && !!documentId,
  });
}

/**
 * Hook to upload document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      avatarId,
      file,
    }: {
      projectId: string;
      avatarId: string;
      file: File;
    }) => documentApi.upload(projectId, avatarId, file),
    onSuccess: (_, { projectId, avatarId }) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.list(projectId, avatarId),
      });
    },
  });
}

/**
 * Hook to delete document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      avatarId,
      documentId,
    }: {
      projectId: string;
      avatarId: string;
      documentId: string;
    }) => documentApi.delete(projectId, avatarId, documentId),
    onSuccess: (_, { projectId, avatarId }) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.list(projectId, avatarId),
      });
    },
  });
}

/**
 * Hook to reindex document
 */
export function useReindexDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      avatarId,
      documentId,
    }: {
      projectId: string;
      avatarId: string;
      documentId: string;
    }) => documentApi.reindex(projectId, avatarId, documentId),
    onSuccess: (_, { projectId, avatarId }) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.list(projectId, avatarId),
      });
    },
  });
}

