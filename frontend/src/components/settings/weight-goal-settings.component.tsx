// frontend/src/components/settings/WeightGoalSettings.tsx
import React, { useState } from 'react';
import { useMetrics } from '@/contexts/metrics.context';

export const WeightGoalSettings: React.FC = () => {
  const { goalWeight, setGoalWeight, loading } = useMetrics();
  const [localGoalWeight, setLocalGoalWeight] = useState<string>(
    goalWeight !== null ? goalWeight.toString() : ''
  );
  const [isSaved, setIsSaved] = useState(false);

  // Update local state when context updates
  React.useEffect(() => {
    setLocalGoalWeight(goalWeight !== null ? goalWeight.toString() : '');
  }, [goalWeight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert to number or null
    const numericGoal = localGoalWeight ? parseFloat(localGoalWeight) : null;

    if (numericGoal !== null && (isNaN(numericGoal) || numericGoal <= 0)) {
      alert('Please enter a valid weight goal (positive number)');
      return;
    }

    await setGoalWeight(numericGoal);
    setIsSaved(true);

    // Hide success message after 3 seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-medium text-gray-900 mb-4">Weight Goal</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="goalWeight" className="block text-sm font-medium text-gray-700 mb-1">
            Goal Weight (lbs)
          </label>
          <input
            type="number"
            id="goalWeight"
            value={localGoalWeight}
            onChange={(e) => setLocalGoalWeight(e.target.value)}
            placeholder="Enter your goal weight"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            step="0.1"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500">
            Set your target weight goal. Leave blank to remove your goal.
            This will be displayed on your weight chart and used for progress calculations.
          </p>
        </div>

        {isSaved && (
          <div className="mb-4 p-2 bg-green-50 text-green-700 rounded">
            Weight goal saved successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white ${loading
              ? 'bg-gray-400'
              : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
        >
          {loading ? 'Saving...' : 'Save Goal'}
        </button>
      </form>
    </div>
  );
};