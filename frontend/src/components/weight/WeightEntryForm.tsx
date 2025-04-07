// src/components/weight/WeightEntryForm.tsx
import React, { useState } from 'react';
import { WeightEntry } from '../../types/weightData';

interface WeightEntryFormProps {
  onSubmit: (entry: Partial<WeightEntry>) => Promise<boolean>;
  loading: boolean;
  expandedByDefault?: boolean;
}

export const WeightEntryForm: React.FC<WeightEntryFormProps> = ({ 
  onSubmit, 
  loading, 
  expandedByDefault = false 
}) => {
  const [formData, setFormData] = useState<Partial<WeightEntry>>({
    Date: formatCurrentDate(),
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
  const [showAllFields, setShowAllFields] = useState<boolean>(expandedByDefault);
  
  // Format current date as MM-DD-YY for the form
  function formatCurrentDate(): string {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = String(now.getFullYear()).slice(2);
    return `${month}-${day}-${year}`;
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
    
    // Handle numeric fields
    if (name !== 'Date') {
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
      const success = await onSubmit(formData);
      if (success) {
        setFormSuccess(true);
        // Reset form to initial values except date
        const currentDate = formatCurrentDate();
        setFormData({
          Date: currentDate,
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
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setFormSuccess(false);
        }, 3000);
      } else {
        setFormError('Failed to save entry');
      }
    } catch (error) {
      console.error('Error submitting weight entry:', error);
      setFormError('An error occurred while saving your weight entry');
    }
  };
  
  // Define the fields to display
  const requiredFields = [
    { name: 'Date', label: 'Date (MM-DD-YY)', type: 'text' },
    { name: 'Weight', label: 'Weight (lbs)', type: 'number', step: '0.1' },
  ];
  
  const optionalFields = [
    { name: 'BMI', label: 'BMI', type: 'number', step: '0.1' },
    { name: 'Body Fat %', label: 'Body Fat %', type: 'number', step: '0.1' },
    { name: 'V-Fat', label: 'Visceral Fat', type: 'number', step: '0.1' },
    { name: 'S-Fat', label: 'Subcutaneous Fat', type: 'number', step: '0.1' },
    { name: 'Age', label: 'Metabolic Age', type: 'number', step: '1' },
    { name: 'HR', label: 'Heart Rate', type: 'number', step: '1' },
    { name: 'Water %', label: 'Water %', type: 'number', step: '0.1' },
    { name: 'Bone Mass %', label: 'Bone Mass %', type: 'number', step: '0.1' },
    { name: 'Protien %', label: 'Protein %', type: 'number', step: '0.1' },
    { name: 'Fat Free Weight', label: 'Fat Free Weight (lbs)', type: 'number', step: '0.1' },
    { name: 'Bone Mass LB', label: 'Bone Mass (lbs)', type: 'number', step: '0.1' },
    { name: 'BMR', label: 'BMR', type: 'number', step: '1' },
    { name: 'Muscle Mass', label: 'Muscle Mass (lbs)', type: 'number', step: '0.1' },
  ];
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Weight Entry</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Required fields */}
          {requiredFields.map(field => (
            <div key={field.name} className="mb-2">
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {field.label} {field.name === 'Weight' || field.name === 'Date' ? '*' : ''}
              </label>
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name as keyof typeof formData] || ''}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                step={field.step}
                required={field.name === 'Weight' || field.name === 'Date'}
              />
            </div>
          ))}
        </div>
        
        {/* Toggle for additional fields */}
        {!expandedByDefault && (
          <button 
            type="button"
            onClick={() => setShowAllFields(!showAllFields)}
            className="mb-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none"
          >
            {showAllFields ? 'Hide additional fields' : 'Show additional fields'}
          </button>
        )}
        
        {/* Additional fields (always shown if expandedByDefault is true) */}
        {(showAllFields || expandedByDefault) && (
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
                  value={formData[field.name as keyof typeof formData] || ''}
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
            Weight entry saved successfully!
          </div>
        )}
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            loading
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </form>
    </div>
  );
};