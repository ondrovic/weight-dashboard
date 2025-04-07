// backend/src/utils/numberUtils.ts

/**
 * Extract number from a string with units
 * @param value String value with possible units (e.g., "306.0lb")
 * @returns Extracted number or 0 if invalid
 */
export function extractNumber(value: string | undefined): number {
    if (!value || value === '--') return 0;
    
    // Remove any non-numeric characters except decimal points
    // This will handle formats like "306.0lb", "31.5%", "2500kcal"
    const numericString = value.replace(/[^0-9.]/g, '');
    
    try {
      const result = parseFloat(numericString);
      return isNaN(result) ? 0 : result;
    } catch (error) {
      return 0;
    }
  }
  
  /**
   * Format a number to a fixed number of decimal places
   * @param value Number to format
   * @param decimals Number of decimal places (default: 2)
   * @returns Formatted number as string
   */
  export function formatNumber(value: number, decimals: number = 2): string {
    return value.toFixed(decimals);
  }
  
  /**
   * Calculate percentage
   * @param part Part value
   * @param whole Whole value
   * @returns Percentage as number
   */
  export function calculatePercentage(part: number, whole: number): number {
    if (whole === 0) return 0;
    return (part / whole) * 100;
  }