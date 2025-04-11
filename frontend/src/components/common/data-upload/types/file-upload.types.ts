export interface FileUploadProps {
    uploadData: (file: File) => Promise<boolean>;
    loading: boolean;
  }
  
  export interface FilePreviewProps {
    file: File;
    previewRows: string[][];
    onRemove: () => void;
  }
  
  export interface FileDropZoneProps {
    onFileSelect: (file: File) => void;
    loading: boolean;
  }
  
  export interface FileValidationResult {
    isValid: boolean;
    error?: string;
  }