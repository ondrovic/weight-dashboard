// Utility functions for file handling

import {
  FileType,
  FILE_EXTENSIONS,
  MIME_TYPES,
  FileMetadata,
  FileValidationResult,
  ParsedFileResult
} from '../types/Files
import { v4 as uuidv4 } from 'uuid';

/**
 * Get file type from file extension
 */
export const getFileTypeFromExtension = (filename: string): FileType | null => {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return null;

  return FILE_EXTENSIONS[extension] || null;
};

/**
 * Get file type from MIME type
 */
export const getFileTypeFromMimeType = (mimeType: string): FileType | null => {
  return MIME_TYPES[mimeType] || null;
};

/**
 * Detect file type from file object
 */
export const detectFileType = (file: File): FileType | null => {
  // First try to detect from MIME type
  const mimeTypeResult = getFileTypeFromMimeType(file.type);
  if (mimeTypeResult) return mimeTypeResult;

  // Then try to detect from extension
  return getFileTypeFromExtension(file.name);
};

/**
 * Create file metadata from File object
 */
export const createFileMetadata = (file: File): FileMetadata => {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const fileType = detectFileType(file) || 'text'; // Default to text if type can't be determined

  return {
    id: uuidv4(),
    name: file.name,
    size: file.size,
    type: fileType,
    extension,
    mimeType: file.type,
    lastModified: new Date(file.lastModified),
    uploadDate: new Date()
  };
};

/**
 * Validate file against constraints
 */
export const validateFile = (
  file: File,
  {
    maxSize = Infinity,
    allowedTypes = ['csv', 'excel', 'json', 'text', 'image']
  }: {
    maxSize?: number,
    allowedTypes?: FileType[]
  } = {}
): FileValidationResult => {
  const errors: string[] = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size exceeds the maximum allowed size of ${formatFileSize(maxSize)}`);
  }

  // Check file type
  const fileType = detectFileType(file);
  if (!fileType) {
    errors.push(`Unable to determine file type for '${file.name}'`);
  } else if (!allowedTypes.includes(fileType)) {
    errors.push(`File type '${fileType}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Read file as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.readAsText(file);
  });
};

/**
 * Read file as ArrayBuffer
 */
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Read file as Data URL
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Parse CSV file
 */
export const parseCSV = async <T>(file: File): Promise<ParsedFileResult<T[]>> => {
  try {
    const text = await readFileAsText(file);

    // Simple CSV parser - for production use a library like PapaParse
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());

    const data = lines.slice(1)
      .filter(line => line.trim() !== '') // Skip empty lines
      .map(line => {
        const values = line.split(',');
        const row: any = {};

        headers.forEach((header, index) => {
          const value = values[index]?.trim() || '';

          // Try to convert to number if it looks like a number
          if (/^-?\d+(\.\d+)?$/.test(value)) {
            row[header] = parseFloat(value);
          } else {
            row[header] = value;
          }
        });

        return row;
      });

    return {
      data: data as T[],
      fileName: file.name,
      fileType: 'csv',
      parsedAt: new Date()
    };
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    throw new Error(`Failed to parse CSV file: ${file.name}`);
  }
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
};

/**
 * Get file icon based on file type
 */
export const getFileIcon = (fileType: FileType): string => {
  switch (fileType) {
    case 'csv':
      return 'table';
    case 'excel':
      return 'file-spreadsheet';
    case 'json':
      return 'code';
    case 'text':
      return 'file-text';
    case 'image':
      return 'image';
    default:
      return 'file';
  }
};

/**
 * Download content as a file
 */
export const downloadFile = (
  content: string | ArrayBuffer,
  filename: string,
  mimeType: string = 'text/plain'
): void => {
  const blob = new Blob(
    [content],
    { type: mimeType }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Convert a base64 string to a File object
 */
export const base64ToFile = (
  base64: string,
  filename: string,
  mimeType: string = 'application/octet-stream'
): File => {
  // Remove data URL prefix if it exists
  const base64Data = base64.includes(',')
    ? base64.split(',')[1]
    : base64;

  // Convert base64 to ArrayBuffer
  const binaryString = window.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mimeType });

  return new File([blob], filename, { type: mimeType });
};