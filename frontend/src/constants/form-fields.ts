export interface FormFieldDefinition {
  /** Stable metric key (API / WeightEntry property, except Date uses dateInputValue for input). */
  key: string;
  /** HTML input name attribute. */
  inputName: string;
  type: 'date' | 'number';
  step?: string;
  required: boolean;
}

export const FORM_FIELD_DEFINITIONS: FormFieldDefinition[] = [
  { key: 'Date', inputName: 'dateInputValue', type: 'date', required: true },
  { key: 'Weight', inputName: 'Weight', type: 'number', step: '0.1', required: true },
  { key: 'BMI', inputName: 'BMI', type: 'number', step: '0.1', required: false },
  { key: 'Body Fat %', inputName: 'Body Fat %', type: 'number', step: '0.1', required: false },
  { key: 'V-Fat', inputName: 'V-Fat', type: 'number', step: '0.1', required: false },
  { key: 'S-Fat', inputName: 'S-Fat', type: 'number', step: '0.1', required: false },
  { key: 'Age', inputName: 'Age', type: 'number', step: '1', required: false },
  { key: 'HR', inputName: 'HR', type: 'number', step: '1', required: false },
  { key: 'Water %', inputName: 'Water %', type: 'number', step: '0.1', required: false },
  { key: 'Bone Mass %', inputName: 'Bone Mass %', type: 'number', step: '0.1', required: false },
  { key: 'Protien %', inputName: 'Protien %', type: 'number', step: '0.1', required: false },
  { key: 'Fat Free Weight', inputName: 'Fat Free Weight', type: 'number', step: '0.1', required: false },
  { key: 'Bone Mass LB', inputName: 'Bone Mass LB', type: 'number', step: '0.1', required: false },
  { key: 'BMR', inputName: 'BMR', type: 'number', step: '1', required: false },
  { key: 'Muscle Mass', inputName: 'Muscle Mass', type: 'number', step: '0.1', required: false },
];

const fieldByKey = new Map(FORM_FIELD_DEFINITIONS.map((f) => [f.key, f]));

export function getFormFieldDefinition(key: string): FormFieldDefinition | undefined {
  return fieldByKey.get(key);
}
