// src/contexts/MetricsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { Metric } from '@/components/metric-selector';
import { settingsApi } from '@/services/settings.service';
import {
  DEFAULT_CHART_METRICS,
  DEFAULT_TABLE_METRICS,
  DEFAULT_VISIBLE_METRICS,
} from '@/constants/Mertrics';

const THEME_PREFERENCE_KEY = 'themePreference';

export type ThemePreference = 'system' | 'light' | 'dark';

/** One-time migration from legacy keys; defaults to following the OS. */
function readInitialThemePreference(): ThemePreference {
  const existing = localStorage.getItem(THEME_PREFERENCE_KEY);
  if (existing === 'light' || existing === 'dark' || existing === 'system') {
    localStorage.removeItem('userPrefersDark');
    return existing;
  }

  const legacyDarkMode = localStorage.getItem('darkMode');
  if (legacyDarkMode !== null) {
    const pref: ThemePreference = legacyDarkMode === 'true' ? 'dark' : 'light';
    localStorage.setItem(THEME_PREFERENCE_KEY, pref);
    localStorage.removeItem('darkMode');
    localStorage.removeItem('userPrefersDark');
    return pref;
  }

  localStorage.removeItem('userPrefersDark');
  return 'system';
}

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
  { key: 'Muscle Mass', name: 'Muscle Mass lbs', color: '#A855F7', unit: 'lbs' },
];

interface MetricsContextType {
  availableMetrics: Metric[];
  tableMetrics: string[];
  chartMetrics: string[];
  defaultVisibleMetrics: string[];
  goalWeight: number | null;
  darkMode: boolean;
  setTableMetrics: (metrics: string[]) => void;
  setChartMetrics: (metrics: string[]) => void;
  setDefaultVisibleMetrics: (metrics: string[]) => void;
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

function applyDarkModeClass(isDarkMode: boolean) {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const MetricsProvider: React.FC<MetricsProviderProps> = ({ children }) => {
  const [tableMetrics, setTableMetricsState] = useState<string[]>(DEFAULT_TABLE_METRICS);
  const [chartMetrics, setChartMetricsState] = useState<string[]>(DEFAULT_CHART_METRICS);
  const [defaultVisibleMetrics, setDefaultVisibleMetricsState] = useState<string[]>(
    DEFAULT_VISIBLE_METRICS,
  );
  const [goalWeight, setGoalWeightState] = useState<number | null>(null);
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(
    readInitialThemePreference,
  );
  const [systemMatches, setSystemMatches] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const darkMode = useMemo(
    () =>
      themePreference === 'system'
        ? systemMatches
        : themePreference === 'dark',
    [themePreference, systemMatches],
  );

  useEffect(() => {
    applyDarkModeClass(darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(THEME_PREFERENCE_KEY, themePreference);
  }, [themePreference]);

  useEffect(() => {
    if (themePreference !== 'system') {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemMatches(e.matches);
    };
    setSystemMatches(mediaQuery.matches);
    // Safari (and some embedded browsers) still require addListener/removeListener.
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // eslint-disable-next-line deprecation/deprecation
      mediaQuery.addListener(handleChange);
    }
    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // eslint-disable-next-line deprecation/deprecation
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [themePreference]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const settings = await settingsApi.getSettings();

        if (settings.tableMetrics && settings.tableMetrics.length > 0) {
          setTableMetricsState(settings.tableMetrics);
        }

        if (settings.chartMetrics && settings.chartMetrics.length > 0) {
          setChartMetricsState(settings.chartMetrics);
        }

        if (settings.defaultVisibleMetrics && settings.defaultVisibleMetrics.length > 0) {
          setDefaultVisibleMetricsState(settings.defaultVisibleMetrics);
        }

        setGoalWeightState(settings.goalWeight);

        setError(null);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings from the server. Using default values.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const setTableMetrics = async (metrics: string[]) => {
    try {
      const updatedMetrics =
        metrics.includes('Date') || metrics.length === 0 ? metrics : ['Date', ...metrics];

      setTableMetricsState(updatedMetrics);

      await settingsApi.updateTableMetrics(updatedMetrics);
    } catch (err) {
      console.error('Failed to update table metrics:', err);
      setError('Failed to save table metrics to the server.');
    }
  };

  const setChartMetrics = async (metrics: string[]) => {
    try {
      setChartMetricsState(metrics);

      await settingsApi.updateChartMetrics(metrics);
    } catch (err) {
      console.error('Failed to update chart metrics:', err);
      setError('Failed to save chart metrics to the server.');
    }
  };

  const setDefaultVisibleMetrics = async (metrics: string[]) => {
    try {
      setDefaultVisibleMetricsState(metrics);

      await settingsApi.updateDefaultVisibleMetrics(metrics);
    } catch (err) {
      console.error('Failed to update default visible metrics:', err);
      setError('Failed to save default visible metrics to the server.');
    }
  };

  const setGoalWeight = async (weight: number | null) => {
    try {
      setGoalWeightState(weight);

      await settingsApi.updateGoalWeight(weight);
    } catch (err) {
      console.error('Failed to update goal weight:', err);
      setError('Failed to save goal weight to the server.');
    }
  };

  const persistDarkModeToServer = async (enabled: boolean) => {
    try {
      await settingsApi.updateDarkMode(enabled);
    } catch (err) {
      console.error('Failed to update dark mode setting:', err);
      setError('Failed to save dark mode setting to the server.');
    }
  };

  const setDarkMode = async (enabled: boolean) => {
    setThemePreferenceState(enabled ? 'dark' : 'light');
    await persistDarkModeToServer(enabled);
  };

  const toggleDarkMode = () => {
    // Cycle system -> dark -> light -> system, so users can return to OS-following mode.
    let nextPref: ThemePreference;
    if (themePreference === 'system') {
      nextPref = systemMatches ? 'light' : 'dark';
    } else if (themePreference === 'dark') {
      nextPref = 'light';
    } else {
      nextPref = 'system';
    }

    setThemePreferenceState(nextPref);
    if (nextPref !== 'system') {
      void persistDarkModeToServer(nextPref === 'dark');
    }
  };

  const resetToDefaults = async () => {
    try {
      setLoading(true);

      const settings = await settingsApi.resetSettings();

      setTableMetricsState(settings.tableMetrics);
      setChartMetricsState(settings.chartMetrics);
      setDefaultVisibleMetricsState(settings.defaultVisibleMetrics || DEFAULT_VISIBLE_METRICS);
      setGoalWeightState(settings.goalWeight);

      setError(null);
    } catch (err) {
      console.error('Failed to reset settings:', err);
      setError('Failed to reset settings on the server.');
    } finally {
      setLoading(false);
    }
  };

  const getMetricByKey = (key: string): Metric | undefined => {
    return availableMetrics.find((metric) => metric.key === key);
  };

  return (
    <MetricsContext.Provider
      value={{
        availableMetrics,
        tableMetrics,
        chartMetrics,
        defaultVisibleMetrics,
        goalWeight,
        darkMode,
        setTableMetrics,
        setChartMetrics,
        setDefaultVisibleMetrics,
        setGoalWeight,
        setDarkMode,
        toggleDarkMode,
        getMetricByKey,
        resetToDefaults,
        loading,
        error,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
};

export const useMetrics = (): MetricsContextType => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};
