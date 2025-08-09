
import React from 'react';
import { EvidenceItem, RAGStatus, UKSpecSubCompetency } from '../../types';
import { RAG_CLASSES, AI_FEEDBACK_BG_CLASSES, AI_FEEDBACK_TEXT_CLASSES } from '../../constants';
import Icon from '../core/Icon';

interface EvidenceItemDisplayProps {
  evidenceItem: EvidenceItem;
  competency: UKSpecSubCompetency; 
  onDeleteEvidence: (itemId: string) => void;
}

const EvidenceItemDisplay: React.FC<EvidenceItemDisplayProps> = ({ evidenceItem, competency, onDeleteEvidence }) => {
  const ragBadgeClasses = RAG_CLASSES[evidenceItem.ragStatus] || RAG_CLASSES[RAGStatus.NotAssessed];
  
  const feedbackBgClass = AI_FEEDBACK_BG_CLASSES[evidenceItem.ragStatus] || AI_FEEDBACK_BG_CLASSES[RAGStatus.NotAssessed];
  const feedbackTextClass = AI_FEEDBACK_TEXT_CLASSES[evidenceItem.ragStatus] || AI_FEEDBACK_TEXT_CLASSES[RAGStatus.NotAssessed];
  const feedbackOpacityClass = "bg-opacity-80 dark:bg-opacity-80";

  const handleDelete = () => {
    onDeleteEvidence(evidenceItem.id);
  };

  return (
    <div className="bg-theme-bg-muted dark:bg-dark-theme-bg-muted border border-theme-border dark:border-dark-theme-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-2">
        <span className={`px-3 py-1 text-xs font-semibold ${ragBadgeClasses} rounded-full`}>
          {evidenceItem.ragStatus}
        </span>
        <div className="flex items-center space-x-2">
            <span className="text-xs text-theme-text-muted dark:text-dark-theme-text-muted">
            Added: {new Date(evidenceItem.createdAt).toLocaleDateString()}
            {evidenceItem.updatedAt !== evidenceItem.createdAt && ` (Updated: ${new Date(evidenceItem.updatedAt).toLocaleDateString()})`}
            </span>
            <button 
              onClick={handleDelete}
              className="p-1 text-theme-text-muted dark:text-dark-theme-text-muted hover:text-theme-accent-red dark:hover:text-dark-theme-accent-red rounded-full hover:bg-theme-bg-hover dark:hover:bg-dark-theme-bg-hover transition-colors" 
              title="Delete evidence"
            >
              <span className="text-lg leading-none">🗑️</span>
            </button>
        </div>
      </div>

      {evidenceItem.type === 'file' && evidenceItem.fileName && (
        <div className="mb-2 flex items-center text-xs text-theme-text-muted dark:text-dark-theme-text-muted">
          <Icon name="file" className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span>File: {evidenceItem.fileName}</span>
        </div>
      )}
      
      <div className="prose prose-sm max-w-none dark:prose-invert mb-3">
        <p className="text-theme-text-base dark:text-dark-theme-text-base whitespace-pre-wrap">{evidenceItem.content}</p>
      </div>

      {evidenceItem.aiFeedback && (
        <div className={`mt-3 p-3 border-l-4 rounded-r-md ${feedbackBgClass} ${feedbackOpacityClass}`}
        >
          <h5 className={`text-sm font-semibold ${feedbackTextClass} mb-1 flex items-center`}>
            <Icon name="info" className="w-4 h-4 mr-1.5"/>AI Feedback:
          </h5>
          <p className={`text-xs ${feedbackTextClass}`}>{evidenceItem.aiFeedback}</p>
        </div>
      )}
      {evidenceItem.ragStatus === RAGStatus.NotAssessed && !evidenceItem.aiFeedback && (
         <p className="text-xs text-theme-text-muted dark:text-dark-theme-text-muted italic mt-2">AI analysis pending or not yet performed.</p>
      )}
    </div>
  );
};

export default EvidenceItemDisplay;