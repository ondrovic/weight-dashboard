import { FileValidationResult } from '../types/file-upload.types';

export const validateCSVFile = (file: File): FileValidationResult => {
  // Check file type
  if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
    return {
      isValid: false,
      error: 'Please select a valid CSV file (.csv)'
    };
  }

  // Check file size (optional - adjust as needed)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size exceeds the maximum allowed size (10MB)'
    };
  }

  return { isValid: true };
};

export const readFileContents = (file: File): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n').slice(0, 6);
        const parsedRows = rows.map(row => row.split(','));
        resolve(parsedRows);
      } catch (error) {
        reject(new Error('Failed to read file contents'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};