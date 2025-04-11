import React, { useRef, useState, DragEvent } from 'react';
import { FileDropZoneProps } from '../types/file-upload.types';
import { UploadIcon } from '@/components/common/Icons';

export const FileDropZone: React.FC<FileDropZoneProps> = ({ 
  onFileSelect, 
  loading 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
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
      <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
      
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
        disabled={loading}
      />
      
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className={`mt-4 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
          loading
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500'
        }`}
      >
        Select CSV File
      </button>
    </div>
  );
};