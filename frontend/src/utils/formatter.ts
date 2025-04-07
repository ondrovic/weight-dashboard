// frontend/src/utils/formatter.ts

/**
 * Format a number as weight (with 1 decimal place and "lbs" suffix)
 */
export const formatWeight = (weight: number): string => {
    return `${weight.toFixed(1)} lbs`;
  };
  
  /**
   * Format a number as percentage (with 1 decimal place and "%" suffix)
   */
  export const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };
  
  /**
   * Format a date string to MM/DD/YYYY format
   */
  export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr; // Return original if invalid
    }
    
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  };