import { DEFAULT_FORM_FIELD_ORDER, KNOWN_METRIC_KEYS } from '@/constants/metric-definitions';

const knownKeySet = new Set<string>(KNOWN_METRIC_KEYS);

export function normalizeFormFieldOrder(order: string[] | undefined | null): string[] {
  if (!Array.isArray(order) || order.length === 0) {
    return [...DEFAULT_FORM_FIELD_ORDER];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const key of order) {
    if (!knownKeySet.has(key) || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(key);
  }

  for (const key of DEFAULT_FORM_FIELD_ORDER) {
    if (!seen.has(key)) {
      result.push(key);
    }
  }

  return result;
}

export function parseMetricLabels(
  labels: Record<string, string> | undefined | null,
): Record<string, string> {
  if (!labels || typeof labels !== 'object') {
    return {};
  }
  return { ...labels };
}
