export const DEFAULT_USER_ID = 'default';
export const DEFAULT_DISPLAY_NAME = 'Default User';

export const DEFAULT_TABLE_METRICS = [
  'Date',
  'Weight',
  'BMI',
  'Body Fat %',
  'V-Fat',
  'S-Fat',
  'Water %',
  'Bone Mass %',
  'Bone Mass LB',
  'Protien %',
  'Muscle Mass',
  'Fat Free Weight',
  'HR'
];

export const DEFAULT_CHART_METRICS = [
  'Weight',
  'BMI',
  'Body Fat %',
  'V-Fat',
  'S-Fat',
  'Water %',
  'HR',
  'Protien %',
  'Fat Free Weight',
  'Muscle Mass',
  'Bone Mass LB',
  'Bone Mass %'
];

export const DEFAULT_VISIBLE_METRICS = [
  'Weight'
];

/** All metric keys that may appear on the weight entry form (stable API keys). */
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

export const DEFAULT_METRIC_LABELS: Record<string, string> = {};

export const DEFAULT_GOAL_WEIGHT = null;
export const DEFAULT_DARK_MODE = false;