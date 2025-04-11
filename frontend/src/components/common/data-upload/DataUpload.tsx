import React from 'react';
import { FileUploadProps } from './types/file-upload.types';
import { useFileUpload } from './hooks/useFileUpload';
import { FileDropZone } from './components/FileDropZone';
import { FilePreview } from './components/FilePreview';

export const DataUpload: React.FC<FileUploadProps> = ({ 
  uploadData, 
  loading: externalLoading 
}) => {
  const {
    selectedFile,
    previewRows,
    loading: uploadLoading,
    handleFileSelect,
    handleUpload,
    resetFileState
  } = useFileUpload(uploadData);

  // Combine internal and external loading states
  const isLoading = uploadLoading || externalLoading;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Upload Weight Data
      </h2>

      <FileDropZone 
        onFileSelect={handleFileSelect}
        loading={isLoading}
      />

      {selectedFile && (
        <div className="mt-4">
          <FilePreview 
            file={selectedFile}
            previewRows={previewRows}
            onRemove={resetFileState}
          />

          <button
            type="button"
            onClick={handleUpload}
            disabled={isLoading}
            className={`mt-4 w-full px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              isLoading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
          CSV Format Requirements:
        </h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>First row must contain header names</li>
          <li>File must include at least Date and Weight columns</li>
          <li>Date format should be MM-DD-YY (e.g., "01-15-23")</li>
          <li>Weight and other metrics should be numeric values</li>
          <li>You can download a template from the "Manage" tab</li>
        </ul>
      </div>
    </div>
  );
};