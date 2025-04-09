export interface UserSettings {
  userId: string;
  displayName: string;
  tableMetrics: string[];
  chartMetrics: string[];
  defaultVisibleMetrics: string[];
  goalWeight: number | null;
  darkMode?: boolean;
}
