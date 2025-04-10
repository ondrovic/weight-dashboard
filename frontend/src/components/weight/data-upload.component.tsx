import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

interface DataUploadProps {
  uploadData: (file: File) => Promise<boolean>;
  loading: boolean;
}

export const DataUpload: React.FC<DataUploadProps> = ({ uploadData, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);

  const { showToast } = useToast();

  // ---------- Drag/drop native handlers ----------
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleNativeDrag = (e: Event) => handleDrag(e as unknown as React.DragEvent<HTMLDivElement>);
  const handleNativeDrop = (e: Event) => handleDrop(e as unknown as React.DragEvent<HTMLDivElement>);

  // ---------- File input ----------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const readFileContents = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').slice(0, 6);
      setPreviewRows(rows.map(row => row.split(',')));
    };
    reader.readAsText(file);
  };

  const handleFiles = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      showToast({
        message: 'Please select a valid CSV file (.csv)',
        type: ToastType.Error,
      });
      setSelectedFile(null);
      setPreviewRows([]);
      return;
    }

    setSelectedFile(file);
    readFileContents(file);
  };

  const onButtonClick = () => inputRef.current?.click();

  // ---------- Upload ----------
  const handleUpload = async () => {
    if (!selectedFile) {
      showToast({ message: 'Please select a file first.', type: ToastType.Error });
      return;
    }

    try {
      const success = await uploadData(selectedFile);
      if (success) {
        showToast({ message: 'Data uploaded successfully!', type: ToastType.Success });
        setSelectedFile(null);
        setPreviewRows([]);
        if (inputRef.current) inputRef.current.value = '';
      } else {
        showToast({ message: 'Failed to upload data.', type: ToastType.Error });
      }
    } catch (error) {
      showToast({ message: 'An error occurred during upload.', type: ToastType.Error });
      console.error(error);
    }
  };

  // ---------- Bind native drag/drop listeners ----------
  useEffect(() => {
    const dragArea = dragAreaRef.current;
    if (!dragArea) return;

    dragArea.addEventListener('dragenter', handleNativeDrag);
    dragArea.addEventListener('dragleave', handleNativeDrag);
    dragArea.addEventListener('dragover', handleNativeDrag);
    dragArea.addEventListener('drop', handleNativeDrop);

    return () => {
      dragArea.removeEventListener('dragenter', handleNativeDrag);
      dragArea.removeEventListener('dragleave', handleNativeDrag);
      dragArea.removeEventListener('dragover', handleNativeDrag);
      dragArea.removeEventListener('drop', handleNativeDrop);
    };
  }, []);

  // ---------- Render ----------
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Weight Data</h2>

      <div
        ref={dragAreaRef}
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20'
            : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <svg
          className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">CSV files only</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={onButtonClick}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          Select CSV File
        </button>
      </div>

      {selectedFile && (
        <div className="mt-4">
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
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewRows([]);
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
                      <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className={`px-3 py-2 text-xs ${
                            rowIndex === 0
                              ? 'font-medium text-gray-700 dark:text-gray-300'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
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

          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className={`mt-4 w-full px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              loading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500'
            }`}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">CSV Format Requirements:</h3>
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
