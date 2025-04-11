import React, { useState, useEffect } from 'react';
import { FilterCondition, FilterPreset, FieldType, FilterChangeEvent } from './types/filter.types';
import { FilterPanel } from './FilterPanel';
import { FilterTag } from './FilterTag';
import { loadFilterPresets, saveFilterPresets } from './utils/file-storage';
import { generateId } from './utils/filter';
import { useConfirmation } from '@/contexts/Confrimation';

interface FilterManagerProps {
  fieldOptions: { key: string; name: string }[];
  getFieldType: (field: string) => FieldType;
  onFilterChange: (conditions: FilterCondition[]) => void;
}

export const FilterManager: React.FC<FilterManagerProps> = ({
  fieldOptions,
  getFieldType,
  onFilterChange
}) => {
  const { confirm } = useConfirmation();
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>([]);
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [isFilteringActive, setIsFilteringActive] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Get field name from key
  const getFieldName = (key: string): string => {
    const field = fieldOptions.find(f => f.key === key);
    return field ? field.name : key;
  };

  // Load filter presets from localStorage
  useEffect(() => {
    setFilterPresets(loadFilterPresets());
  }, []);

  // Update isFilteringActive when filter conditions change
  useEffect(() => {
    const anyActive = filterConditions.some(filter => filter.active);
    setIsFilteringActive(anyActive);

    // Notify parent of filter changes
    onFilterChange(filterConditions);
  }, [filterConditions, onFilterChange]);

  // Handle filter changes
  const handleFilterChange = (event: FilterChangeEvent) => {
    switch (event.type) {
      case 'add':
        if (event.condition) {
          setFilterConditions(prev => [...prev, event.condition!]);
        }
        break;

      case 'update':
        if (event.condition) {
          setFilterConditions(prev =>
            prev.map(filter =>
              filter.id === event.condition!.id ? { ...event.condition! } : filter
            )
          );
        }
        break;

      case 'remove':
        if (event.condition) {
          setFilterConditions(prev =>
            prev.filter(filter => filter.id !== event.condition!.id)
          );
        }
        break;

      case 'toggleActive':
        if (event.condition) {
          setFilterConditions(prev =>
            prev.map(filter =>
              filter.id === event.condition!.id ? { ...filter, active: !filter.active } : filter
            )
          );
        }
        break;

      case 'clear':
        setFilterConditions([]);
        break;

      case 'applyPreset':
        if (event.presetId) {
          const preset = filterPresets.find(p => p.id === event.presetId);
          if (preset) {
            setFilterConditions([...preset.conditions]);
          }
        } else if (event.conditions) {
          setFilterConditions([...event.conditions]);
        }
        break;
    }
  };

  // Save current filters as a preset
  const handleSavePreset = (name: string) => {
    if (!name.trim() || filterConditions.length === 0) return;

    const newPreset: FilterPreset = {
      id: generateId(),
      name: name.trim(),
      conditions: [...filterConditions]
    };

    const updatedPresets = [...filterPresets, newPreset];
    setFilterPresets(updatedPresets);

    // Save to localStorage
    saveFilterPresets(updatedPresets);
  };

  // Rename a preset
  const handleRenamePreset = (presetId: string, newName: string) => {
    if (!newName.trim()) return;

    const updatedPresets = filterPresets.map(preset =>
      preset.id === presetId
        ? { ...preset, name: newName.trim() }
        : preset
    );

    setFilterPresets(updatedPresets);

    // Update localStorage
    saveFilterPresets(updatedPresets);
  };

  // Update preset conditions
  const handleUpdatePreset = (presetId: string, updatedConditions: FilterCondition[]) => {
    const updatedPresets = filterPresets.map(preset =>
      preset.id === presetId
        ? { ...preset, conditions: updatedConditions }
        : preset
    );

    setFilterPresets(updatedPresets);

    // Update localStorage
    saveFilterPresets(updatedPresets);
  };

  // Delete a preset
  const handleDeletePreset = async (presetId: string) => {
    const preset = filterPresets.find(p => p.id === presetId);
    if (!preset) return;

    const confirmed = await confirm({
      title: 'Delete Filter Preset',
      message: `Are you sure you want to delete the preset "${preset.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'warning'
    });

    if (confirmed) {
      const updatedPresets = filterPresets.filter(p => p.id !== presetId);
      setFilterPresets(updatedPresets);

      // Update localStorage
      saveFilterPresets(updatedPresets);
    }
  };

  return (
    <div>
      {/* Filter button and active filter tags */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className="filter-button px-3 py-1 text-sm rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
          title="Filter data"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 6h10a1 1 0 010 2H6a1 1 0 010-2zm4 6h4a1 1 0 010 2h-4a1 1 0 010-2z" />
          </svg>
          Filter
          {isFilteringActive && (
            <span className="ml-1 w-2 h-2 rounded-full bg-blue-600"></span>
          )}
        </button>

        {/* Active filters display */}
        {filterConditions.length > 0 && (
          <div className="ml-4 flex flex-wrap gap-2">
            {filterConditions.map(filter => (
              <FilterTag
                key={filter.id}
                filter={filter}
                fieldName={getFieldName(filter.field)}
                onToggleActive={(id) => handleFilterChange({ type: 'toggleActive', condition: { id } as FilterCondition })}
                onRemove={(id) => handleFilterChange({ type: 'remove', condition: { id } as FilterCondition })}
              />
            ))}

            {filterConditions.length > 0 && (
              <button
                onClick={() => handleFilterChange({ type: 'clear' })}
                className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter panel */}
      {showFilterMenu && (
        <FilterPanel
          conditions={filterConditions}
          fieldOptions={fieldOptions}
          presets={filterPresets}
          getFieldType={getFieldType}
          onFilterChange={handleFilterChange}
          onSavePreset={handleSavePreset}
          onRenamePreset={handleRenamePreset}
          onDeletePreset={handleDeletePreset}
          onUpdatePreset={handleUpdatePreset}
        />
      )}
    </div>
  );
};