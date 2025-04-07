// backend/src/utils/dateFormatter.ts

/**
 * Parse a date string in various formats
 * @param dateString Date string to parse
 * @returns Date object or null if invalid
 */
export function parseDate(dateString: string): Date | null {
    if (!dateString) return null;
    
    // Handle the format in the raw data which includes time
    // Example: "4/5/2025, 8:43 AM"
    const dateTimeParts = dateString.split(',');
    const datePart = dateTimeParts[0].trim();
    
    try {
      const date = new Date(datePart);
      return isValidDate(date) ? date : null;
    } catch (error) {
      console.error(`Error parsing date: ${dateString}`, error);
      return null;
    }
  }
  
  /**
   * Check if a date is valid
   * @param date Date to check
   * @returns Whether the date is valid
   */
  export function isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }
  
  /**
   * Format a date as MM-DD-YY
   * @param date Date to format
   * @returns Formatted date string
   */
  export function formatDateMMDDYY(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(2);
    return `${month}-${day}-${year}`;
  }
  
  /**
   * Format a date as MM/DD/YYYY
   * @param date Date to format
   * @returns Formatted date string
   */
  export function formatDateMMDDYYYY(date: Date): string {
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }