import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { POC_COMPETENCIES, POC_ALLOWED_FILE_TYPES, POC_MAX_FILE_SIZE_BYTES, POC_ACCEPT_STRING, POC_MAX_FILE_SIZE_MB } from '../../constants';
import { PocEvidenceFile } from '../../types';
import Icon from '../core/Icon';
import LoadingSpinner from '../core/LoadingSpinner';

interface PocFileUploadFormProps {
  onUploadSuccess: (fileId: string) => void;
}

const PocFileUploadForm: React.FC<PocFileUploadFormProps> = ({ onUploadSuccess }) => {
  const { addPocEvidenceFile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [associatedCompetencyIds, setAssociatedCompetencyIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [fileNameDisplay, setFileNameDisplay] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');
    setSelectedFile(null);
    setFileNameDisplay('');

    if (file) {
      if (!POC_ALLOWED_FILE_TYPES[file.type as keyof typeof POC_ALLOWED_FILE_TYPES]) {
        setError(`Invalid file type: ${file.type}. Accepted types: ${Object.values(POC_ALLOWED_FILE_TYPES).join(', ')}.`);
        event.target.value = ''; // Reset file input
        return;
      }
      if (file.size > POC_MAX_FILE_SIZE_BYTES) {
        setError(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${POC_MAX_FILE_SIZE_MB}MB.`);
        event.target.value = ''; // Reset file input
        return;
      }
      setSelectedFile(file);
      setFileNameDisplay(file.name);
    }
  };

  const handleCompetencyToggle = (competencyId: string) => {
    setAssociatedCompetencyIds(prev =>
      prev.includes(competencyId)
        ? prev.filter(id => id !== competencyId)
        : [...prev, competencyId]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a file.');
      return;
    }
    if (associatedCompetencyIds.length === 0) {
      setError('Please associate the file with at least one competency.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileDataUrl = reader.result as string;
        const newFileData: Omit<PocEvidenceFile, 'id' | 'uploadDate'> = {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileSize: selectedFile.size,
          associatedCompetencyIds,
          fileDataUrl,
        };
        const newFileId = await addPocEvidenceFile(newFileData);
        onUploadSuccess(newFileId);
        // Reset form
        setSelectedFile(null);
        setAssociatedCompetencyIds([]);
        setFileNameDisplay('');
        const fileInput = document.getElementById('poc-file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      };
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
        setIsProcessing(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('An unexpected error occurred during upload. Please try again.');
      setIsProcessing(false);
    } finally {
      // setIsProcessing is handled within onloadend/onerror for FileReader
    }
  };
  
  // Effect to clear processing state if file selection is reset
  React.useEffect(() => {
    if (!selectedFile) {
        setIsProcessing(false);
    }
  }, [selectedFile]);


  return (
    <form onSubmit={handleSubmit} className="p-4 border border-theme-border dark:border-dark-theme-border rounded-lg bg-theme-bg-muted dark:bg-dark-theme-bg-muted space-y-6">
      <div>
        <label htmlFor="poc-file-upload" className="block text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base mb-1">
          Upload Evidence File
        </label>
        <input
          type="file"
          id="poc-file-upload"
          accept={POC_ACCEPT_STRING}
          onChange={handleFileChange}
          className="block w-full text-sm text-theme-text-muted dark:text-dark-theme-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-theme-primary/10 dark:file:bg-dark-theme-primary/10 file:text-theme-primary dark:file:text-dark-theme-primary hover:file:bg-theme-primary/20 dark:hover:file:bg-dark-theme-primary/20 disabled:opacity-50"
          disabled={isProcessing}
        />
        {fileNameDisplay && <p className="mt-1 text-xs text-theme-text-muted dark:text-dark-theme-text-muted">Selected: {fileNameDisplay}</p>}
        <p className="mt-1 text-xs text-theme-text-muted dark:text-dark-theme-text-muted">
          Max {POC_MAX_FILE_SIZE_MB}MB. Types: {Object.values(POC_ALLOWED_FILE_TYPES).filter((v,i,a) => a.indexOf(v) === i).join(', ')}.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base mb-2">
          Associate with Competencies
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2 rounded-md border border-theme-border dark:border-dark-theme-border bg-theme-bg-base dark:bg-dark-theme-bg-base">
          {POC_COMPETENCIES.map(comp => (
            <label key={comp.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-theme-bg-hover dark:hover:bg-dark-theme-bg-hover cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={associatedCompetencyIds.includes(comp.id)}
                onChange={() => handleCompetencyToggle(comp.id)}
                className="form-checkbox h-4 w-4 text-theme-primary dark:text-dark-theme-primary focus:ring-theme-primary dark:focus:ring-dark-theme-primary rounded disabled:opacity-50"
                disabled={isProcessing}
              />
              <span className="text-xs text-theme-text-base dark:text-dark-theme-text-base">{comp.title}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-dark-theme-accent-red">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isProcessing || !selectedFile || associatedCompetencyIds.length === 0}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-theme-primary dark:bg-dark-theme-primary hover:bg-theme-primary/80 dark:hover:bg-dark-theme-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-dark-theme-primary disabled:bg-opacity-60"
        >
          {isProcessing ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Icon name="upload" className="w-5 h-5 mr-2" />
          )}
          {isProcessing ? 'Processing...' : 'Upload and Associate'}
        </button>
      </div>
    </form>
  );
};

export default PocFileUploadForm;