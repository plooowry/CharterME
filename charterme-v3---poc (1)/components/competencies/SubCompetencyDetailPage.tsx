
import React, { useState, useEffect, useMemo } from 'react'; 
import { useParams } from 'react-router-dom';
import { UK_SPEC_COMPETENCIES } from '../../constants';
import { EvidenceItem, RAGStatus, UKSpecSubCompetency } from '../../types';
import { useAuth } from '../auth/AuthContext';
import EvidenceForm from '../evidence/EvidenceForm';
import EvidenceList from '../evidence/EvidenceList';
import { analyzeEvidenceWithGemini } from '../../services/geminiService';
import LoadingSpinner from '../core/LoadingSpinner';
import Icon from '../core/Icon';

const SubCompetencyDetailPage: React.FC = () => {
  const { subCode } = useParams<{ subCode: string }>();
  // Removed deleteEvidenceItem from useAuth destructuring
  const { currentUser, evidence, evidenceVersion, addEvidenceItem, updateEvidenceItemRAG } = useAuth(); 
  
  const [competency, setCompetency] = useState<UKSpecSubCompetency | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);

  useEffect(() => {
    const foundCompetency = UK_SPEC_COMPETENCIES.find(c => c.Sub_Competency_Code === subCode) || null;
    setCompetency(foundCompetency);
    if (foundCompetency && currentUser) {
      setShowEvidenceForm(false); 
    }
  }, [subCode, currentUser]);

  const handleAddEvidence = async (textOrFileContent: string, type: 'text' | 'file', fileName?: string) => {
    if (!competency || !currentUser) return;

    const newEvidenceItem: EvidenceItem = {
      id: `eid-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      subCompetencyCode: competency.Sub_Competency_Code,
      userId: currentUser.id,
      type,
      content: textOrFileContent,
      fileName: fileName,
      ragStatus: RAGStatus.NotAssessed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addEvidenceItem(newEvidenceItem); 
    setShowEvidenceForm(false);

    setIsLoadingAi(true);
    try {
      const analysis = await analyzeEvidenceWithGemini(newEvidenceItem.content, competency, newEvidenceItem.fileName);
      await updateEvidenceItemRAG(newEvidenceItem.id, competency.Sub_Competency_Code, analysis.ragStatus, analysis.feedback);
    } catch (error) {
      console.error("Error during AI analysis:", error);
      await updateEvidenceItemRAG(newEvidenceItem.id, competency.Sub_Competency_Code, RAGStatus.Red, "Error during AI analysis. Please try again.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  // handleDeleteEvidence function removed

  const currentEvidenceItems = useMemo(() => {
    if (!competency || !evidence) return []; 
    return evidence[competency.Sub_Competency_Code] || [];
  }, [evidence, competency, evidenceVersion]);

  if (!competency) {
    return (
      <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-lg text-center">
        <Icon name="info" className="w-12 h-12 text-theme-primary dark:text-dark-theme-primary mx-auto mb-4" />
        <p className="text-theme-text-muted dark:text-dark-theme-text-muted">Sub-competency not found or invalid code.</p>
        <p className="text-sm text-theme-text-muted dark:text-dark-theme-text-muted">Please select a valid sub-competency from the navigator.</p>
      </div>
    );
  }

  return (
    <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-lg">
      <div className="mb-6 pb-4 border-b border-theme-border dark:border-dark-theme-border">
        <p className="text-sm text-theme-primary dark:text-dark-theme-primary font-semibold">
          Area {competency.Competency_Area_Code}: {competency.Competency_Area_Title}
        </p>
      </div>
      
      <div className="mb-6 prose prose-sm max-w-none dark:prose-invert">
        <h4 className="font-semibold text-theme-text-base dark:text-dark-theme-text-base">Full Description:</h4>
        <p className="text-theme-text-muted dark:text-dark-theme-text-muted">{competency.Sub_Competency_Full_Description}</p>
      </div>

      <div className="mb-8 p-4 bg-theme-primary/10 dark:bg-dark-theme-primary/10 border border-theme-primary/30 dark:border-dark-theme-primary/30 rounded-md">
        <h4 className="font-semibold text-theme-text-base dark:text-dark-theme-text-base mb-2">Illustrative Examples & Keywords:</h4>
        <p className="text-sm text-theme-text-muted dark:text-dark-theme-text-muted leading-relaxed">{competency.Illustrative_Examples_Keywords.split(',').map(k => k.trim()).join(' • ')}</p>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base">Your Evidence</h3>
            <button
            onClick={() => setShowEvidenceForm(!showEvidenceForm)}
            className="flex items-center px-4 py-2 bg-theme-secondary dark:bg-dark-theme-secondary hover:bg-theme-secondary/80 dark:hover:bg-dark-theme-secondary/80 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
            <Icon name="plus" className="w-5 h-5 mr-2" />
            {showEvidenceForm ? 'Cancel' : 'Add New Evidence'}
            </button>
        </div>

        {isLoadingAi && <LoadingSpinner text="AI is analyzing your evidence..." size="sm" />}

        {showEvidenceForm && (
            <div className="my-4 p-4 border border-theme-border dark:border-dark-theme-border rounded-lg bg-theme-bg-muted dark:bg-dark-theme-bg-muted">
                 <EvidenceForm onSubmit={handleAddEvidence} />
            </div>
        )}
        
        <EvidenceList 
            evidenceItems={currentEvidenceItems} 
            competency={competency} 
            // onDeleteEvidence prop passing removed
        />
      </div>
    </div>
  );
};

export default SubCompetencyDetailPage;