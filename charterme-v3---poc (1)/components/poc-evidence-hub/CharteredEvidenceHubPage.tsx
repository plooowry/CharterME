import React, { useState } from 'react';
import PageTitle from '../core/PageTitle';
import PocFileUploadForm from './PocFileUploadForm';
import PocFileList from './PocFileList';
import PocCompetencyRagTable from './PocCompetencyRagTable';
import Icon from '../core/Icon';

const CharteredEvidenceHubPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleUploadSuccess = (fileId: string) => {
    // console.log("File uploaded successfully with ID:", fileId);
    setNotification({ message: 'File uploaded and associated successfully!', type: 'success' });
    setShowForm(false); // Optionally hide form on success
    setTimeout(() => setNotification(null), 4000);
  };
  
  const showUploadNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageTitle 
        title="Chartered Evidence Hub (PoC)" 
        subtitle="Manage your evidence files and track competency coverage for chartership preparation." 
      />

      {notification && (
        <div 
          className={`p-3 rounded-md mb-6 text-sm ${
            notification.type === 'success' 
            ? 'bg-green-100 text-green-700 dark:bg-dark-theme-accent-green/20 dark:text-dark-theme-accent-green' 
            : 'bg-red-100 text-red-700 dark:bg-dark-theme-accent-red/20 dark:text-dark-theme-accent-red'
          }`}
          role="alert"
        >
          {notification.message}
        </div>
      )}

      {/* RAG Status Overview Table */}
      <section className="mb-8 bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base mb-4 pb-3 border-b border-theme-border dark:border-dark-theme-border">
          Competency RAG Status Overview
        </h2>
        <PocCompetencyRagTable />
         <p className="mt-3 text-xs text-theme-text-muted dark:text-dark-theme-text-muted">
          This table provides a high-level visual summary. Status is Green if evidence is linked, Amber if designated for attention, and Red otherwise. This is a simplified PoC representation.
        </p>
      </section>

      {/* File Management Section */}
      <section className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-theme-border dark:border-dark-theme-border">
            <h2 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base">
            Manage Evidence Files
            </h2>
            <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center px-4 py-2 bg-theme-secondary dark:bg-dark-theme-secondary hover:bg-theme-secondary/80 dark:hover:bg-dark-theme-secondary/80 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
                <Icon name={showForm ? "close" : "plus"} className="w-5 h-5 mr-2" />
                {showForm ? 'Close Upload Form' : 'Add New Evidence File'}
            </button>
        </div>
        
        {showForm && (
          <div className="mb-6">
            <PocFileUploadForm onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        <PocFileList showNotification={showUploadNotification} />
      </section>

    </div>
  );
};

export default CharteredEvidenceHubPage;