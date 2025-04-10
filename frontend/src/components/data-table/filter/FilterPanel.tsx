import React, { useState } from 'react';
import { FilterCondition, FilterPreset, FieldType, FilterChangeEvent, FilterOperator } from './types/Filter';
import { FilterEditor } from './FilterEditor';
import { SaveFilterModal } from './SaveFilterModal';
import { FilterPresetsManager } from './FilterPresetsManager';
import { generateId } from './utils/Filter';

interface FilterPanelProps {
  conditions: FilterCondition[];
  fieldOptions: { key: string; name: string }[];
  presets: FilterPreset[];
  getFieldType: (field: string) => FieldType;
  onFilterChange: (event: FilterChangeEvent) => void;
  onSavePreset: (name: string) => void;
  onRenamePreset: (presetId: string, newName: string) => void;
  onDeletePreset: (presetId: string) => void;
  onUpdatePreset: (presetId: string, updatedConditions: FilterCondition[]) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  conditions,
  fieldOptions,
  presets,
  getFieldType,
  onFilterChange,
  onSavePreset,
  onRenamePreset,
  onDeletePreset,
  onUpdatePreset
}) => {
  // State for save preset modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Handle creating a new filter
  const handleAddFilter = () => {
    // Default to first available field
    const defaultField = fieldOptions[0]?.key || '';
    const fieldType = getFieldType(defaultField);
    const defaultOperator = fieldType === 'string' ? 'contains' : fieldType === 'date' ? 'after' : 'greaterThan';

    const newFilter: FilterCondition = {
      field: defaultField,
      operator: defaultOperator as FilterOperator,
      value: fieldType === 'number' ? 0 : '',
      active: true,
      id: generateId(),
    };

    onFilterChange({
      type: 'add',
      condition: newFilter
    });
  };

  // Handle updating a filter
  const handleUpdateFilter = (id: string, updates: Partial<FilterCondition>) => {
    const condition = conditions.find(c => c.id === id);
    if (condition) {
      onFilterChange({
        type: 'update',
        condition: { ...condition, ...updates }
      });
    }
  };

  // Handle removing a filter
  const handleRemoveFilter = (id: string) => {
    onFilterChange({
      type: 'remove',
      condition: { id } as FilterCondition
    });
  };

  // Handle toggling a filter's active state
  const handleToggleActive = (id: string) => {
    onFilterChange({
      type: 'toggleActive',
      condition: { id } as FilterCondition
    });
  };

  // Handle loading a preset
  const handleLoadPreset = (presetId: string) => {
    onFilterChange({
      type: 'applyPreset',
      presetId
    });
  };

  // Handle clearing all filters
  const handleClearFilters = () => {
    onFilterChange({
      type: 'clear'
    });
  };

  return (
    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>

        <div className="flex space-x-2">
          {/* Presets button */}
          <button
            onClick={() => setShowPresets(!showPresets)}
            className={`p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 ${showPresets
              ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100 border-blue-300 dark:border-blue-700'
              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
          >
            Presets {presets.length > 0 && `(${presets.length})`}
          </button>

          {/* Save current filters as preset - only if we have filters */}
          {conditions.length > 0 && (
            <button
              onClick={() => setSaveModalOpen(true)}
              className="p-2 text-sm rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Save as Preset
            </button>
          )}

          <button
            onClick={handleAddFilter}
            className="p-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Add Filter
          </button>
        </div>
      </div>

      {/* Presets manager section */}
      {showPresets && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <FilterPresetsManager
            presets={presets}
            fieldOptions={fieldOptions}
            getFieldType={getFieldType}
            onLoadPreset={handleLoadPreset}
            onDeletePreset={onDeletePreset}
            onRenamePreset={onRenamePreset}
            onUpdatePreset={onUpdatePreset}
          />
        </div>
      )}

      {conditions.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No filters added. Click "Add Filter" to create a filter.
        </div>
      ) : (
        conditions.map(filter => (
          <FilterEditor
            key={filter.id}
            filter={filter}
            fieldOptions={fieldOptions}
            getFieldType={getFieldType}
            onUpdate={handleUpdateFilter}
            onRemove={handleRemoveFilter}
            onToggleActive={handleToggleActive}
          />
        ))
      )}

      {/* Clear all filters button - only show if we have filters */}
      {conditions.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Save filter preset modal */}
      <SaveFilterModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={(name) => {
          onSavePreset(name);
          setSaveModalOpen(false);
        }}
      />
    </div>
  );
};