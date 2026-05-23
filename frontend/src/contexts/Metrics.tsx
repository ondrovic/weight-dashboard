// src/contexts/MetricsContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { Metric } from '@/components/metric-selector';
import { settingsApi } from '@/services/settings.service';
import {
  DEFAULT_CHART_METRICS,
  DEFAULT_TABLE_METRICS,
  DEFAULT_VISIBLE_METRICS,
} from '@/constants/Mertrics';
import {
  BASE_METRIC_DEFINITIONS,
  DEFAULT_FORM_FIELD_ORDER,
} from '@/constants/metric-definitions';
import {
  normalizeFormFieldOrder,
  parseMetricLabels,
} from '@/utils/form-field-order.util';

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

/** @deprecated Use useMetrics().availableMetrics for display names with overrides applied. */
export const availableMetrics: Metric[] = BASE_METRIC_DEFINITIONS;

interface MetricsContextType {
  availableMetrics: Metric[];
  tableMetrics: string[];
  chartMetrics: string[];
  defaultVisibleMetrics: string[];
  formFieldOrder: string[];
  metricLabels: Record<string, string>;
  goalWeight: number | null;
  darkMode: boolean;
  setTableMetrics: (metrics: string[]) => void;
  setChartMetrics: (metrics: string[]) => void;
  setDefaultVisibleMetrics: (metrics: string[]) => void;
  setFormFieldOrder: (order: string[]) => void;
  renameMetricLabel: (key: string, label: string) => void;
  setGoalWeight: (weight: number | null) => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  getMetricByKey: (key: string) => Metric | undefined;
  getDisplayName: (key: string) => string;
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

function mergeMetricLabels(
  definitions: Metric[],
  labels: Record<string, string>,
): Metric[] {
  return definitions.map((metric) => ({
    ...metric,
    name: labels[metric.key]?.trim() || metric.name,
  }));
}

export const MetricsProvider: React.FC<MetricsProviderProps> = ({ children }) => {
  const [tableMetrics, setTableMetricsState] = useState<string[]>(DEFAULT_TABLE_METRICS);
  const [chartMetrics, setChartMetricsState] = useState<string[]>(DEFAULT_CHART_METRICS);
  const [defaultVisibleMetrics, setDefaultVisibleMetricsState] = useState<string[]>(
    DEFAULT_VISIBLE_METRICS,
  );
  const [formFieldOrder, setFormFieldOrderState] = useState<string[]>(DEFAULT_FORM_FIELD_ORDER);
  const [metricLabels, setMetricLabelsState] = useState<Record<string, string>>({});
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

  const formFieldOrderDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metricLabelsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const availableMetrics = useMemo(
    () => mergeMetricLabels(BASE_METRIC_DEFINITIONS, metricLabels),
    [metricLabels],
  );

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
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [themePreference]);

  useEffect(() => {
    return () => {
      if (formFieldOrderDebounceRef.current) {
        clearTimeout(formFieldOrderDebounceRef.current);
      }
      if (metricLabelsDebounceRef.current) {
        clearTimeout(metricLabelsDebounceRef.current);
      }
    };
  }, []);

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

        if (settings.formFieldOrder && settings.formFieldOrder.length > 0) {
          setFormFieldOrderState(normalizeFormFieldOrder(settings.formFieldOrder));
        }

        setMetricLabelsState(parseMetricLabels(settings.metricLabels));
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

  const persistFormFieldOrder = useCallback(async (order: string[]) => {
    try {
      await settingsApi.updateFormFieldOrder(order);
    } catch (err) {
      console.error('Failed to update form field order:', err);
      setError('Failed to save form field order to the server.');
    }
  }, []);

  const setFormFieldOrder = useCallback(
    (order: string[]) => {
      const normalized = normalizeFormFieldOrder(order);
      setFormFieldOrderState(normalized);

      if (formFieldOrderDebounceRef.current) {
        clearTimeout(formFieldOrderDebounceRef.current);
      }
      formFieldOrderDebounceRef.current = setTimeout(() => {
        void persistFormFieldOrder(normalized);
      }, 400);
    },
    [persistFormFieldOrder],
  );

  const persistMetricLabels = useCallback(async (labels: Record<string, string>) => {
    try {
      await settingsApi.updateMetricLabels(labels);
    } catch (err) {
      console.error('Failed to update metric labels:', err);
      setError('Failed to save metric labels to the server.');
    }
  }, []);

  const renameMetricLabel = useCallback(
    (key: string, label: string) => {
      const trimmed = label.trim().slice(0, 50);
      setMetricLabelsState((prev) => {
        const next = { ...prev };
        if (trimmed.length === 0) {
          delete next[key];
        } else {
          next[key] = trimmed;
        }

        if (metricLabelsDebounceRef.current) {
          clearTimeout(metricLabelsDebounceRef.current);
        }
        metricLabelsDebounceRef.current = setTimeout(() => {
          void persistMetricLabels(next);
        }, 400);

        return next;
      });
    },
    [persistMetricLabels],
  );

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
      setFormFieldOrderState(normalizeFormFieldOrder(settings.formFieldOrder));
      setMetricLabelsState(parseMetricLabels(settings.metricLabels));
      setGoalWeightState(settings.goalWeight);

      setError(null);
    } catch (err) {
      console.error('Failed to reset settings:', err);
      setError('Failed to reset settings on the server.');
    } finally {
      setLoading(false);
    }
  };

  const getMetricByKey = useCallback(
    (key: string): Metric | undefined => availableMetrics.find((metric) => metric.key === key),
    [availableMetrics],
  );

  const getDisplayName = useCallback(
    (key: string): string => getMetricByKey(key)?.name ?? key,
    [getMetricByKey],
  );

  return (
    <MetricsContext.Provider
      value={{
        availableMetrics,
        tableMetrics,
        chartMetrics,
        defaultVisibleMetrics,
        formFieldOrder,
        metricLabels,
        goalWeight,
        darkMode,
        setTableMetrics,
        setChartMetrics,
        setDefaultVisibleMetrics,
        setFormFieldOrder,
        renameMetricLabel,
        setGoalWeight,
        setDarkMode,
        toggleDarkMode,
        getMetricByKey,
        getDisplayName,
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
