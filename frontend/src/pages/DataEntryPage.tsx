// src/pages/DataEntryPage.tsx
import React, { useState } from 'react';
import { useWeightData } from '../hooks/useWeightData';
import { DataTable } from '../components/weight/DataTable';
import { WeightEntryForm } from '../components/weight/WeightEntryForm';
import { DataUpload } from '../components/weight/DataUpload';
import { DataManagement } from '../components/weight/DataManagement';
import { TabsComponent, TabItem } from '../components/common/TabsComponent';

const DataEntryPage: React.FC = () => {
  const { 
    data,
    loading: dataLoading, 
    error: dataError, 
    uploadData,
    createWeightEntry,
    updateWeightData,
    deleteWeightData,
    exportData,
    downloadTemplate,
    clearAllData,
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

  // Define tabs
  const tabs: TabItem[] = [
    { id: 'data', label: 'Data', icon: 'table' },
    { id: 'add-record', label: 'Add Single Record', icon: 'plus' },
    { id: 'upload', label: 'Upload Records', icon: 'upload' },
    { id: 'manage', label: 'Manage', icon: 'cog' }
  ];

  // Default active tab
  const [activeTab, setActiveTab] = useState<string>(tabs[0].id);

  return (
    <div className="w-full">
      {/* Error message */}
      {dataError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{dataError}</p>
          <button
            onClick={refreshData}
            className="mt-2 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      )}
      
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Data Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          View, add, import, and manage your weight tracking data.
        </p>
      </div>

      {/* Tabs Component */}
      <TabsComponent 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'data' && (
          <DataTable 
            data={data} 
            loading={dataLoading} 
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {activeTab === 'add-record' && (
          <WeightEntryForm 
            onSubmit={createWeightEntry} 
            loading={dataLoading} 
            expandedByDefault={true}
          />
        )}

        {activeTab === 'upload' && (
          <DataUpload 
            uploadData={uploadData} 
            loading={dataLoading} 
          />
        )}

        {activeTab === 'manage' && (
          <DataManagement 
            onExport={exportData}
            onDownloadTemplate={downloadTemplate}
            onClearData={clearAllData}
            loading={dataLoading}
          />
        )}
      </div>
    </div>
  );
};

export default DataEntryPage;