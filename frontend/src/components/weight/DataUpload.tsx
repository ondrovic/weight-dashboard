// frontend/src/components/weight/DataUpload.tsx
import React, { useState, useRef } from 'react';

interface DataUploadProps {
  uploadData: (file: File) => Promise<boolean>;
  loading: boolean;
}

export const DataUpload: React.FC<DataUploadProps> = ({ uploadData, loading }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };
  
  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };
  
  // Handle selected files
  const handleFiles = (file: File) => {
    // Check if the file is a CSV
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadSuccess(false);
      setUploadMessage('Please select a CSV file');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    setUploadSuccess(null);
    setUploadMessage('');
  };
  
  // Trigger file input click
  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadSuccess(false);
      setUploadMessage('Please select a file first');
      return;
    }
    
    try {
      const success = await uploadData(selectedFile);
      
      setUploadSuccess(success);
      setUploadMessage(success ? 'Data uploaded successfully!' : 'Failed to upload data');
      
      if (success) {
        setSelectedFile(null);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    } catch (error) {
      setUploadSuccess(false);
      setUploadMessage('An error occurred during upload');
      console.error(error);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Data</h2>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' 
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <svg
          className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
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
          Select File
        </button>
      </div>
      
      {selectedFile && (
        <div className="mt-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (inputRef.current) {
                  inputRef.current.value = '';
                }
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          
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
      
      {uploadMessage && (
        <div
          className={`mt-4 p-3 rounded-md ${
            uploadSuccess
              ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:bg-opacity-20 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-900 dark:bg-opacity-20 dark:text-red-300'
          }`}
        >
          {uploadMessage}
        </div>
      )}
    </div>
  );
};