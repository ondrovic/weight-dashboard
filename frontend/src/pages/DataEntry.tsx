import React, { useState } from 'react';
import { useWeightData } from '@/hooks/use-weight-data';
import { DataTable } from '@/components/common/data-table';
import { WeightDataForm } from '@/components/weight/DataForm';
import { DataUpload } from '@/components/common/data-upload'
import { DataManagement } from '@/components/weight/DataManagement';
import { Tabs, Tab } from '@/components/common/tabs';
import { useToast } from '@/components/toast-notification/hooks/use-toast';
import { ToastType } from '@/components/toast-notification/lib/toast.types';

export const DataEntryPage: React.FC = () => {
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

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<string>('data');

  const tabs: Tab[] = [
    { id: 'data', label: 'Data', icon: 'table' },
    { id: 'add-record', label: 'Add Single Record', icon: 'plus' },
    { id: 'upload', label: 'Upload Records', icon: 'upload' },
    { id: 'manage', label: 'Manage', icon: 'cog' }
  ];

  const handleUpdateRecord = async (id: string, updateData: any): Promise<boolean> => {
    try {
      const success = await updateWeightData(id, updateData);
      if (success) {
        showToast({ message: 'Entry updated successfully.', type: ToastType.Success });
      } else {
        showToast({ message: 'Failed to update entry.', type: ToastType.Error });
      }
      return success;
    } catch (err) {
      console.error(err);
      showToast({ message: 'An error occurred while updating.', type: ToastType.Error });
      return false;
    }
  };

  const handleDeleteRecord = async (id: string): Promise<boolean> => {
    try {
      const success = await deleteWeightData(id);
      if (success) {
        showToast({ message: 'Entry deleted successfully.', type: ToastType.Success });
      } else {
        showToast({ message: 'Failed to delete entry.', type: ToastType.Error });
      }
      return success;
    } catch (err) {
      console.error(err);
      showToast({ message: 'An error occurred while deleting.', type: ToastType.Error });
      return false;
    }
  };

  return (
    <div className="w-full">
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
          View, add, import, and manage your tracking data.
        </p>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

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
          <WeightDataForm
            onSubmit={createWeightEntry}
            loading={dataLoading}
            expandedByDefault={true}
            isEditMode={false}
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
            onDataChange={refreshData}
            loading={dataLoading}
          />
        )}
      </div>
    </div>
  );
};