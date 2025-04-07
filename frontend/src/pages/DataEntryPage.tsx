// frontend/src/pages/DataEntryPage.tsx
import React from 'react';
import { useWeightData } from '../hooks/useWeightData';
import { DataUpload } from '../components/weight/DataUpload';
import { WeightEntryForm } from '../components/weight/WeightEntryForm';
import { DataTable } from '../components/weight/DataTable';

const DataEntryPage: React.FC = () => {
  const { 
    data,
    loading: dataLoading, 
    error: dataError, 
    uploadData,
    createWeightEntry,
    updateWeightData,
    deleteWeightData,
    refreshData 
  } = useWeightData();

  // Handle record update
  const handleUpdateRecord = async (id: string, updateData: any): Promise<boolean> => {
    return await updateWeightData(id, updateData);
  };

  // Handle record deletion
  const handleDeleteRecord = async (id: string): Promise<boolean> => {
    return await deleteWeightData(id);
  };

  return (
    <div className="container mx-auto">
      {/* Error message */}
      {dataError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{dataError}</p>
          <button
            onClick={refreshData}
            className="mt-2 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Data Entry</h1>
        <p className="text-gray-600 mb-8">
          Add new weight measurements or upload data from your smart scale.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Manual Entry Form */}
        <div>
          <WeightEntryForm onSubmit={createWeightEntry} loading={dataLoading} />
        </div>
        
        {/* Upload Component */}
        <div>
          <DataUpload uploadData={uploadData} loading={dataLoading} />
        </div>
      </div>

      {/* Data Table */}
      <div className="mb-6">
        <DataTable 
          data={data} 
          loading={dataLoading} 
          onUpdateRecord={handleUpdateRecord}
          onDeleteRecord={handleDeleteRecord}
        />
      </div>

      {/* Instructions */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Manual Entry</h3>
          <p className="text-gray-700">
            Use the form to manually enter weight data. At minimum, you need to provide 
            a date and weight value. Additional metrics like BMI, body fat percentage, etc. 
            are optional.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Data Upload</h3>
          <p className="text-gray-700">
            You can upload a CSV file exported from your smart scale. The file should 
            contain at least the date and weight columns. The system will automatically 
            detect and process the data format.
          </p>
          <p className="text-gray-700 mt-2">
            If you're uploading data for dates that already exist in the system, the 
            new data will update the existing records.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataEntryPage;