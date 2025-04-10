// FilterPresetsManager.tsx - Component to manage filter presets

import React, { useState } from 'react';
import { FilterPreset, FilterCondition, FieldType, FilterOperator } from './types/Filter';
import { FilterEditor } from './FilterEditor';
import { generateId } from './utils/Filter';

interface FilterPresetsManagerProps {
  presets: FilterPreset[];
  fieldOptions: { key: string; name: string }[];
  getFieldType: (field: string) => FieldType;
  onLoadPreset: (presetId: string) => void;
  onDeletePreset: (presetId: string) => void;
  onRenamePreset: (presetId: string, newName: string) => void;
  onUpdatePreset: (presetId: string, updatedConditions: FilterCondition[]) => void;
}

export const FilterPresetsManager: React.FC<FilterPresetsManagerProps> = ({
  presets,
  fieldOptions,
  getFieldType,
  onLoadPreset,
  onDeletePreset,
  onRenamePreset,
  onUpdatePreset
}) => {
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [editingPresetConditions, setEditingPresetConditions] = useState<FilterCondition[]>([]);
  const [isEditingPresetConditions, setIsEditingPresetConditions] = useState(false);

  // Start editing a preset name
  const startEditing = (preset: FilterPreset) => {
    setEditingPresetId(preset.id);
    setNewPresetName(preset.name);
  };
  
  // Save the edited preset name
  const savePresetName = () => {
    if (editingPresetId && newPresetName.trim()) {
      onRenamePreset(editingPresetId, newPresetName.trim());
      setEditingPresetId(null);
      setNewPresetName('');
    }
  };
  
  // Start editing preset conditions
  const startEditingPresetConditions = (preset: FilterPreset) => {
    setEditingPresetId(preset.id);
    setEditingPresetConditions([...preset.conditions]);
    setIsEditingPresetConditions(true);
  };

  // Update a filter condition within the preset
  const handleUpdateCondition = (index: number, updates: Partial<FilterCondition>) => {
    const updatedConditions = [...editingPresetConditions];
    updatedConditions[index] = { ...updatedConditions[index], ...updates };
    setEditingPresetConditions(updatedConditions);
  };

  // Remove a condition from the preset
  const handleRemoveCondition = (index: number) => {
    const updatedConditions = editingPresetConditions.filter((_, i) => i !== index);
    setEditingPresetConditions(updatedConditions);
  };

  // Toggle condition active state
  const handleToggleActive = (index: number) => {
    const updatedConditions = [...editingPresetConditions];
    updatedConditions[index] = {
      ...updatedConditions[index],
      active: !updatedConditions[index].active
    };
    setEditingPresetConditions(updatedConditions);
  };

  // Add a new condition to the preset
  const handleAddCondition = () => {
    // Default to first available field
    const defaultField = fieldOptions[0]?.key || '';
    const fieldType = getFieldType(defaultField);
    const defaultOperator = fieldType === 'string' ? 'contains' : fieldType === 'date' ? 'after' : 'greaterThan';
    
    const newCondition: FilterCondition = {
      field: defaultField,
      operator: defaultOperator as FilterOperator,
      value: fieldType === 'number' ? 0 : '',
      active: true,
      id: generateId(),
    };

    setEditingPresetConditions(prev => [...prev, newCondition]);
  };

  // Save edited preset conditions
  const savePresetConditions = () => {
    if (editingPresetId) {
      onUpdatePreset(editingPresetId, editingPresetConditions);
      setEditingPresetId(null);
      setIsEditingPresetConditions(false);
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingPresetId(null);
    setNewPresetName('');
    setIsEditingPresetConditions(false);
  };
  
  // Handle the enter key in the rename input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      savePresetName();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };
  
  if (presets.length === 0) {
    return <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">No saved presets</div>;
  }
  
  return (
    <div className="mt-2">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saved Presets</h4>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {presets.map(preset => (
          <div 
            key={preset.id} 
            className="bg-gray-50 dark:bg-gray-700 p-2 rounded"
          >
            {/* Preset name and actions */}
            {!isEditingPresetConditions && (
              <div className="flex items-center justify-between mb-2">
                {editingPresetId === preset.id ? (
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="flex-1 p-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
                  />
                ) : (
                  <span className="text-sm text-gray-700 dark:text-gray-300 mr-2 flex-1">
                    {preset.name}
                  </span>
                )}
                
                <div className="flex space-x-1">
                  {editingPresetId === preset.id ? (
                    <>
                      <button
                        onClick={savePresetName}
                        className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        title="Save"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        title="Cancel"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onLoadPreset(preset.id)}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="Load preset"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => startEditing(preset)}
                        className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        title="Rename preset"
                      >
                        Edit Name
                      </button>
                      <button
                        onClick={() => startEditingPresetConditions(preset)}
                        className="text-xs px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                        title="Edit filters"
                      >
                        Edit Filters
                      </button>
                      <button
                        onClick={() => onDeletePreset(preset.id)}
                        className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        title="Delete preset"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Editing preset conditions */}
            {isEditingPresetConditions && editingPresetId === preset.id && (
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Editing Filters for "{preset.name}"
                  </h5>
                  <button
                    onClick={handleAddCondition}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Filter
                  </button>
                </div>
                {editingPresetConditions.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                    No filters in this preset
                  </div>
                ) : (
                  editingPresetConditions.map((condition, index) => (
                    <FilterEditor
                      key={condition.id}
                      filter={condition}
                      fieldOptions={fieldOptions}
                      getFieldType={getFieldType}
                      onUpdate={(_, updates) => handleUpdateCondition(index, updates)}
                      onRemove={() => handleRemoveCondition(index)}
                      onToggleActive={() => handleToggleActive(index)}
                    />
                  ))
                )}
                
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={cancelEditing}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePresetConditions}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};