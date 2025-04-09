// frontend/src/types/weightData.ts
// Single weight record entry from the weight data file
export interface WeightEntry {
  id?: string;  // Add optional id field
  Date: string;
  Weight: number;
  BMI: number;
  "Body Fat %": number;
  "V-Fat": number;
  "S-Fat": number;
  Age: number;
  HR: number;
  "Water %": number;
  "Bone Mass %": number;
  "Protien %": number;
  "Fat Free Weight": number;
  "Bone Mass LB": number;
  BMR: number;
  "Muscle Mass": number;
}

// Statistics for a single metric (min, max, avg)
export interface MetricStats {
  min: number;
  max: number;
  avg: number;
}

// Root stats object returned from the API
export interface WeightStats {
  count: number;
  latest: WeightEntry;
  oldest: WeightEntry;
  stats: {
    Weight: MetricStats;
    BMI: MetricStats;
    "Body Fat %": MetricStats;
    "V-Fat": MetricStats;
    "S-Fat": MetricStats;
    Age: MetricStats;
    HR: MetricStats;
    "Water %": MetricStats;
    "Bone Mass %": MetricStats;
    "Protien %": MetricStats;
    "Fat Free Weight": MetricStats;
    "Bone Mass LB": MetricStats;
    BMR: MetricStats;
    "Muscle Mass": MetricStats;
  };
}

// Function to create empty stats for initialization or error states
export const createEmptyWeightStats = (): WeightStats => ({
  count: 0,
  latest: {
    Date: "",
    Weight: 0,
    BMI: 0,
    "Body Fat %": 0,
    "V-Fat": 0,
    "S-Fat": 0,
    Age: 0,
    HR: 0,
    "Water %": 0,
    "Bone Mass %": 0,
    "Protien %": 0,
    "Fat Free Weight": 0,
    "Bone Mass LB": 0,
    BMR: 0,
    "Muscle Mass": 0
  },
  oldest: {
    Date: "",
    Weight: 0,
    BMI: 0,
    "Body Fat %": 0,
    "V-Fat": 0,
    "S-Fat": 0,
    Age: 0,
    HR: 0,
    "Water %": 0,
    "Bone Mass %": 0,
    "Protien %": 0,
    "Fat Free Weight": 0,
    "Bone Mass LB": 0,
    BMR: 0,
    "Muscle Mass": 0
  },
  stats: {
    Weight: { min: 0, max: 0, avg: 0 },
    BMI: { min: 0, max: 0, avg: 0 },
    "Body Fat %": { min: 0, max: 0, avg: 0 },
    "V-Fat": { min: 0, max: 0, avg: 0 },
    "S-Fat": { min: 0, max: 0, avg: 0 },
    Age: { min: 0, max: 0, avg: 0 },
    HR: { min: 0, max: 0, avg: 0 },
    "Water %": { min: 0, max: 0, avg: 0 },
    "Bone Mass %": { min: 0, max: 0, avg: 0 },
    "Protien %": { min: 0, max: 0, avg: 0 },
    "Fat Free Weight": { min: 0, max: 0, avg: 0 },
    "Bone Mass LB": { min: 0, max: 0, avg: 0 },
    BMR: { min: 0, max: 0, avg: 0 },
    "Muscle Mass": { min: 0, max: 0, avg: 0 }
  }
});

// Helper functions to process weight data
export const processWeightData = (data: WeightEntry[]): WeightStats => {
  if (!data || data.length === 0) {
    return createEmptyWeightStats();
  }

  // Sort data by date (newest first)
  const sortedData = [...data].sort((a, b) => {
    return new Date(parseDate(b.Date)).getTime() - new Date(parseDate(a.Date)).getTime();
  });

  // Get latest and oldest entries
  const latest = sortedData[0];
  const oldest = sortedData[sortedData.length - 1];

  // Calculate statistics for each metric
  const stats = Object.keys(latest).reduce((acc, key) => {
    if (key !== 'Date' && typeof latest[key as keyof WeightEntry] === 'number') {
      const values = sortedData.map(entry => entry[key as keyof WeightEntry] as number);
      acc[key as keyof typeof acc] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((sum, val) => sum + val, 0) / values.length
      };
    }
    return acc;
  }, {} as WeightStats['stats']);

  return {
    count: sortedData.length,
    latest,
    oldest,
    stats
  };
};

// Helper to parse date strings in format MM-DD-YY
const parseDate = (dateStr: string): string => {
  const [month, day, year] = dateStr.split('-');
  // Convert to YYYY-MM-DD format for proper Date parsing
  return `20${year}-${month}-${day}`;
};