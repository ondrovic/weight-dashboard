// src/components/weight/WeightDataForm.tsx
import React, { useState, useEffect } from 'react';
import { WeightEntry } from '../../types/weightData';

// Extended type to include UI-specific fields and allow indexing with string
interface FormWeightEntry extends Partial<WeightEntry> {
  dateInputValue?: string;
  [key: string]: any; // Add index signature to allow string indexing
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
  // Get current date in both formats
  const { formattedDate, dateInputValue } = getCurrentDateFormats();

  // Initial form data - use provided data or defaults
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
    "Muscle Mass": undefined,
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [showAllFields, setShowAllFields] = useState<boolean>(expandedByDefault || isEditMode);
  
  // Initialize form with initial data if in edit mode
  useEffect(() => {
    if (initialData && isEditMode) {
      const formattedData: FormWeightEntry = { ...initialData };
      
      // Format the date for the input field if needed
      if (formattedData.Date) {
        const dateParts = formattedData.Date.split(/[-\/]/);
        if (dateParts.length === 3) {
          const month = dateParts[0].padStart(2, '0');
          const day = dateParts[1].padStart(2, '0');
          // Handle both 2-digit and 4-digit years
          const year = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
          
          // Store the formatted date for HTML date input (YYYY-MM-DD)
          formattedData.dateInputValue = `${year}-${month}-${day}`;
        }
      }
      
      setFormData(formattedData);
      
      // Show all fields in edit mode
      setShowAllFields(true);
    }
  }, [initialData, isEditMode]);
  
  // Get current date in both MM-DD-YY and YYYY-MM-DD formats
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
  
  // Validates date string in MM-DD-YY format
  function isValidDateFormat(dateStr: string): boolean {
    const regex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    
    // Check if the date is valid (e.g., not 02-31-24)
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
      // When the date input changes, update both the input value and the Date field
      if (value) {
        const dateParts = value.split('-');
        if (dateParts.length === 3) {
          const year = dateParts[0].slice(2); // Get last 2 digits of year
          const month = dateParts[1];
          const day = dateParts[2];
          
          setFormData({
            ...formData,
            dateInputValue: value,
            Date: `${month}-${day}-${year}`
          });
        }
      } else {
        setFormData({
          ...formData,
          dateInputValue: value,
          Date: ''
        });
      }
    } else if (name !== 'Date') {
      // Handle numeric fields
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear form messages when the user makes changes
    if (formError || formSuccess) {
      setFormError(null);
      setFormSuccess(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate required fields
    if (!formData.Date) {
      setFormError('Date is required');
      return;
    }
    
    // Validate date format
    if (!isValidDateFormat(formData.Date)) {
      setFormError('Invalid date format. Please use MM-DD-YY');
      return;
    }
    
    if (!formData.Weight) {
      setFormError('Weight is required');
      return;
    }
    
    try {
      // Prepare data for submission (remove UI-specific fields)
      const submissionData: Partial<WeightEntry> = { ...formData };
      delete (submissionData as FormWeightEntry).dateInputValue;
      
      // In edit mode, pass both data and recordId. In add mode, just pass data
      const success = isEditMode && recordId 
        ? await onSubmit(submissionData, recordId)
        : await onSubmit(submissionData);
        
      if (success) {
        setFormSuccess(true);
        
        // In add mode, reset form to initial values
        if (!isEditMode) {
          const { formattedDate, dateInputValue } = getCurrentDateFormats();
          setFormData({
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
            "Muscle Mass": undefined,
          });
        }
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setFormSuccess(false);
        }, 3000);
      } else {
        setFormError('Failed to save entry');
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'submitting'} weight entry:`, error);
      setFormError(`An error occurred while ${isEditMode ? 'updating' : 'saving'} your weight entry`);
    }
  };
  
  // Define the form fields
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
    { name: 'Muscle Mass', label: 'Muscle Mass (lbs)', type: 'number', step: '0.1' },
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        {isEditMode ? 'Edit Weight Record' : 'Add Weight Entry'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date field with improved handling */}
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
          
          {/* Weight field */}
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
        
        {/* Toggle for additional fields - only show in add mode if not expanded by default */}
        {!expandedByDefault && !isEditMode && (
          <button 
            type="button"
            onClick={() => setShowAllFields(!showAllFields)}
            className="mb-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none"
          >
            {showAllFields ? 'Hide additional fields' : 'Show additional fields'}
          </button>
        )}
        
        {/* Additional fields */}
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
        
        {/* Error message */}
        {formError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 text-red-800 dark:text-red-300 rounded-md">
            {formError}
          </div>
        )}
        
        {/* Success message */}
        {formSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 text-green-800 dark:text-green-300 rounded-md">
            {isEditMode ? 'Record updated successfully!' : 'Weight entry saved successfully!'}
          </div>
        )}
        
        {/* Submit button */}
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