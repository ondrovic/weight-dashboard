import { useState } from 'react';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';
import { validateCSVFile, readFileContents } from '../utils/file-validation';

export const useFileUpload = (uploadData: (file: File) => Promise<boolean>) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const handleFileSelect = async (file: File) => {
    const validation = validateCSVFile(file);
    
    if (!validation.isValid) {
      showToast({
        message: validation.error || 'Invalid file',
        type: ToastType.Error,
      });
      return;
    }

    try {
      const rows = await readFileContents(file);
      setSelectedFile(file);
      setPreviewRows(rows);
    } catch (error) {
      showToast({
        message: 'Failed to read file contents',
        type: ToastType.Error,
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast({ 
        message: 'Please select a file first.', 
        type: ToastType.Error 
      });
      return;
    }

    setLoading(true);
    try {
      const success = await uploadData(selectedFile);
      
      if (success) {
        showToast({ 
          message: 'Data uploaded successfully!', 
          type: ToastType.Success 
        });
        resetFileState();
      } else {
        showToast({ 
          message: 'Failed to upload data.', 
          type: ToastType.Error 
        });
      }
    } catch (error) {
      showToast({ 
        message: 'An error occurred during upload.', 
        type: ToastType.Error 
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetFileState = () => {
    setSelectedFile(null);
    setPreviewRows([]);
  };

  return {
    selectedFile,
    previewRows,
    loading,
    handleFileSelect,
    handleUpload,
    resetFileState
  };
};