import React, { useState, useEffect } from 'react';
import { FilterCondition, FilterOperator, FieldType } from './types/filter.types';
import { getFilterOperators, getOperatorDisplay } from './utils/filter';

interface FilterEditorProps {
  filter: FilterCondition;
  fieldOptions: { key: string; name: string }[];
  getFieldType: (field: string) => FieldType;
  onUpdate: (id: string, updates: Partial<FilterCondition>) => void;
  onRemove: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export const FilterEditor: React.FC<FilterEditorProps> = ({
  filter,
  fieldOptions,
  getFieldType,
  onUpdate,
  onRemove,
  onToggleActive
}) => {
  const fieldType = getFieldType(filter.field);
  const operators = getFilterOperators(fieldType);

  // Add local state to prevent losing focus on every keystroke
  const [localValue, setLocalValue] = useState<string | number | [number, number] | [string, string]>(filter.value);

  // State for date inputs
  const [dateValue, setDateValue] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  // Convert MM-DD-YY to MM/DD/YYYY for date input
  const formatDateForInput = (dateStr: string): string => {
    if (!dateStr || dateStr.trim() === '') return '';

    try {
      // Handle MM-DD-YY format
      if (dateStr.includes('-')) {
        const [month, day, year] = dateStr.split('-');
        if (!month || !day || !year) return '';
        // Pad month and day with leading zeros if needed
        const paddedMonth = month.padStart(2, '0');
        const paddedDay = day.padStart(2, '0');
        // Expand year to 4 digits if it's 2 digits
        const fullYear = year.length === 2 ? `20${year}` : year;
        return `${fullYear}-${paddedMonth}-${paddedDay}`;
      }

      // Handle MM/DD/YYYY format
      if (dateStr.includes('/')) {
        const [month, day, year] = dateStr.split('/');
        if (!month || !day || !year) return '';
        // Pad month and day with leading zeros if needed
        const paddedMonth = month.padStart(2, '0');
        const paddedDay = day.padStart(2, '0');
        return `${year}-${paddedMonth}-${paddedDay}`;
      }

      return '';
    } catch (error) {
      console.error('Error formatting date for input:', error);
      return '';
    }
  };

  // Convert YYYY-MM-DD from date input to MM/DD/YYYY for filter value
  const formatDateFromInput = (dateStr: string): string => {
    if (!dateStr || dateStr.trim() === '') return '';

    try {
      const [year, month, day] = dateStr.split('-');
      if (!year || !month || !day) return '';

      // Format as MM/DD/YYYY - this seems to be what your application expects based on screenshots
      return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
    } catch (error) {
      console.error('Error formatting date from input:', error);
      return '';
    }
  };

  // Initialize date values when filter changes
  useEffect(() => {
    if (fieldType === 'date') {
      if (typeof filter.value === 'string') {
        setDateValue(formatDateForInput(filter.value));
      } else if (Array.isArray(filter.value)) {
        setDateRangeStart(formatDateForInput(filter.value[0] as string));
        setDateRangeEnd(formatDateForInput(filter.value[1] as string));
      }
    }
  }, [filter.field, filter.operator, filter.value, fieldType]);

  // Handle field change
  const handleFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newField = e.target.value;
    const newFieldType = getFieldType(newField);
    const newOperators = getFilterOperators(newFieldType);

    // Reset operator if not compatible with new field type
    const newOperator = newOperators.includes(filter.operator as any)
      ? filter.operator
      : newOperators[0];

    // Reset value when changing field
    const newValue = newFieldType === 'number' ? 0 : '';
    setLocalValue(newValue);

    // Reset date values if changing to/from date
    if (newFieldType === 'date') {
      setDateValue('');
      setDateRangeStart('');
      setDateRangeEnd('');
    }

    onUpdate(filter.id, {
      field: newField,
      operator: newOperator as FilterOperator,
      value: newValue
    });
  };

  // Handle operator change
  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOperator = e.target.value as FilterOperator;

    // Reset value when changing between range and single value operators
    let newValue = localValue;
    if (
      (newOperator === 'between' && !Array.isArray(localValue)) ||
      (newOperator !== 'between' && Array.isArray(localValue))
    ) {
      if (fieldType === 'date') {
        newValue = newOperator === 'between' ? ['', ''] : '';
        setDateValue('');
        setDateRangeStart('');
        setDateRangeEnd('');
      } else {
        newValue = fieldType === 'number' ? 0 : '';
      }
      setLocalValue(newValue);
    }

    onUpdate(filter.id, {
      operator: newOperator,
      value: newValue
    });
  };

  // Handle value change for non-date fields
  const handleValueChange = (newValue: string | number | [number, number] | [string, string]) => {
    setLocalValue(newValue);
  };

  // Handle date value change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const htmlDateStr = e.target.value; // YYYY-MM-DD
    setDateValue(htmlDateStr);

    if (htmlDateStr) {
      const appDateStr = formatDateFromInput(htmlDateStr); // MM/DD/YYYY
      setLocalValue(appDateStr);
    } else {
      setLocalValue('');
    }
  };

  // Handle date range start change
  const handleDateRangeStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const htmlDateStr = e.target.value; // YYYY-MM-DD
    setDateRangeStart(htmlDateStr);

    const appDateStr = htmlDateStr ? formatDateFromInput(htmlDateStr) : ''; // MM/DD/YYYY
    const newValue: [string, string] = Array.isArray(localValue)
      ? [appDateStr, localValue[1] as string]
      : [appDateStr, ''];

    setLocalValue(newValue);
  };

  // Handle date range end change
  const handleDateRangeEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const htmlDateStr = e.target.value; // YYYY-MM-DD
    setDateRangeEnd(htmlDateStr);

    const appDateStr = htmlDateStr ? formatDateFromInput(htmlDateStr) : ''; // MM/DD/YYYY
    const newValue: [string, string] = Array.isArray(localValue)
      ? [localValue[0] as string, appDateStr]
      : ['', appDateStr];

    setLocalValue(newValue);
  };

  // Apply the value change to the filter
  const applyValueChange = () => {
    onUpdate(filter.id, { value: localValue });
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-2 mb-2">
        {/* Field selector */}
        <select
          value={filter.field}
          onChange={handleFieldChange}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
        >
          {fieldOptions.map(option => (
            <option key={option.key} value={option.key}>
              {option.name}
            </option>
          ))}
        </select>

        {/* Operator selector */}
        <select
          value={filter.operator}
          onChange={handleOperatorChange}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
        >
          {operators.map(op => (
            <option key={op} value={op}>
              {getOperatorDisplay(op)}
            </option>
          ))}
        </select>

        {/* Value input(s) */}
        {filter.operator === 'between' ? (
          // Range inputs for 'between' operator
          <div className="flex items-center space-x-2">
            {fieldType === 'date' ? (
              // Date range inputs with HTML date type
              <>
                <input
                  type="date"
                  value={dateRangeStart}
                  onChange={handleDateRangeStartChange}
                  onBlur={applyValueChange}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                />
                <span>and</span>
                <input
                  type="date"
                  value={dateRangeEnd}
                  onChange={handleDateRangeEndChange}
                  onBlur={applyValueChange}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                />
              </>
            ) : (
              // Number range inputs
              <>
                <input
                  type="number"
                  placeholder="Min"
                  value={Array.isArray(localValue) ? localValue[0] : ''}
                  onChange={(e) => {
                    const firstValue = parseFloat(e.target.value) || 0;
                    const secondValue = Array.isArray(localValue) ? localValue[1] : 0;
                    handleValueChange([firstValue, secondValue] as [number, number]);
                  }}
                  onBlur={applyValueChange}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm w-20"
                />
                <span>and</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={Array.isArray(localValue) ? localValue[1] : ''}
                  onChange={(e) => {
                    const firstValue = Array.isArray(localValue) ? localValue[0] : 0;
                    const secondValue = parseFloat(e.target.value) || 0;
                    handleValueChange([firstValue, secondValue] as [number, number]);
                  }}
                  onBlur={applyValueChange}
                  className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm w-20"
                />
              </>
            )}
          </div>
        ) : fieldType === 'date' ? (
          // Single date input with HTML date type
          <input
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            onBlur={applyValueChange}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
          />
        ) : fieldType === 'number' ? (
          // Number input
          <input
            type="number"
            value={localValue as number}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
              handleValueChange(value);
            }}
            onBlur={applyValueChange}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
          />
        ) : (
          // Text input
          <input
            type="text"
            value={localValue as string}
            onChange={(e) => handleValueChange(e.target.value)}
            onBlur={applyValueChange}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
          />
        )}
      </div>

      {/* Filter actions */}
      <div className="flex justify-between mt-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filter.active}
            onChange={() => onToggleActive(filter.id)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
          />
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {filter.active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <button
          onClick={() => onRemove(filter.id)}
          className="text-red-600 dark:text-red-400 text-sm hover:text-red-800 dark:hover:text-red-300"
        >
          Remove
        </button>
      </div>
    </div>
  );
};