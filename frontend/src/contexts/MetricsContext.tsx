// frontend/src/contexts/MetricsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Metric } from '../components/common/MetricSelector';
import { settingsApi } from '../services/settingsApi';

// Define all available metrics
export const availableMetrics: Metric[] = [
  { key: 'Date', name: 'Date', unit: '' },
  { key: 'Weight', name: 'Weight', color: '#3B82F6', unit: 'lbs' },
  { key: 'BMI', name: 'BMI', color: '#10B981', unit: '' },
  { key: 'Body Fat %', name: 'Body Fat %', color: '#F59E0B', unit: '%' },
  { key: 'V-Fat', name: 'Vis Fat', color: '#EF4444', unit: '' },
  { key: 'S-Fat', name: 'Sub Fat', color: '#EC4899', unit: '' },
  { key: 'Age', name: 'Age', color: '#FBBF24', unit: 'years' },
  { key: 'HR', name: 'Heart Rate', color: '#F472B6', unit: 'bpm' },
  { key: 'Water %', name: 'Water', color: '#06B6D4', unit: '%' },
  { key: 'Bone Mass %', name: 'Bone Mass %', color: '#D946EF', unit: '%' },
  { key: 'Protien %', name: 'Protein %', color: '#9333EA', unit: '%' },
  { key: 'Fat Free Weight', name: 'Fat Free Weight', color: '#A78BFA', unit: 'lbs' },
  { key: 'Bone Mass LB', name: 'Bone Mass lbs', color: '#D946EF', unit: 'lbs' },
  { key: 'BMR', name: 'BMR', color: '#A855F7', unit: 'kcal' },
  { key: 'Muscle Mass', name: 'Muscle Mass lbs', color: '#A855F7', unit: 'lbs' }
];

// Default selected metrics - these will be overridden by database values
const DEFAULT_TABLE_METRICS = [
  'Date', 'Weight', 'BMI', 'Body Fat %', 'V-Fat', 'S-Fat', 'Water %', 'BMR'
];

const DEFAULT_CHART_METRICS = [
  'Weight', 'BMI', 'Body Fat %', 'V-Fat', 'S-Fat', 'Water %', 'BMR'
];

interface MetricsContextType {
  availableMetrics: Metric[];
  tableMetrics: string[];
  chartMetrics: string[];
  goalWeight: number | null;
  darkMode: boolean;
  setTableMetrics: (metrics: string[]) => void;
  setChartMetrics: (metrics: string[]) => void;
  setGoalWeight: (weight: number | null) => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  getMetricByKey: (key: string) => Metric | undefined;
  resetToDefaults: () => void;
  loading: boolean;
  error: string | null;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

interface MetricsProviderProps {
  children: ReactNode;
}

export const MetricsProvider: React.FC<MetricsProviderProps> = ({ children }) => {
  // State for metrics and settings
  const [tableMetrics, setTableMetricsState] = useState<string[]>(DEFAULT_TABLE_METRICS);
  const [chartMetrics, setChartMetricsState] = useState<string[]>(DEFAULT_CHART_METRICS);
  const [goalWeight, setGoalWeightState] = useState<number | null>(null);
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to apply dark mode to the HTML element
  const applyDarkMode = (isDarkMode: boolean) => {
    console.log(`Applying dark mode: ${isDarkMode}`);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Initialize dark mode based on system preference or stored setting
  useEffect(() => {
    const checkDarkMode = () => {
      // Default to system preference if available
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark;
    };
    
    // Set initial state
    const initialDarkMode = checkDarkMode();
    setDarkModeState(initialDarkMode);
    applyDarkMode(initialDarkMode);
    
    // Add listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if we don't have user preference stored
      if (!localStorage.getItem('userPrefersDark')) {
        const newDarkMode = e.matches;
        setDarkModeState(newDarkMode);
        applyDarkMode(newDarkMode);
      }
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  // Effect to apply dark mode whenever it changes
  useEffect(() => {
    applyDarkMode(darkMode);
    localStorage.setItem('userPrefersDark', String(darkMode));
  }, [darkMode]);

  // Load settings from database on initial mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settings = await settingsApi.getSettings();
        
        // Update state with database values
        if (settings.tableMetrics && settings.tableMetrics.length > 0) {
          setTableMetricsState(settings.tableMetrics);
        }
        
        if (settings.chartMetrics && settings.chartMetrics.length > 0) {
          setChartMetricsState(settings.chartMetrics);
        }
        
        setGoalWeightState(settings.goalWeight);
        
        // Check if darkMode setting exists
        if (settings.darkMode !== undefined) {
          setDarkModeState(settings.darkMode);
          applyDarkMode(settings.darkMode);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings from the server. Using default values.');
        // Fall back to defaults if server fails
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Wrapper functions to update the metrics
  const setTableMetrics = async (metrics: string[]) => {
    try {
      // Always keep Date metric selected for the table
      const updatedMetrics = metrics.includes('Date') || metrics.length === 0 
        ? metrics 
        : ['Date', ...metrics];
      
      // Update local state immediately for responsive UI
      setTableMetricsState(updatedMetrics);
      
      // Update database
      await settingsApi.updateTableMetrics(updatedMetrics);
    } catch (err) {
      console.error('Failed to update table metrics:', err);
      setError('Failed to save table metrics to the server.');
    }
  };

  const setChartMetrics = async (metrics: string[]) => {
    try {
      // Update local state immediately for responsive UI
      setChartMetricsState(metrics);
      
      // Update database
      await settingsApi.updateChartMetrics(metrics);
    } catch (err) {
      console.error('Failed to update chart metrics:', err);
      setError('Failed to save chart metrics to the server.');
    }
  };

  const setGoalWeight = async (weight: number | null) => {
    try {
      // Update local state immediately for responsive UI
      setGoalWeightState(weight);
      
      // Update database
      await settingsApi.updateGoalWeight(weight);
    } catch (err) {
      console.error('Failed to update goal weight:', err);
      setError('Failed to save goal weight to the server.');
    }
  };
  
  const setDarkMode = async (enabled: boolean) => {
    try {
      console.log(`Setting dark mode to: ${enabled}`);
      // Update local state immediately for responsive UI
      setDarkModeState(enabled);
      
      // Update database
      await settingsApi.updateDarkMode(enabled);
    } catch (err) {
      console.error('Failed to update dark mode setting:', err);
      setError('Failed to save dark mode setting to the server.');
    }
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Function to reset to default settings
  const resetToDefaults = async () => {
    try {
      setLoading(true);
      
      // Call the reset API
      const settings = await settingsApi.resetSettings();
      
      // Update local state with received default values
      setTableMetricsState(settings.tableMetrics);
      setChartMetricsState(settings.chartMetrics);
      setGoalWeightState(settings.goalWeight);
      // Don't reset dark mode to maintain user preference
      
      setError(null);
    } catch (err) {
      console.error('Failed to reset settings:', err);
      setError('Failed to reset settings on the server.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get a metric by its key
  const getMetricByKey = (key: string): Metric | undefined => {
    return availableMetrics.find(metric => metric.key === key);
  };

  return (
    <MetricsContext.Provider
      value={{
        availableMetrics,
        tableMetrics,
        chartMetrics,
        goalWeight,
        darkMode,
        setTableMetrics,
        setChartMetrics,
        setGoalWeight,
        setDarkMode,
        toggleDarkMode,
        getMetricByKey,
        resetToDefaults,
        loading,
        error
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
};

// Custom hook to use the metrics context
export const useMetrics = (): MetricsContextType => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};
