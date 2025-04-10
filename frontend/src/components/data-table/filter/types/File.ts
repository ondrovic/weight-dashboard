// Type definitions for file handling functionality

/**
 * File types that can be handled by the application
 */
export type FileType = 'csv' | 'excel' | 'json' | 'text' | 'image';

/**
 * File extensions mapped to their respective file types
 */
export const FILE_EXTENSIONS: Record<string, FileType> = {
  // CSV files
  'csv': 'csv',
  
  // Excel files
  'xlsx': 'excel',
  'xls': 'excel',
  
  // JSON files
  'json': 'json',
  
  // Text files
  'txt': 'text',
  'md': 'text',
  
  // Image files
  'jpg': 'image',
  'jpeg': 'image',
  'png': 'image',
  'gif': 'image',
  'svg': 'image'
};

/**
 * MIME types mapped to their respective file types
 */
export const MIME_TYPES: Record<string, FileType> = {
  // CSV files
  'text/csv': 'csv',
  
  // Excel files
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'excel',
  'application/vnd.ms-excel': 'excel',
  
  // JSON files
  'application/json': 'json',
  
  // Text files
  'text/plain': 'text',
  'text/markdown': 'text',
  
  // Image files
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/svg+xml': 'image'
};

/**
 * Interface for file metadata
 */
export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: FileType;
  extension: string;
  mimeType: string;
  lastModified: Date;
  uploadDate: Date;
}

/**
 * Interface for file upload configuration
 */
export interface FileUploadConfig {
  maxSize: number; // Maximum file size in bytes
  allowedTypes: FileType[]; // Allowed file types
  multiple: boolean; // Whether multiple files can be uploaded at once
  dropZoneText: string; // Text to display in the drop zone
  uploadUrl: string; // URL to upload files to
}

/**
 * Interface for file validation result
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Interface for parsed file result
 */
export interface ParsedFileResult<T> {
  data: T;
  fileName: string;
  fileType: FileType;
  parsedAt: Date;
}

/**
 * Progress status for file operations
 */
export enum FileOperationStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * Interface for file operation progress
 */
export interface FileOperationProgress {
  status: FileOperationStatus;
  progress: number; // 0-100
  message?: string;
  error?: Error;
}