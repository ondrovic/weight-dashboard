// frontend/src/components/weight/EditWeightForm.tsx
import React, { useState, useEffect } from 'react';
import { WeightEntry } from '../../types/weightData';

interface EditWeightFormProps {
  recordId: string | null;
  initialData: WeightEntry | null;
  onUpdate: (id: string, data: Partial<WeightEntry>) => Promise<boolean>;
  onCancel: () => void;
  loading: boolean;
}

export const EditWeightForm: React.FC<EditWeightFormProps> = ({
  recordId,
  initialData,
  onUpdate,
  onCancel,
  loading
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<WeightEntry>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<boolean>(false);
  
  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For numeric fields, convert to number
    if (name !== 'Date') {
      const numericValue = parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numericValue) ? '' : numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Date validation
    if (formData.Date) {
      const dateRegex = /^(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-](\d{2}|\d{4})$/;
      if (!dateRegex.test(formData.Date)) {
        newErrors.Date = 'Please enter a valid date (MM/DD/YY or MM/DD/YYYY)';
      }
    }
    
    // Numeric field validation
    const numericFields = [
      'Weight', 'BMI', 'Body Fat %', 'V-Fat', 'S-Fat', 
      'Age', 'HR', 'Water %', 'Bone Mass %', 'Protien %', 
      'Fat Free Weight', 'Bone Mass LB', 'BMR', 'Muscle Mass'
    ] as const;
    
    numericFields.forEach(field => {
      if (formData[field] !== undefined) {
        if (typeof formData[field] !== 'number' || isNaN(formData[field] as number)) {
          newErrors[field] = 'Please enter a valid number';
        }
      }
    });
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recordId) {
      setErrors({ form: 'Missing record ID' });
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Submit form data
    try {
      const result = await onUpdate(recordId, formData);
      
      if (result) {
        setSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
          onCancel();
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating record:', error);
      setErrors({ form: 'Failed to update record' });
    }
  };
  
  // List of editable fields
  const editableFields = [
    { name: 'Date', label: 'Date', type: 'text' },
    { name: 'Weight', label: 'Weight (lbs)', type: 'number', step: '0.1' },
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
    { name: 'Muscle Mass', label: 'Muscle Mass (lbs)', type: 'number', step: '0.1' },
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Weight Record</h2>
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 text-green-800 dark:text-green-300 rounded-md">
          Record updated successfully!
        </div>
      )}
      
      {errors.form && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-800 dark:text-red-300 rounded-md">
          {errors.form}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {editableFields.map(field => (
            <div key={field.name} className="mb-4">
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </label>
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name as keyof WeightEntry] || ''}
                onChange={handleChange}
                step={field.step}
                className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white sm:text-sm ${
                  errors[field.name] ? 'border-red-300 dark:border-red-700' : ''
                }`}
              />
              {errors[field.name] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 ${
              loading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            }`}
          >
            {loading ? 'Updating...' : 'Update Record'}
          </button>
        </div>
      </form>
    </div>
  );
};