// /frontend/src/components/data-table/filter/types/filter-types.ts
// Type definitions for filtering functionality

export type TextFilterOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith';
export type NumberFilterOperator = 'equals' | 'greaterThan' | 'lessThan' | 'between';
export type DateFilterOperator = 'equals' | 'before' | 'after' | 'between';

// Union type for all filter operators
export type FilterOperator = TextFilterOperator | NumberFilterOperator | DateFilterOperator;

// Interface for a single filter condition
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number | [number, number] | [string, string]; // Single value or range for 'between'
  active: boolean;
  id: string; // Unique ID for the filter
}

// Interface for a saved filter preset
export interface FilterPreset {
  id: string;
  name: string;
  conditions: FilterCondition[];
}

// Field type enumeration
export type FieldType = 'string' | 'number' | 'date';

// Event object for filter changes
export interface FilterChangeEvent {
  type: 'add' | 'update' | 'remove' | 'toggleActive' | 'clear' | 'applyPreset';
  condition?: FilterCondition;
  conditions?: FilterCondition[];
  presetId?: string;
}