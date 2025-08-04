import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { PocEvidenceFile } from '../../types';
import { POC_COMPETENCIES } from '../../constants';
import Icon from '../core/Icon';

interface PocFileListProps {
  showNotification: (message: string, type: 'success' | 'error') => void;
}

const PocFileList: React.FC<PocFileListProps> = ({ showNotification }) => {
  const { pocEvidenceFiles, pocEvidenceVersion, deletePocEvidenceFile } = useAuth(); // pocEvidenceVersion to trigger re-render

  const handleDelete = async (fileId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete the file "${fileName}"? This action cannot be undone.`)) {
      try {
        await deletePocEvidenceFile(fileId);
        showNotification(`File "${fileName}" deleted successfully.`, 'success');
      } catch (error) {
        console.error('Error deleting file:', error);
        showNotification(`Failed to delete file "${fileName}".`, 'error');
      }
    }
  };

  const getCompetencyTitle = (id: string) => POC_COMPETENCIES.find(c => c.id === id)?.title || id;
  
  const sortedFiles = React.useMemo(() => {
    return [...pocEvidenceFiles].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [pocEvidenceFiles, pocEvidenceVersion]);


  if (sortedFiles.length === 0) {
    return <p className="text-center text-theme-text-muted dark:text-dark-theme-text-muted py-4">No evidence files uploaded yet.</p>;
  }

  return (
    <div className="space-y-4">
      {sortedFiles.map(file => (
        <div key={file.id} className="bg-theme-bg-muted dark:bg-dark-theme-bg-muted p-4 rounded-lg shadow-sm border border-theme-border dark:border-dark-theme-border">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start">
            <div>
              <h4 className="font-semibold text-theme-text-base dark:text-dark-theme-text-base break-all">{file.fileName}</h4>
              <p className="text-xs text-theme-text-muted dark:text-dark-theme-text-muted">
                Uploaded: {new Date(file.uploadDate).toLocaleString()} | Type: {file.fileType} | Size: {(file.fileSize / 1024).toFixed(2)} KB
              </p>
            </div>
            <div className="mt-3 sm:mt-0 flex space-x-2 flex-shrink-0">
              {file.fileType.startsWith('image/') && (
                <a
                  href={file.fileDataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 text-xs font-medium rounded-md text-white bg-theme-secondary dark:bg-dark-theme-secondary hover:bg-theme-secondary/80 dark:hover:bg-dark-theme-secondary/80 transition-colors"
                  aria-label={`View ${file.fileName}`}
                >
                  View
                </a>
              )}
               {(file.fileType === 'application/pdf') && (
                <a
                  href={file.fileDataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 text-xs font-medium rounded-md text-white bg-theme-secondary dark:bg-dark-theme-secondary hover:bg-theme-secondary/80 dark:hover:bg-dark-theme-secondary/80 transition-colors"
                  aria-label={`View ${file.fileName} in new tab`}
                >
                  View PDF
                </a>
              )}
              {/* Mock download for other types for PoC */}
              {!file.fileType.startsWith('image/') && file.fileType !== 'application/pdf' && (
                 <button 
                    onClick={() => alert(`Download functionality for "${file.fileName}" is mocked for this PoC.`)}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-md text-white bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors"
                    aria-label={`Download ${file.fileName} (mocked)`}
                 >
                    Download (Mock)
                 </button>
              )}
              <button
                onClick={() => handleDelete(file.id, file.fileName)}
                className="p-1.5 text-theme-accent-red dark:text-dark-theme-accent-red hover:bg-red-100 dark:hover:bg-dark-theme-accent-red/20 rounded-md transition-colors"
                aria-label={`Delete ${file.fileName}`}
              >
                <Icon name="trash" className="w-4 h-4" />
              </button>
            </div>
          </div>
          {file.associatedCompetencyIds.length > 0 && (
            <div className="mt-3 pt-2 border-t border-theme-border/50 dark:border-dark-theme-border/50">
              <p className="text-xs font-medium text-theme-text-base dark:text-dark-theme-text-base mb-1">Associated Competencies:</p>
              <div className="flex flex-wrap gap-1.5">
                {file.associatedCompetencyIds.map(compId => (
                  <span key={compId} className="px-2 py-0.5 text-xs bg-theme-primary/20 dark:bg-dark-theme-primary/20 text-theme-primary dark:text-dark-theme-primary rounded-full">
                    {getCompetencyTitle(compId)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PocFileList;