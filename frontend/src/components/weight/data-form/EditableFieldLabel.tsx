import React, { useEffect, useRef, useState } from 'react';

interface EditableFieldLabelProps {
  htmlFor: string;
  label: string;
  required?: boolean;
  editable: boolean;
  onRename: (label: string) => void;
}

export const EditableFieldLabel: React.FC<EditableFieldLabelProps> = ({
  htmlFor,
  label,
  required = false,
  editable,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraft(label);
    }
  }, [label, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commit = () => {
    setIsEditing(false);
    const trimmed = draft.trim();
    if (trimmed.length > 0 && trimmed !== label) {
      onRename(trimmed);
    } else {
      setDraft(label);
    }
  };

  const cancel = () => {
    setDraft(label);
    setIsEditing(false);
  };

  if (!editable) {
    return (
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && ' *'}
      </label>
    );
  }

  if (isEditing) {
    return (
      <div className="mb-1 flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          maxLength={50}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
          className="flex-1 p-1 text-sm border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-blue-500"
          aria-label={`Rename ${label}`}
        />
        {required && <span className="text-sm text-gray-500 dark:text-gray-400">*</span>}
      </div>
    );
  }

  return (
    <div className="mb-1 flex items-center gap-1 group">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        onDoubleClick={() => setIsEditing(true)}
        title="Double-click to rename"
      >
        {label}
        {required && ' *'}
      </label>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:opacity-100 focus:outline-none"
        aria-label={`Rename ${label}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.501a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
        </svg>
      </button>
    </div>
  );
};
