import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormFieldDefinition } from '@/constants/form-fields';
import { EditableFieldLabel } from './EditableFieldLabel';

interface SortableFormFieldProps {
  field: FormFieldDefinition;
  label: string;
  value: string | number | undefined;
  customizeMode: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRename: (label: string) => void;
}

export const SortableFormField: React.FC<SortableFormFieldProps> = ({
  field,
  label,
  value,
  customizeMode,
  onInputChange,
  onRename,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.key, disabled: !customizeMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const inputId = field.inputName;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 flex items-start gap-2 ${isDragging ? 'opacity-60 z-10' : ''}`}
    >
      {customizeMode && (
        <button
          type="button"
          className="mt-7 p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:text-gray-600"
          aria-label={`Drag to reorder ${label}`}
          {...attributes}
          {...listeners}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M7 2a2 2 0 11.001 3.999A2 2 0 017 2zm0 6a2 2 0 11.001 3.999A2 2 0 017 8zm0 6a2 2 0 11.001 3.999A2 2 0 017 14zm6-12a2 2 0 11.001 3.999A2 2 0 0113 2zm0 6a2 2 0 11.001 3.999A2 2 0 0113 8zm0 6a2 2 0 11.001 3.999A2 2 0 0113 14z" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <EditableFieldLabel
          htmlFor={inputId}
          label={label}
          required={field.required}
          editable={customizeMode}
          onRename={onRename}
        />
        <input
          type={field.type}
          id={inputId}
          name={field.inputName}
          value={value ?? ''}
          onChange={onInputChange}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
          step={field.step}
          required={field.required}
        />
      </div>
    </div>
  );
};
