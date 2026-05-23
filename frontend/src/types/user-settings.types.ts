export interface UserSettings {
  userId: string;
  displayName: string;
  tableMetrics: string[];
  chartMetrics: string[];
  defaultVisibleMetrics: string[];
  formFieldOrder: string[];
  metricLabels: Record<string, string>;
  goalWeight: number | null;
  darkMode?: boolean;
}
