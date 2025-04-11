// src/components/common/footer/hooks/useCopyrightYear.ts
import { useState, useEffect } from 'react';

/**
 * Custom hook that returns the current year for copyright notices
 * @returns Current year as a number
 */
export const useCopyrightYear = (): number => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  
  // Update the year if the component stays mounted during a year change
  useEffect(() => {
    const interval = setInterval(() => {
      const currentYear = new Date().getFullYear();
      if (currentYear !== year) {
        setYear(currentYear);
      }
    }, 1000 * 60 * 60); // Check once per hour
    
    return () => clearInterval(interval);
  }, [year]);
  
  return year;
};