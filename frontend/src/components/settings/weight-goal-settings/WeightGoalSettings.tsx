import React from 'react';
import { useWeightGoal } from './hooks/use-weight-goal';

export const WeightGoalSettings: React.FC = () => {
  const {
    localGoalWeight,
    setLocalGoalWeight,
    handleSubmit,
    loading,
  } = useWeightGoal();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
        Weight Goal
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="goalWeight"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Goal Weight (lbs)
          </label>
          <input
            type="number"
            id="goalWeight"
            value={localGoalWeight}
            onChange={(e) => setLocalGoalWeight(e.target.value)}
            placeholder="Enter your goal weight"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            step="0.1"
            min="0"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Set your target weight goal. Leave blank to remove your goal.
            This will be displayed on your weight chart and used for progress calculations.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white transition ${
            loading
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
          }`}
        >
          {loading ? 'Saving...' : 'Save Goal'}
        </button>
      </form>
    </div>
  );
};
