import React, { useState, useEffect } from 'react';
import { WeightEntry } from '@/types/weight-data.types';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

interface FormWeightEntry extends Partial<WeightEntry> {
  dateInputValue?: string;
  [key: string]: any;
}

interface WeightDataFormProps {
  onSubmit: (data: Partial<WeightEntry>, id?: string) => Promise<boolean>;
  onCancel?: () => void;
  initialData?: WeightEntry | null;
  recordId?: string | null;
  loading: boolean;
  expandedByDefault?: boolean;
  isEditMode?: boolean;
}

export const WeightDataForm: React.FC<WeightDataFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  recordId,
  loading,
  expandedByDefault = false,
  isEditMode = false
}) => {
  const { showToast } = useToast();

  const { formattedDate, dateInputValue } = getCurrentDateFormats();
  const [formData, setFormData] = useState<FormWeightEntry>({
    Date: formattedDate,
    dateInputValue: dateInputValue,
    Weight: undefined,
    BMI: undefined,
    "Body Fat %": undefined,
    "V-Fat": undefined,
    "S-Fat": undefined,
    Age: undefined,
    HR: undefined,
    "Water %": undefined,
    "Bone Mass %": undefined,
    "Protien %": undefined,
    "Fat Free Weight": undefined,
    "Bone Mass LB": undefined,
    BMR: undefined,
    "Muscle Mass": undefined
  });

  const [showAllFields, setShowAllFields] = useState<boolean>(expandedByDefault || isEditMode);

  useEffect(() => {
    if (initialData && isEditMode) {
      const formattedData: FormWeightEntry = { ...initialData };

      if (formattedData.Date) {
        const dateParts = formattedData.Date.split(/[-\/]/);
        if (dateParts.length === 3) {
          const month = dateParts[0].padStart(2, '0');
          const day = dateParts[1].padStart(2, '0');
          const year = formattedData.Date.split('-')[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
          formattedData.dateInputValue = `${year}-${month}-${day}`;
        }
      }

      setFormData(formattedData);
      setShowAllFields(true);
    }
  }, [initialData, isEditMode]);

  function getCurrentDateFormats() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(2);
    const fullYear = String(now.getFullYear());
    return {
      formattedDate: `${month}-${day}-${year}`,
      dateInputValue: `${fullYear}-${month}-${day}`
    };
  }

  function isValidDateFormat(dateStr: string): boolean {
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const [month, day, year] = dateStr.split('-').map(num => parseInt(num, 10));
    const fullYear = 2000 + year;
    const date = new Date(fullYear, month - 1, day);
    return (
      date.getFullYear() === fullYear &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'dateInputValue') {
      if (value) {
        const [year, month, day] = value.split('-');
        setFormData({
          ...formData,
          dateInputValue: value,
          Date: `${month}-${day}-${year.slice(2)}`
        });
      } else {
        setFormData({ ...formData, dateInputValue: value, Date: '' });
      }
    } else if (name !== 'Date') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : parseFloat(value)
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.Date) {
      showToast({ message: 'Date is required.', type: ToastType.Error });
      return;
    }

    if (!isValidDateFormat(formData.Date)) {
      showToast({ message: 'Invalid date format. Use MM-DD-YY.', type: ToastType.Error });
      return;
    }

    if (!formData.Weight) {
      showToast({ message: 'Weight is required.', type: ToastType.Error });
      return;
    }

    try {
      const submissionData: Partial<WeightEntry> = { ...formData };
      delete (submissionData as FormWeightEntry).dateInputValue;

      const success = isEditMode && recordId
        ? await onSubmit(submissionData, recordId)
        : await onSubmit(submissionData);

      if (success) {
        showToast({
          message: isEditMode ? 'Record updated successfully!' : 'Weight entry saved successfully!',
          type: ToastType.Success
        });

        if (!isEditMode) {
          const { formattedDate, dateInputValue } = getCurrentDateFormats();
          setFormData({
            Date: formattedDate,
            dateInputValue,
            Weight: undefined,
            BMI: undefined,
            "Body Fat %": undefined,
            "V-Fat": undefined,
            "S-Fat": undefined,
            Age: undefined,
            HR: undefined,
            "Water %": undefined,
            "Bone Mass %": undefined,
            "Protien %": undefined,
            "Fat Free Weight": undefined,
            "Bone Mass LB": undefined,
            BMR: undefined,
            "Muscle Mass": undefined
          });
        }
      } else {
        showToast({
          message: 'Failed to save entry.',
          type: ToastType.Error
        });
      }
    } catch (error) {
      console.error(error);
      showToast({
        message: `An error occurred while ${isEditMode ? 'updating' : 'saving'} your weight entry.`,
        type: ToastType.Error
      });
    }
  };

  const dateField = { name: 'dateInputValue', label: 'Date', type: 'date' };
  const weightField = { name: 'Weight', label: 'Weight (lbs)', type: 'number', step: '0.1' };

  const optionalFields = [
    { name: 'BMI', label: 'BMI', type: 'number', step: '0.1' },
    { name: 'Body Fat %', label: 'Body Fat %', type: 'number', step: '0.1' },
    { name: 'V-Fat', label: 'Visceral Fat', type: 'number', step: '0.1' },
    { name: 'S-Fat', label: 'Subcutaneous Fat', type: 'number', step: '0.1' },
    { name: 'Age', label: 'Metabolic Age', type: 'number', step: '1' },
    { name: 'HR', label: 'Heart Rate (bpm)', type: 'number', step: '1' },
    { name: 'Water %', label: 'Water %', type: 'number', step: '0.1' },
    { name: 'Bone Mass %', label: 'Bone Mass %', type: 'number', step: '0.1' },
    { name: 'Protien %', label: 'Protein %', type: 'number', step: '0.1' },
    { name: 'Fat Free Weight', label: 'Fat Free Weight (lbs)', type: 'number', step: '0.1' },
    { name: 'Bone Mass LB', label: 'Bone Mass (lbs)', type: 'number', step: '0.1' },
    { name: 'BMR', label: 'BMR (kcal)', type: 'number', step: '1' },
    { name: 'Muscle Mass', label: 'Muscle Mass (lbs)', type: 'number', step: '0.1' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {isEditMode ? 'Edit Weight Record' : 'Add Weight Entry'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="mb-2">
            <label htmlFor={dateField.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {dateField.label} *
            </label>
            <input
              type={dateField.type}
              id={dateField.name}
              name={dateField.name}
              value={formData.dateInputValue || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor={weightField.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {weightField.label} *
            </label>
            <input
              type={weightField.type}
              id={weightField.name}
              name={weightField.name}
              value={formData[weightField.name] || ''}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              step={weightField.step}
              required
            />
          </div>
        </div>

        {!expandedByDefault && !isEditMode && (
          <button
            type="button"
            onClick={() => setShowAllFields(!showAllFields)}
            className="mb-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none"
          >
            {showAllFields ? 'Hide additional fields' : 'Show additional fields'}
          </button>
        )}

        {(showAllFields || expandedByDefault || isEditMode) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {optionalFields.map(field => (
              <div key={field.name} className="mb-2">
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                  step={field.step}
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          {isEditMode && (
            <button
              type="button"
              onClick={onCancel ? onCancel : () => {}}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              loading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500'
            } ${isEditMode ? '' : 'w-full'}`}
          >
            {loading
              ? (isEditMode ? 'Updating...' : 'Saving...')
              : (isEditMode ? 'Update Record' : 'Save Entry')}
          </button>
        </div>
      </form>
    </div>
  );
};
