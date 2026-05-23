import { DEFAULT_FORM_FIELD_ORDER, KNOWN_METRIC_KEYS } from '../constants/defaults.constants';

const knownKeySet = new Set<string>(KNOWN_METRIC_KEYS);

/**
 * Normalize form field order: known keys only, no duplicates, append any missing keys.
 */
export function normalizeFormFieldOrder(order: string[] | undefined | null): string[] {
  if (!Array.isArray(order) || order.length === 0) {
    return [...DEFAULT_FORM_FIELD_ORDER];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const key of order) {
    if (typeof key !== 'string' || !knownKeySet.has(key) || seen.has(key)) {
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

/**
 * Sanitize metric label overrides: known keys only, trimmed non-empty strings, max length 50.
 */
export function sanitizeMetricLabels(
  labels: Record<string, string> | undefined | null,
): Record<string, string> {
  if (!labels || typeof labels !== 'object') {
    return {};
  }

  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(labels)) {
    if (!knownKeySet.has(key) || typeof value !== 'string') {
      continue;
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      continue;
    }
    result[key] = trimmed.slice(0, 50);
  }

  return result;
}
