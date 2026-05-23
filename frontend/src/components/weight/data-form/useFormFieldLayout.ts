import { useMemo } from 'react';
import { getFormFieldDefinition } from '@/constants/form-fields';

const REQUIRED_FIELD_KEYS = new Set(['Date', 'Weight']);

export function useFormFieldLayout(
  formFieldOrder: string[],
  showAllFields: boolean,
  expandedByDefault: boolean,
  isEditMode: boolean,
) {
  const visibleFieldKeys = useMemo(() => {
    const showOptional = showAllFields || expandedByDefault || isEditMode;

    return formFieldOrder.filter((key) => {
      if (REQUIRED_FIELD_KEYS.has(key)) {
        return true;
      }
      return showOptional;
    });
  }, [formFieldOrder, showAllFields, expandedByDefault, isEditMode]);

  const visibleFields = useMemo(
    () =>
      visibleFieldKeys
        .map((key) => getFormFieldDefinition(key))
        .filter((field): field is NonNullable<typeof field> => field !== undefined),
    [visibleFieldKeys],
  );

  return { visibleFieldKeys, visibleFields };
}
