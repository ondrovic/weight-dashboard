import { Metric } from '@/components/metric-selector';

/** Canonical metric keys for forms, tables, and settings. */
export const KNOWN_METRIC_KEYS = [
  'Date',
  'Weight',
  'BMI',
  'Body Fat %',
  'V-Fat',
  'S-Fat',
  'Age',
  'HR',
  'Water %',
  'Bone Mass %',
  'Protien %',
  'Fat Free Weight',
  'Bone Mass LB',
  'BMR',
  'Muscle Mass',
] as const;

export type MetricKey = (typeof KNOWN_METRIC_KEYS)[number];

export const DEFAULT_FORM_FIELD_ORDER: string[] = [
  'Date',
  'Weight',
  'BMI',
  'Body Fat %',
  'V-Fat',
  'S-Fat',
  'Age',
  'HR',
  'Water %',
  'Bone Mass %',
  'Protien %',
  'Fat Free Weight',
  'Bone Mass LB',
  'BMR',
  'Muscle Mass',
];

/** Base display names and chart colors (before user label overrides). */
export const BASE_METRIC_DEFINITIONS: Metric[] = [
  { key: 'Date', name: 'Date', unit: '' },
  { key: 'Weight', name: 'Weight (lbs)', color: '#3B82F6', unit: 'lbs' },
  { key: 'BMI', name: 'BMI', color: '#10B981', unit: '' },
  { key: 'Body Fat %', name: 'Body Fat %', color: '#F59E0B', unit: '%' },
  { key: 'V-Fat', name: 'Visceral Fat', color: '#EF4444', unit: '' },
  { key: 'S-Fat', name: 'Subcutaneous Fat', color: '#EC4899', unit: '' },
  { key: 'Age', name: 'Metabolic Age', color: '#FBBF24', unit: 'years' },
  { key: 'HR', name: 'Heart Rate (bpm)', color: '#F472B6', unit: 'bpm' },
  { key: 'Water %', name: 'Water %', color: '#06B6D4', unit: '%' },
  { key: 'Bone Mass %', name: 'Bone Mass %', color: '#D946EF', unit: '%' },
  { key: 'Protien %', name: 'Protein %', color: '#9333EA', unit: '%' },
  { key: 'Fat Free Weight', name: 'Fat Free Weight (lbs)', color: '#A78BFA', unit: 'lbs' },
  { key: 'Bone Mass LB', name: 'Bone Mass (lbs)', color: '#D946EF', unit: 'lbs' },
  { key: 'BMR', name: 'BMR (kcal)', color: '#A855F7', unit: 'kcal' },
  { key: 'Muscle Mass', name: 'Muscle Mass (lbs)', color: '#A855F7', unit: 'lbs' },
];
