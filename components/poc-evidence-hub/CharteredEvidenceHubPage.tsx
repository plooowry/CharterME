import React, { useState, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import PageTitle from '../core/PageTitle';
import Icon from '../core/Icon';
import { POC_COMPETENCIES, POC_MAX_FILE_SIZE_BYTES, POC_MAX_FILE_SIZE_MB, POC_ACCEPT_STRING, POC_ALLOWED_FILE_TYPES } from '../../constants';
import { PocEvidenceFile, PocCompetency } from '../../types';
import LoadingSpinner from '../core/LoadingSpinner';

// Helper to format file size
const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// The file upload form component, nested for simplicity
const PocFileUploadForm: React.FC<{
    onAddFile: (fileData: Omit<PocEvidenceFile, 'id' | 'uploadDate'>) => Promise<void>,
    competencies: PocCompetency[]
}> = ({ onAddFile, competencies }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [associatedCompetencyIds, setAssociatedCompetencyIds] = useState<string[]>([]);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > POC_MAX_FILE_SIZE_BYTES) {
                setError(`File is too large. Maximum size is ${POC_MAX_FILE_SIZE_MB}MB.`);
                setSelectedFile(null);
                event.target.value = '';
                return;
            }
             if (!Object.keys(POC_ALLOWED_FILE_TYPES).includes(file.type)) {
                setError(`Invalid file type. Allowed types: ${Object.values(POC_ALLOWED_FILE_TYPES).join(', ')}`);
                setSelectedFile(null);
                event.target.value = '';
                return;
            }
            setError('');
            setSelectedFile(file);
        }
    };

    const handleCompetencyToggle = (competencyId: string) => {
        setAssociatedCompetencyIds(prev =>
            prev.includes(competencyId)
                ? prev.filter(id => id !== competencyId)
                : [...prev, competencyId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file.');
            return;
        }
        if (associatedCompetencyIds.length === 0) {
            setError('Please associate the file with at least one competency.');
            return;
        }
        
        setIsLoading(true);
        setError('');

        try {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = async () => {
                const fileDataUrl = reader.result as string;
                await onAddFile({
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                    fileSize: selectedFile.size,
                    associatedCompetencyIds,
                    fileDataUrl,
                });
                // Reset form
                setSelectedFile(null);
                setAssociatedCompetencyIds([]);
                const fileInput = document.getElementById('poc-file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                setIsLoading(false);
            };
            reader.onerror = () => {
                setError('Failed to read file.');
                setIsLoading(false);
            };
        } catch (err) {
            console.error(err);
            setError('An unexpected error occurred during file processing.');
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="p-6 bg-theme-bg-muted dark:bg-dark-theme-bg-muted border border-theme-border dark:border-dark-theme-border rounded-lg shadow-inner space-y-6">
            <div>
                <label htmlFor="poc-file-upload" className="block text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base mb-2">1. Upload Evidence File</label>
                <input
                    id="poc-file-upload"
                    type="file"
                    accept={POC_ACCEPT_STRING}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-theme-text-muted dark:text-dark-theme-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-theme-primary/10 dark:file:bg-dark-theme-primary/10 file:text-theme-primary dark:file:text-dark-theme-primary hover:file:bg-theme-primary/20 dark:hover:file:bg-dark-theme-primary/20"
                    disabled={isLoading}
                />
                {selectedFile && <p className="mt-2 text-xs text-theme-text-muted dark:text-dark-theme-text-muted">Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})</p>}
            </div>

            <div>
                <p className="block text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base mb-2">2. Associate with Competencies</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {competencies.map(comp => (
                        <label key={comp.id} className="flex items-center space-x-3 p-2 rounded-md bg-theme-bg-base dark:bg-dark-theme-bg-base cursor-pointer hover:bg-theme-bg-hover dark:hover:bg-dark-theme-bg-hover">
                            <input
                                type="checkbox"
                                checked={associatedCompetencyIds.includes(comp.id)}
                                onChange={() => handleCompetencyToggle(comp.id)}
                                className="h-4 w-4 rounded border-gray-300 text-theme-primary dark:text-dark-theme-primary focus:ring-theme-primary dark:focus:ring-dark-theme-primary"
                                disabled={isLoading}
                            />
                            <span className="text-sm text-theme-text-base dark:text-dark-theme-text-base">{comp.title}</span>
                        </label>
                    ))}
                </div>
            </div>

            {error && <p className="text-sm text-red-600 dark:text-dark-theme-accent-red">{error}</p>}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading || !selectedFile || associatedCompetencyIds.length === 0}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-theme-primary dark:bg-dark-theme-primary hover:bg-theme-primary/80 dark:hover:bg-dark-theme-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-dark-theme-primary disabled:opacity-50"
                >
                    {isLoading ? <LoadingSpinner size="sm" /> : <Icon name="upload" className="w-5 h-5 mr-2" />}
                    {isLoading ? 'Uploading...' : 'Add File'}
                </button>
            </div>
        </form>
    );
};


// The evidence item component
const PocEvidenceItem: React.FC<{
    item: PocEvidenceFile,
    competencies: PocCompetency[],
    onDelete: (fileId: string) => void
}> = ({ item, competencies, onDelete }) => {
    const associatedCompetencies = competencies.filter(c => item.associatedCompetencyIds.includes(c.id));
    const isImage = item.fileType.startsWith('image/');

    return (
        <div className="bg-theme-bg-muted dark:bg-dark-theme-bg-muted p-4 rounded-lg border border-theme-border dark:border-dark-theme-border flex flex-col sm:flex-row items-start gap-4">
            {isImage ? (
                 <a href={item.fileDataUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                    <img src={item.fileDataUrl} alt={item.fileName} className="w-24 h-24 object-cover rounded-md border-2 border-theme-border dark:border-dark-theme-border" />
                 </a>
            ) : (
                <div className="flex-shrink-0 w-24 h-24 bg-theme-bg-base dark:bg-dark-theme-bg-base rounded-md flex items-center justify-center border-2 border-theme-border dark:border-dark-theme-border">
                    <Icon name="file" className="w-10 h-10 text-theme-text-muted dark:text-dark-theme-text-muted" />
                </div>
            )}
           
            <div className="flex-grow">
                <h4 className="font-semibold text-theme-text-base dark:text-dark-theme-text-base">{item.fileName}</h4>
                <p className="text-sm text-theme-text-muted dark:text-dark-theme-text-muted">{formatBytes(item.fileSize)} &bull; {new Date(item.uploadDate).toLocaleDateString()}</p>
                 <div className="mt-2">
                    <p className="text-xs font-medium text-theme-text-base dark:text-dark-theme-text-base">Associated Competencies:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {associatedCompetencies.map(comp => (
                            <span key={comp.id} className="px-2 py-0.5 text-xs font-medium rounded-full bg-theme-secondary/20 dark:bg-dark-theme-secondary/20 text-theme-secondary dark:text-dark-theme-secondary">
                                {comp.title}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 flex sm:flex-col items-center gap-2 mt-2 sm:mt-0">
                <a href={item.fileDataUrl} download={item.fileName} className="p-2 text-theme-text-muted dark:text-dark-theme-text-muted hover:text-theme-primary dark:hover:text-dark-theme-primary rounded-full hover:bg-theme-bg-hover dark:hover:bg-dark-theme-bg-hover" title="Download">
                    <Icon name="download" className="w-5 h-5"/>
                </a>
                 <button onClick={() => onDelete(item.id)} className="p-2 text-theme-text-muted dark:text-dark-theme-text-muted hover:text-theme-accent-red dark:hover:text-dark-theme-accent-red rounded-full hover:bg-theme-bg-hover dark:hover:bg-dark-theme-bg-hover" title="Delete">
                    <span className="text-xl leading-none">🗑️</span>
                </button>
            </div>
        </div>
    );
};


const CharteredEvidenceHubPage: React.FC = () => {
  const { pocEvidenceFiles, addPocEvidenceFile, deletePocEvidenceFile, pocEvidenceVersion } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const handleAddFile = async (fileData: Omit<PocEvidenceFile, 'id' | 'uploadDate'>) => {
      await addPocEvidenceFile(fileData);
      setShowForm(false); // Hide form on successful upload
  };
  
  const handleDeleteFile = async (fileId: string) => {
      if(window.confirm('Are you sure you want to delete this evidence file? This action cannot be undone.')) {
        await deletePocEvidenceFile(fileId);
      }
  };

  const sortedFiles = useMemo(() => {
    return [...pocEvidenceFiles].sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [pocEvidenceVersion, pocEvidenceFiles])

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageTitle 
        title="Chartered Evidence Hub (Proof of Concept)"
        subtitle="Upload, manage, and associate your evidence files with key competencies."
      />

      <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-6 border-b border-theme-border dark:border-dark-theme-border pb-4">
            <h3 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base">Your Evidence Locker</h3>
            <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center px-4 py-2 bg-theme-secondary dark:bg-dark-theme-secondary hover:bg-theme-secondary/80 dark:hover:bg-dark-theme-secondary/80 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
                <Icon name={showForm ? 'close' : 'upload'} className="w-5 h-5 mr-2"/>
                {showForm ? 'Cancel Upload' : 'Upload New File'}
            </button>
        </div>

        {showForm && <PocFileUploadForm onAddFile={handleAddFile} competencies={POC_COMPETENCIES} />}
        
        <div className="mt-8">
            {sortedFiles.length > 0 ? (
                <div className="space-y-4">
                    {sortedFiles.map(file => (
                        <PocEvidenceItem key={file.id} item={file} competencies={POC_COMPETENCIES} onDelete={handleDeleteFile} />
                    ))}
                </div>
            ) : (
                !showForm && (
                     <div className="text-center py-10 px-6 border-2 border-dashed border-theme-border-strong dark:border-dark-theme-border-strong rounded-lg">
                        <Icon name="folderOpen" className="w-16 h-16 mx-auto text-theme-text-muted dark:text-dark-theme-text-muted" />
                        <h4 className="mt-4 text-lg font-medium text-theme-text-base dark:text-dark-theme-text-base">Your evidence locker is empty.</h4>
                        <p className="mt-1 text-sm text-theme-text-muted dark:text-dark-theme-text-muted">Click "Upload New File" to start adding your evidence.</p>
                     </div>
                )
            )}
        </div>
      </div>
    </div>
  );
};

export default CharteredEvidenceHubPage;