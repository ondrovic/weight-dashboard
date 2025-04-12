import React, { useEffect, useState } from 'react';
import { useWeightData } from '@/hooks/use-weight-data';
import { DataTable } from '@/components/common/data-table';
import { WeightDataForm } from '@/components/weight/DataForm';
import { DataUpload } from '@/components/common/data-upload';
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

  useEffect(() => {
    if (dataError) {
      showToast({
        message: dataError,
        type: ToastType.Error
      });
    }
  }, [dataError, showToast]);

  const handleUpdateRecord = async (id: string, updateData: any): Promise<boolean> => {
    try {
      const success = await updateWeightData(id, updateData);
      showToast({
        message: success ? 'Entry updated successfully.' : 'Failed to update entry.',
        type: success ? ToastType.Success : ToastType.Error
      });
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
      showToast({
        message: success ? 'Entry deleted successfully.' : 'Failed to delete entry.',
        type: success ? ToastType.Success : ToastType.Error
      });
      return success;
    } catch (err) {
      console.error(err);
      showToast({ message: 'An error occurred while deleting.', type: ToastType.Error });
      return false;
    }
  };

  return (
    <div className="w-full">
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
