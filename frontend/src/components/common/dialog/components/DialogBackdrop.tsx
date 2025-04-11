// src/components/dialog/components/DialogBackdrop.tsx
import React from 'react';

export const DialogBackdrop: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur transition-opacity"
      aria-hidden="true"
    />
  );
};