import React, { useState, useEffect } from 'react';
import { useMetrics } from '@/contexts/metrics.context';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

export const WeightGoalSettings: React.FC = () => {
  const { goalWeight, setGoalWeight, loading } = useMetrics();
  const [localGoalWeight, setLocalGoalWeight] = useState<string>(
    goalWeight !== null ? goalWeight.toString() : ''
  );

  const { showToast } = useToast();

  // Sync local state with context
  useEffect(() => {
    setLocalGoalWeight(goalWeight !== null ? goalWeight.toString() : '');
  }, [goalWeight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericGoal = localGoalWeight ? parseFloat(localGoalWeight) : null;

    if (numericGoal !== null && (isNaN(numericGoal) || numericGoal <= 0)) {
      showToast({
        message: 'Please enter a valid weight goal (positive number)',
        type: ToastType.Error,
      });
      return;
    }

    await setGoalWeight(numericGoal);

    showToast({
      message: 'Weight goal saved successfully!',
      type: ToastType.Success,
    });
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
