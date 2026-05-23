import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { FormFieldDefinition } from '@/constants/form-fields';
import { SortableFormField } from './SortableFormField';

interface FormFieldListProps {
  fields: FormFieldDefinition[];
  fieldKeys: string[];
  formData: Record<string, string | number | undefined>;
  customizeMode: boolean;
  getDisplayName: (key: string) => string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRenameLabel: (key: string, label: string) => void;
  onReorder: (orderedKeys: string[]) => void;
  middleContent?: React.ReactNode;
  splitAfterIndex?: number;
}

export const FormFieldList: React.FC<FormFieldListProps> = ({
  fields,
  fieldKeys,
  formData,
  customizeMode,
  getDisplayName,
  onInputChange,
  onRenameLabel,
  onReorder,
  middleContent,
  splitAfterIndex,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fieldKeys.indexOf(String(active.id));
    const newIndex = fieldKeys.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedVisible = [...fieldKeys];
    const [moved] = reorderedVisible.splice(oldIndex, 1);
    reorderedVisible.splice(newIndex, 0, moved);

    onReorder(reorderedVisible);
  };

  const getFieldValue = (field: FormFieldDefinition): string | number | undefined => {
    if (field.key === 'Date') {
      return formData.dateInputValue as string | undefined;
    }
    return formData[field.inputName] as string | number | undefined;
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fieldKeys} strategy={rectSortingStrategy} disabled={!customizeMode}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {fields.map((field, index) => (
            <React.Fragment key={field.key}>
              <SortableFormField
                field={field}
                label={getDisplayName(field.key)}
                value={getFieldValue(field)}
                customizeMode={customizeMode}
                onInputChange={onInputChange}
                onRename={(label) => onRenameLabel(field.key, label)}
              />
              {middleContent &&
                splitAfterIndex !== undefined &&
                index === splitAfterIndex - 1 && (
                  <div className="col-span-full">{middleContent}</div>
                )}
            </React.Fragment>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
