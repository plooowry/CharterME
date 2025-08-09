
import React, { useState, useEffect } from 'react';
import Icon from '../core/Icon';
import LoadingSpinner from '../core/LoadingSpinner'; // Import LoadingSpinner

// Dynamically import libraries from esm.sh as specified in importmap
import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';
import mammoth from 'mammoth';

interface EvidenceFormProps {
  onSubmit: (content: string, type: 'text' | 'file', fileName?: string) => void;
  initialContent?: string;
}

// Configure PDF.js worker
// Use a reliable CDN path for the worker, matching the version in the importmap.
// esm.sh hosts these too. For pdfjs-dist@4.4.168, the worker is typically pdf.worker.min.js or .mjs.
// Let's use the .min.js version from esm.sh itself.
const pdfWorkerSrc = 'https://esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.js';
if (pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;
}


const EvidenceForm: React.FC<EvidenceFormProps> = ({ onSubmit, initialContent = '' }) => {
  const [textInput, setTextInput] = useState(initialContent);
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [fileNameDisplay, setFileNameDisplay] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  // Define accepted file types
  const contentProcessableExtensions = ['.txt', '.md', '.docx', '.pdf'];
  const attachOnlyExtensions = ['.doc', '.xls', '.xlsx', '.ppt', '.pptx'];
  const allAcceptedExtensions = [...contentProcessableExtensions, ...attachOnlyExtensions];

  const mimeTypeMap: { [key: string]: string } = {
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentationtemplate',
  };
  const acceptAttributeValue = allAcceptedExtensions.join(',') + ',' + Object.values(mimeTypeMap).join(',');


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (allAcceptedExtensions.includes(fileExtension)) {
        setSelectedFile(file);
        setFileNameDisplay(file.name);
        setFileError('');
      } else {
        setSelectedFile(null);
        setFileNameDisplay('');
        setFileError(`Invalid file type. Please upload one of the following: ${allAcceptedExtensions.join(', ')}.`);
        event.target.value = ''; // Reset file input
      }
    } else {
        setSelectedFile(null);
        setFileNameDisplay('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFileError('');

    if (inputType === 'text') {
      if (!textInput.trim()) {
        alert('Evidence content cannot be empty.');
        return;
      }
      onSubmit(textInput, 'text');
      setTextInput('');
    } else if (inputType === 'file') {
      if (!selectedFile) {
        setFileError('Please select a file to upload.');
        return;
      }
      
      setIsProcessingFile(true);
      let fileContent = '';
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

      try {
        if (fileExtension === '.txt' || fileExtension === '.md') {
          fileContent = await selectedFile.text();
        } else if (fileExtension === '.docx') {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          fileContent = result.value;
          if (result.messages && result.messages.length > 0) {
            console.warn("Mammoth.js messages:", result.messages);
            setFileError("DOCX processed, but there might be minor issues with content extraction. Review carefully.");
          }
        } else if (fileExtension === '.pdf') {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n'; // item.str is correct property
          }
          fileContent = fullText;
        } else if (attachOnlyExtensions.includes(fileExtension)) {
          fileContent = `File "${selectedFile.name}" (type: ${fileExtension}) has been uploaded and attached. 
Direct content analysis for this specific Microsoft Office file type is not currently supported in the browser. 
If AI feedback on its content is desired, please summarize key points manually in a text entry, or convert the file to a .txt, .md, .docx, or .pdf format.`;
        } else {
           // Should be caught by handleFileChange, but as a safeguard
          throw new Error(`Unsupported file type for processing: ${fileExtension}`);
        }
        
        onSubmit(fileContent, 'file', selectedFile.name);

      } catch (error: any) {
        console.error('Error processing file:', error);
        setFileError(`Could not process file "${selectedFile.name}". Error: ${error.message || 'Unknown error'}. Please try again or select a different file.`);
        setIsProcessingFile(false);
        return; // Stop submission
      }
      
      // Reset file input state after successful processing
      setSelectedFile(null);
      setFileNameDisplay('');
      const fileInput = document.getElementById('evidenceFile') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setIsProcessingFile(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <fieldset className="mb-4">
        <legend className="block text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base mb-1">Evidence Type</legend>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="inputType"
              value="text"
              checked={inputType === 'text'}
              onChange={() => { setInputType('text'); setFileError(''); setSelectedFile(null); setFileNameDisplay('');}}
              className="form-radio h-4 w-4 text-theme-primary dark:text-dark-theme-primary focus:ring-theme-primary dark:focus:ring-dark-theme-primary"
              disabled={isProcessingFile}
            />
            <span className="text-sm text-theme-text-base dark:text-dark-theme-text-base">Text Entry</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="inputType"
              value="file"
              checked={inputType === 'file'}
              onChange={() => { setInputType('file'); setFileError(''); setTextInput(''); }}
              className="form-radio h-4 w-4 text-theme-primary dark:text-dark-theme-primary focus:ring-theme-primary dark:focus:ring-dark-theme-primary"
              disabled={isProcessingFile}
            />
            <span className="text-sm text-theme-text-base dark:text-dark-theme-text-base">Upload File</span>
          </label>
        </div>
      </fieldset>

      {inputType === 'text' && (
        <div>
          <label htmlFor="evidenceContent" className="block text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base mb-1">
            Evidence Details (Narrative)
          </label>
          <textarea
            id="evidenceContent"
            rows={6}
            className="shadow-sm focus:ring-theme-primary dark:focus:ring-dark-theme-primary focus:border-theme-primary dark:focus:border-dark-theme-primary mt-1 block w-full sm:text-sm bg-theme-bg-base dark:bg-dark-theme-bg-base border-theme-border dark:border-dark-theme-border rounded-md p-2 placeholder-theme-text-muted dark:placeholder-dark-theme-text-muted text-theme-text-base dark:text-dark-theme-text-base"
            placeholder="Describe your experience, actions, and outcomes related to this competency. Use 'I' statements to highlight your personal contribution."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={isProcessingFile}
          />
          <p className="mt-1 text-xs text-theme-text-muted dark:text-dark-theme-text-muted">Clearly explain your role, the scale/complexity of the task, and the results achieved.</p>
        </div>
      )}

      {inputType === 'file' && (
        <div>
          <label htmlFor="evidenceFile" className="block text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base mb-1">
            Select File
          </label>
          <input
            type="file"
            id="evidenceFile"
            accept={acceptAttributeValue}
            onChange={handleFileChange}
            className="block w-full text-sm text-theme-text-muted dark:text-dark-theme-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-theme-primary/10 dark:file:bg-dark-theme-primary/10 file:text-theme-primary dark:file:text-dark-theme-primary hover:file:bg-theme-primary/20 dark:hover:file:bg-dark-theme-primary/20"
            disabled={isProcessingFile}
          />
          {fileNameDisplay && <p className="mt-1 text-xs text-theme-text-muted dark:text-dark-theme-text-muted">Selected: {fileNameDisplay}</p>}
           <p className="mt-1 text-xs text-theme-text-muted dark:text-dark-theme-text-muted">
            You can upload: <strong>{allAcceptedExtensions.join(', ')}</strong>.<br/>
            - For <strong>{contentProcessableExtensions.join(', ')}</strong>: Content will be extracted for AI analysis.<br/>
            - For <strong>{attachOnlyExtensions.join(', ')}</strong>: These are attached as evidence, but content isn't AI analyzed. Consider summarizing key points or converting the file for AI feedback.
          </p>
        </div>
      )}
      
      {isProcessingFile && <LoadingSpinner text="Processing file..." size="sm" />}
      {fileError && <p className="text-sm text-red-600 dark:text-dark-theme-accent-red mt-2">{fileError}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isProcessingFile || (inputType === 'file' && !selectedFile && !fileNameDisplay) }
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-theme-primary dark:bg-dark-theme-primary hover:bg-theme-primary/80 dark:hover:bg-dark-theme-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-dark-theme-primary disabled:opacity-50"
        >
          <Icon name="plus" className="w-5 h-5 mr-2" />
          {isProcessingFile ? 'Processing...' : 'Add Evidence & Get AI Feedback'}
        </button>
      </div>
    </form>
  );
};

export default EvidenceForm;
