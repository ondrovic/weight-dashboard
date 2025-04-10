// FilterUtils with extensive debugging for between operator

import { FilterCondition, FilterOperator, FieldType } from '../types/Filter';

/**
 * Helper function to get filter operators based on field type
 */
export const getFilterOperators = (fieldType: FieldType): FilterOperator[] => {
  switch (fieldType) {
    case 'string':
      return ['contains', 'equals', 'startsWith', 'endsWith'];
    case 'number':
      return ['equals', 'greaterThan', 'lessThan', 'between'];
    case 'date':
      return ['equals', 'before', 'after', 'between'];
    default:
      return ['equals'];
  }
};

/**
 * Helper to create a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

/**
 * Get operator display name
 */
export const getOperatorDisplay = (operator: FilterOperator): string => {
  switch (operator) {
    case 'contains': return 'contains';
    case 'equals': return 'equals';
    case 'startsWith': return 'starts with';
    case 'endsWith': return 'ends with';
    case 'greaterThan': return 'greater than';
    case 'lessThan': return 'less than';
    case 'between': return 'between';
    case 'before': return 'before';
    case 'after': return 'after';
    default: return operator;
  }
};

/**
 * Format filter value for display
 */
export const formatFilterValue = (value: string | number | [number, number] | [string, string]): string => {
  if (Array.isArray(value)) {
    return `${value[0]} - ${value[1]}`;
  }
  return String(value);
};

/**
 * Debug utility to inspect the formats and values in the filter
 */
const debugDate = (label: string, dateStr: string): void => {
  console.log(`DEBUG - ${label}: "${dateStr}"`);
  console.log(`  Format: ${dateStr.includes('-') ? 'MM-DD-YY' : dateStr.includes('/') ? 'MM/DD/YYYY' : 'unknown'}`);

  try {
    if (dateStr.includes('-')) {
      const [month, day, year] = dateStr.split('-');
      console.log(`  Parts: month=${month}, day=${day}, year=${year}`);
    } else if (dateStr.includes('/')) {
      const [month, day, year] = dateStr.split('/');
      console.log(`  Parts: month=${month}, day=${day}, year=${year}`);
    }
  } catch (error) {
    console.error(`  Parse error: ${error}`);
  }
};

/**
 * Function to implement the 'equals' operator for dates
 */
export const dateEquals = (entryDateStr: string, filterDateStr: string): boolean => {
  // Debug info
  console.log('DEBUG - dateEquals called');
  debugDate('Entry date', entryDateStr);
  debugDate('Filter date', filterDateStr);

  // Process MM-DD-YY format from data
  let entryYear, entryMonth, entryDay;
  if (entryDateStr.includes('-')) {
    const [month, day, year] = entryDateStr.split('-');
    entryMonth = parseInt(month, 10);
    entryDay = parseInt(day, 10);
    entryYear = year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);
  } else {
    console.log('  Entry date format not recognized');
    return false;
  }

  // Process MM/DD/YYYY format from filter
  let filterYear, filterMonth, filterDay;
  if (filterDateStr.includes('/')) {
    const [month, day, year] = filterDateStr.split('/');
    filterMonth = parseInt(month, 10);
    filterDay = parseInt(day, 10);
    filterYear = parseInt(year, 10);
  } else {
    console.log('  Filter date format not recognized');
    return false;
  }

  const result = entryYear === filterYear && entryMonth === filterMonth && entryDay === filterDay;
  console.log(`  dateEquals result: ${result}`);
  return result;
};

/**
 * SIMPLE direct implementation of between for dates
 * This uses direct string processing without Date objects
 */
export const dateBetween = (entryDateStr: string, startDateStr: string, endDateStr: string): boolean => {
  console.log('\n---------------------------------------------');
  console.log('DEBUG - dateBetween called');
  debugDate('Entry date', entryDateStr);
  debugDate('Start date', startDateStr);
  debugDate('End date', endDateStr);

  // Process entry date (MM-DD-YY format)
  let entryYear, entryMonth, entryDay;
  if (entryDateStr.includes('-')) {
    const [month, day, year] = entryDateStr.split('-');
    entryMonth = parseInt(month, 10);
    entryDay = parseInt(day, 10);
    entryYear = year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);
  } else {
    console.log('  Entry date format not recognized');
    return false;
  }

  // Process start date (MM/DD/YYYY format)
  let startYear, startMonth, startDay;
  if (startDateStr.includes('/')) {
    const [month, day, year] = startDateStr.split('/');
    startMonth = parseInt(month, 10);
    startDay = parseInt(day, 10);
    startYear = parseInt(year, 10);
  } else {
    console.log('  Start date format not recognized');
    return false;
  }

  // Process end date (MM/DD/YYYY format)
  let endYear, endMonth, endDay;
  if (endDateStr.includes('/')) {
    const [month, day, year] = endDateStr.split('/');
    endMonth = parseInt(month, 10);
    endDay = parseInt(day, 10);
    endYear = parseInt(year, 10);
  } else {
    console.log('  End date format not recognized');
    return false;
  }

  // Convert dates to numerics for easy comparison (YYYYMMDD)
  const entryValue = entryYear * 10000 + entryMonth * 100 + entryDay;
  const startValue = startYear * 10000 + startMonth * 100 + startDay;
  const endValue = endYear * 10000 + endMonth * 100 + endDay;

  console.log(`  Numeric values for comparison: entry=${entryValue}, start=${startValue}, end=${endValue}`);

  // Check if entry date is between start and end dates (inclusive)
  const result = entryValue >= startValue && entryValue <= endValue;
  console.log(`  dateBetween result: ${result}`);
  console.log('---------------------------------------------\n');

  return result;
};

/**
 * Apply filters to a data set
 */
export const applyFilters = <T extends Record<string, any>>(
  dataToFilter: T[],
  filterConditions: FilterCondition[],
  getFieldType: (field: string) => FieldType
): T[] => {
  console.log(`DEBUG - applyFilters called with ${dataToFilter.length} records and ${filterConditions.length} filters`);

  // Log the filter conditions
  filterConditions.forEach((filter, index) => {
    console.log(`Filter #${index + 1}: ${filter.field} ${filter.operator} ${formatFilterValue(filter.value)} (${filter.active ? 'active' : 'inactive'})`);
  });

  // If no active filters, return the original data
  if (!filterConditions.some(filter => filter.active)) {
    console.log('No active filters found, returning all data');
    return dataToFilter;
  }

  const filteredData = dataToFilter.filter(entry => {
    // Check if the entry passes all active filter conditions
    const result = filterConditions
      .filter(condition => condition.active)
      .every(condition => {
        const { field, operator, value } = condition;
        const entryValue = entry[field];
        const fieldType = getFieldType(field);

        // If entry doesn't have this field or value is undefined, skip this filter
        if (entryValue === undefined) return true;

        // For date between operator, use our specialized function
        if (fieldType === 'date' && operator === 'between' && typeof entryValue === 'string' && Array.isArray(value) && value.length === 2) {
          return dateBetween(entryValue, value[0] as string, value[1] as string);
        }

        // For date equals operator, use our specialized function
        if (fieldType === 'date' && operator === 'equals' && typeof entryValue === 'string' && typeof value === 'string') {
          return dateEquals(entryValue, value);
        }

        // Handle other operators
        switch (operator) {
          // Text operators
          case 'contains':
            return String(entryValue).toLowerCase().includes(String(value).toLowerCase());
          case 'equals':
            if (typeof entryValue === 'string' && typeof value === 'string') {
              return entryValue.toLowerCase() === value.toLowerCase();
            }
            return entryValue === value;
          case 'startsWith':
            return String(entryValue).toLowerCase().startsWith(String(value).toLowerCase());
          case 'endsWith':
            return String(entryValue).toLowerCase().endsWith(String(value).toLowerCase());

          // Number operators
          case 'greaterThan':
            return typeof entryValue === 'number' && entryValue > Number(value);
          case 'lessThan':
            return typeof entryValue === 'number' && entryValue < Number(value);
          case 'between':
            if (typeof entryValue === 'number' && Array.isArray(value) && value.length === 2) {
              const [min, max] = value as [number, number];
              return entryValue >= min && entryValue <= max;
            }
            return false;

          // Date operators
          case 'before':
            if (fieldType === 'date' && typeof entryValue === 'string' && typeof value === 'string') {
              // Simply parse as YYYYMMDD for comparison
              let entryDateVal = 0;
              if (entryValue.includes('-')) {
                const [month, day, year] = entryValue.split('-');
                const fullYear = year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);
                entryDateVal = fullYear * 10000 + parseInt(month, 10) * 100 + parseInt(day, 10);
              }

              let filterDateVal = 0;
              if (value.includes('/')) {
                const [month, day, year] = value.split('/');
                filterDateVal = parseInt(year, 10) * 10000 + parseInt(month, 10) * 100 + parseInt(day, 10);
              }

              return entryDateVal < filterDateVal;
            }
            return false;
          case 'after':
            if (fieldType === 'date' && typeof entryValue === 'string' && typeof value === 'string') {
              // Simply parse as YYYYMMDD for comparison
              let entryDateVal = 0;
              if (entryValue.includes('-')) {
                const [month, day, year] = entryValue.split('-');
                const fullYear = year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);
                entryDateVal = fullYear * 10000 + parseInt(month, 10) * 100 + parseInt(day, 10);
              }

              let filterDateVal = 0;
              if (value.includes('/')) {
                const [month, day, year] = value.split('/');
                filterDateVal = parseInt(year, 10) * 10000 + parseInt(month, 10) * 100 + parseInt(day, 10);
              }

              return entryDateVal > filterDateVal;
            }
            return false;

          default:
            return true;
        }
      });

    return result;
  });

  console.log(`Filtered from ${dataToFilter.length} records to ${filteredData.length} records`);

  return filteredData;
};