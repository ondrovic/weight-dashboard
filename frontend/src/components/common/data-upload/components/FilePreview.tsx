import React from 'react';
import { FilePreviewProps } from '../types/file-upload.types';
import { XIcon } from '@/components/common/Icons';

export const FilePreview: React.FC<FilePreviewProps> = ({ 
  file, 
  previewRows, 
  onRemove 
}) => {
  return (
    <div>
      {/* File Info */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* CSV Preview */}
      {previewRows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <h3 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">File Preview</h3>
          <div className="border border-gray-200 dark:border-gray-700 rounded-md max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {previewRows.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={rowIndex === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}
                  >
                    {row.map((cell, cellIndex) => (
                      <td 
                        key={cellIndex} 
                        className={`px-3 py-2 text-xs ${
                          rowIndex === 0
                            ? 'font-medium text-gray-700 dark:text-gray-300'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Showing first {Math.min(5, previewRows.length - 1)} rows of data
          </p>
        </div>
      )}
    </div>
  );
};