/**
 * Document API types based on OpenAPI specification
 */

// Document processing status
export type DocumentStatus =
  | "pending"
  | "uploading"
  | "parsing"
  | "chunking"
  | "embedding"
  | "indexed"
  | "failed";

// Document response
export interface Document {
  id: string;
  avatar_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  parsing_status: DocumentStatus;
  chunks_count: number;
  error_message: string | null;
  processing_progress: number; // 0-100
  created_at: string;
  updated_at: string;
  indexed_at: string | null;
}

// Document chunk
export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  text: string;
  page_number: number | null;
  section_title: string | null;
  token_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Documents list response
export interface DocumentsListResponse {
  items: Document[];
  total: number;
  skip: number;
  limit: number;
}

// Documents list params
export interface DocumentsListParams {
  skip?: number;
  limit?: number;
  status?: DocumentStatus;
}

// Chunks list response - API возвращает массив напрямую
export type ChunksListResponse = DocumentChunk[];

// Chunks list params
export interface ChunksListParams {
  skip?: number;
  limit?: number;
}

// Upload document response
export interface UploadDocumentResponse {
  id: string;
  filename: string;
  parsing_status: DocumentStatus;
  message: string;
}

// Reindex response
export interface ReindexResponse {
  id: string;
  parsing_status: DocumentStatus;
  message: string;
}

// Supported file types
export const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/html",
] as const;

export const FILE_SIZE_LIMITS = {
  pdf: 50 * 1024 * 1024, // 50 MB
  docx: 20 * 1024 * 1024, // 20 MB
  txt: 10 * 1024 * 1024, // 10 MB
  md: 10 * 1024 * 1024, // 10 MB
  html: 10 * 1024 * 1024, // 10 MB
} as const;

