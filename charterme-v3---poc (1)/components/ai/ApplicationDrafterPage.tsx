import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { UK_SPEC_COMPETENCIES, COMPETENCY_AREAS } from '../../constants';
import { EvidenceItem, CompetencyAreaCode } from '../../types';
import { draftApplicationSectionWithGemini } from '../../services/geminiService';
import PageTitle from '../core/PageTitle';
import LoadingSpinner from '../core/LoadingSpinner';
import Icon from '../core/Icon';

const ApplicationDrafterPage: React.FC = () => {
  const { currentUser, getEvidenceForSubCompetency } = useAuth();
  const [selectedArea, setSelectedArea] = useState<CompetencyAreaCode | ''>('');
  const [draftContent, setDraftContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const handleDraftGeneration = async () => {
    if (!selectedArea || !currentUser) {
      setError("Please select a competency area.");
      return;
    }
    setError('');
    setIsLoading(true);
    setDraftContent('');
    setIsCopied(false); // Reset copied state

    const relevantSubCompetencies = UK_SPEC_COMPETENCIES.filter(
      sc => sc.Competency_Area_Code === selectedArea
    );

    const evidenceForArea: EvidenceItem[] = relevantSubCompetencies.reduce((acc, sc) => {
      const items = getEvidenceForSubCompetency(sc.Sub_Competency_Code);
      return acc.concat(items.filter(item => item.ragStatus === 'Green' || item.ragStatus === 'Amber'));
    }, [] as EvidenceItem[]);

    if (evidenceForArea.length === 0) {
      setDraftContent(`No 'Green' or 'Amber' rated evidence found for Competency Area ${selectedArea}. Please add and get feedback on relevant evidence first.`);
      setIsLoading(false);
      return;
    }
    
    const competencyAreaDetails = COMPETENCY_AREAS.find(ca => ca.code === selectedArea);

    try {
      const representativeSubCode = relevantSubCompetencies.length > 0 ? relevantSubCompetencies[0].Sub_Competency_Code : selectedArea;
      const draft = await draftApplicationSectionWithGemini(
        competencyAreaDetails?.title || `Area ${selectedArea}`,
        representativeSubCode,
        evidenceForArea
      );
      setDraftContent(draft);
    } catch (err) {
      console.error("Error generating draft:", err);
      setError("Failed to generate draft. Please try again.");
      setDraftContent("An error occurred while generating the draft.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!draftContent) return;
    // Create a temporary element to parse the HTML
    const tempElement = document.createElement('div');
    tempElement.innerHTML = draftContent;
    // Get the text content, which strips HTML tags
    navigator.clipboard.writeText(tempElement.textContent || tempElement.innerText || "")
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500); // Revert after 2.5 seconds
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
        setError("Failed to copy text to clipboard.");
      });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageTitle title="AI-Assisted Application Drafter" subtitle="Generate initial drafts for your CEng report sections based on your validated evidence." />

      <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-xl">
        <div className="mb-6 md:flex md:items-end md:space-x-4">
          <div className="flex-grow mb-4 md:mb-0">
            <label htmlFor="competencyArea" className="block text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base mb-1">
              Select Competency Area to Draft
            </label>
            <select
              id="competencyArea"
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value as CompetencyAreaCode | '');
                setDraftContent(''); // Clear previous draft when area changes
                setIsCopied(false); // Reset copied state
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base bg-theme-bg-muted dark:bg-dark-theme-bg-muted border-theme-border dark:border-dark-theme-border text-theme-text-base dark:text-dark-theme-text-base focus:outline-none focus:ring-theme-primary dark:focus:ring-dark-theme-primary focus:border-theme-primary dark:focus:border-dark-theme-primary sm:text-sm rounded-md shadow-sm"
            >
              <option value="">-- Select an Area --</option>
              {COMPETENCY_AREAS.map(area => (
                <option key={area.code} value={area.code}>
                  Area {area.code}: {area.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleDraftGeneration}
            disabled={isLoading || !selectedArea}
            className="w-full md:w-auto flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-theme-primary dark:bg-dark-theme-primary hover:bg-theme-primary/80 dark:hover:bg-dark-theme-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-dark-theme-primary disabled:bg-theme-bg-muted dark:disabled:bg-dark-theme-bg-muted disabled:text-theme-text-muted dark:disabled:text-dark-theme-text-muted"
          >
            <Icon name="draft" className="w-5 h-5 mr-2" />
            {isLoading ? 'Generating...' : 'Generate Draft Section'}
          </button>
        </div>

        {error && <p className="text-red-600 dark:text-dark-theme-accent-red bg-red-100 dark:bg-dark-theme-accent-red/10 p-3 rounded-md mb-4">{error}</p>}

        {isLoading && <LoadingSpinner text="AI is drafting your section..." />}

        {draftContent && !isLoading && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base mb-3">Generated Draft:</h3>
            <div 
              className="bg-theme-bg-muted dark:bg-dark-theme-bg-muted p-4 border border-theme-border dark:border-dark-theme-border rounded-md min-h-[200px] whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: draftContent }}
            />
            <p className="mt-3 text-xs text-theme-text-muted dark:text-dark-theme-text-muted">
              <strong>Note:</strong> This is an AI-generated draft. Review it carefully, add your personal reflections, ensure accuracy, and elaborate on context and outcomes. You have full control to edit this content.
            </p>
             <button
                onClick={handleCopyToClipboard}
                className="mt-4 px-4 py-2 flex items-center justify-center bg-theme-secondary dark:bg-dark-theme-secondary hover:bg-theme-secondary/80 dark:hover:bg-dark-theme-secondary/80 text-white text-sm font-medium rounded-md shadow-sm transition-all duration-150 ease-in-out"
              >
                <Icon name={isCopied ? "check" : "copy"} className="w-5 h-5 mr-2" />
                {isCopied ? 'Copied!' : 'Copy Draft Text'}
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDrafterPage;
