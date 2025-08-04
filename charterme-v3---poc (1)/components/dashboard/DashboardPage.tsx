import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../auth/AuthContext';
import { UK_SPEC_COMPETENCIES, COMPETENCY_AREAS, RAG_CLASSES } from '../../constants';
import { EvidenceItem, RAGStatus, StoredUserEvidence } from '../../types';
import PageTitle from '../core/PageTitle';
import CompetencyProgressChart from './CompetencyProgressChart';
import Icon from '../core/Icon';
import LoadingSpinner from '../core/LoadingSpinner';
import { draftFullCompetencyAreaWithGemini } from '../../services/geminiService';

const DashboardPage: React.FC = () => {
  const { currentUser, evidence, getEvidenceForSubCompetency } = useAuth();
  const navigate = useNavigate(); 

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [generatedReportContent, setGeneratedReportContent] = useState('');
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isReportCopied, setIsReportCopied] = useState(false);
  
  // Memoize these derived states to prevent re-computation on every render unless evidence changes
  const [evidenceStats, subCompetenciesWithNoEvidence, totalRedEvidenceItems, isReadyToGenerate] = React.useMemo(() => {
    const stats = COMPETENCY_AREAS.map(area => {
      let greenSubCompetencies = 0;
      let amberSubCompetencies = 0;
      let redSubCompetencies = 0;
      let notAssessedSubCompetencies = 0;
      let totalSubCompetenciesInArea = 0;

      UK_SPEC_COMPETENCIES.filter(sc => sc.Competency_Area_Code === area.code).forEach(subCompetency => {
        totalSubCompetenciesInArea++;
        const items = getEvidenceForSubCompetency(subCompetency.Sub_Competency_Code);
        
        if (items.length === 0) {
          notAssessedSubCompetencies++;
        } else {
          const hasRed = items.some(item => item.ragStatus === RAGStatus.Red);
          const hasGreen = items.some(item => item.ragStatus === RAGStatus.Green);
          const hasAmber = items.some(item => item.ragStatus === RAGStatus.Amber);

          if (hasRed) redSubCompetencies++;
          else if (hasGreen) greenSubCompetencies++;
          else if (hasAmber) amberSubCompetencies++;
          else notAssessedSubCompetencies++;
        }
      });
      return { 
        name: area.code, title: area.title,
        green: greenSubCompetencies, amber: amberSubCompetencies, red: redSubCompetencies,
        notAssessed: notAssessedSubCompetencies, total: totalSubCompetenciesInArea,
      };
    });

    const noEvidenceSubComps = UK_SPEC_COMPETENCIES.filter(sc => getEvidenceForSubCompetency(sc.Sub_Competency_Code).length === 0);
    const redItemsCount = Object.values(evidence).flat().filter(e => e.ragStatus === RAGStatus.Red).length;
    const ready = noEvidenceSubComps.length === 0 && redItemsCount === 0;

    return [stats, noEvidenceSubComps, redItemsCount, ready];
  }, [evidence, getEvidenceForSubCompetency]);


  const totalGreenEvidenceItems = Object.values(evidence).flat().filter(e => e.ragStatus === RAGStatus.Green).length;
  const totalAmberEvidenceItems = Object.values(evidence).flat().filter(e => e.ragStatus === RAGStatus.Amber).length;
  const totalNotAssessedOrNoEvidenceCount = UK_SPEC_COMPETENCIES.filter(sc => {
      const items = getEvidenceForSubCompetency(sc.Sub_Competency_Code);
      return items.length === 0 || items.every(item => item.ragStatus === RAGStatus.NotAssessed);
  }).length;

  const nextSteps = [
    subCompetenciesWithNoEvidence.length > 0 ? `Start by adding evidence for ${subCompetenciesWithNoEvidence.length} remaining sub-competencies.` : null,
    totalRedEvidenceItems > 0 ? "Review and improve evidence marked 'Red'." : null,
    totalAmberEvidenceItems > 0 && totalRedEvidenceItems === 0 && subCompetenciesWithNoEvidence.length === 0 ? "Address feedback for evidence marked 'Amber' to strengthen your application." : null,
    isReadyToGenerate && totalGreenEvidenceItems > 0 ? "Your evidence is looking good! You can now generate a full application draft." : null,
    "Regularly review and update your CPD log (feature coming soon)."
  ].filter(Boolean);


  const fetchFullApplicationReport = async () => {
    if (!currentUser) return;
    setIsLoadingReport(true);
    setGeneratedReportContent('');
    let fullReportHtml = `<h1 class="text-2xl font-bold mb-6 text-theme-text-base dark:text-dark-theme-text-base">Chartered Engineer Application Draft</h1>`;
    fullReportHtml += `<p class="text-sm text-theme-text-muted dark:text-dark-theme-text-muted mb-6">Generated on: ${new Date().toLocaleDateString()}</p>`;
    
    // Provide a snapshot of all evidence to the service function
    const currentEvidenceSnapshot: StoredUserEvidence = JSON.parse(JSON.stringify(evidence));

    for (const area of COMPETENCY_AREAS) {
      fullReportHtml += `<h2 class="text-xl font-semibold mt-8 mb-4 pb-2 border-b border-theme-border dark:border-dark-theme-border text-theme-primary dark:text-dark-theme-primary">Area ${area.code}: ${area.title}</h2>`;
      const subCompetenciesInArea = UK_SPEC_COMPETENCIES.filter(sc => sc.Competency_Area_Code === area.code);
      
      try {
        const areaDraft = await draftFullCompetencyAreaWithGemini(area, subCompetenciesInArea, currentEvidenceSnapshot);
        fullReportHtml += `<div class="prose prose-sm max-w-none dark:prose-invert dark:text-dark-theme-text-base text-theme-text-base">${areaDraft}</div>`;
      } catch (error) {
        console.error(`Error drafting area ${area.code}:`, error);
        fullReportHtml += `<p class="text-red-500 dark:text-dark-theme-accent-red">Error generating draft for Area ${area.code}.</p>`;
      }
    }
    setGeneratedReportContent(fullReportHtml);
    setIsLoadingReport(false);
    setIsReportModalOpen(true);
  };

  const handleGenerateApplicationClick = () => {
    if (isReadyToGenerate) {
      fetchFullApplicationReport();
    } else {
      let message = "You are not quite ready to generate the full application. Please ensure:\n";
      if (subCompetenciesWithNoEvidence.length > 0) {
        message += `- All ${UK_SPEC_COMPETENCIES.length} sub-competencies have at least one piece of evidence submitted.\n  (You still have ${subCompetenciesWithNoEvidence.length} to cover.)\n`;
      }
      if (totalRedEvidenceItems > 0) {
        message += `- No evidence items are marked as 'Red'.\n  (You have ${totalRedEvidenceItems} item(s) to address.)\n`;
      }
      alert(message);
    }
  };
  
  const handleCopyReport = () => {
    if (!generatedReportContent) return;
    const tempElement = document.createElement('div');
    tempElement.innerHTML = generatedReportContent;
    navigator.clipboard.writeText(tempElement.textContent || tempElement.innerText || "")
      .then(() => {
        setIsReportCopied(true);
        setTimeout(() => setIsReportCopied(false), 2500);
      })
      .catch(err => console.error("Failed to copy report: ", err));
  };


  if (!currentUser) {
    return <div className="p-4 text-center">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageTitle title={`Welcome back, ${currentUser.name || currentUser.email}!`} subtitle="Here's an overview of your CEng application progress." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base mb-4">Sub-Competency RAG Status</h3>
          <CompetencyProgressChart data={evidenceStats} />
        </div>

        <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-lg flex flex-col">
          <h3 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base mb-4">Evidence Item Status</h3>
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 bg-green-100 dark:bg-dark-theme-accent-green/20 rounded-lg`}>
              <span className={`text-green-700 dark:text-dark-theme-accent-green font-medium`}>Green Items</span>
              <span className={`px-3 py-1 text-sm font-semibold ${RAG_CLASSES.Green} rounded-full`}>{totalGreenEvidenceItems}</span>
            </div>
            <div className={`flex items-center justify-between p-3 bg-amber-100 dark:bg-dark-theme-accent-amber/20 rounded-lg`}>
              <span className={`text-amber-700 dark:text-dark-theme-accent-amber font-medium`}>Amber Items</span>
              <span className={`px-3 py-1 text-sm font-semibold ${RAG_CLASSES.Amber} rounded-full`}>{totalAmberEvidenceItems}</span>
            </div>
            <div className={`flex items-center justify-between p-3 bg-red-100 dark:bg-dark-theme-accent-red/20 rounded-lg`}>
              <span className={`text-red-700 dark:text-dark-theme-accent-red font-medium`}>Red Items</span>
              <span className={`px-3 py-1 text-sm font-semibold ${RAG_CLASSES.Red} rounded-full`}>{totalRedEvidenceItems}</span>
            </div>
             <div className={`flex items-center justify-between p-3 bg-gray-100 dark:bg-dark-theme-bg-muted/50 rounded-lg`}>
              <span className={`text-gray-600 dark:text-dark-theme-text-muted font-medium`}>Not Assessed / No Evidence (Sub-Comp.)</span>
              <span className={`px-3 py-1 text-sm font-semibold ${RAG_CLASSES.NotAssessed} rounded-full`}>{totalNotAssessedOrNoEvidenceCount}</span>
            </div>
          </div>
          <div className="mt-6 flex-grow flex flex-col justify-end">
            <button
              onClick={handleGenerateApplicationClick}
              disabled={isLoadingReport}
              className={`
                font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out
                text-base flex items-center justify-center w-full
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${isReadyToGenerate && !isLoadingReport
                  ? 'bg-theme-accent-green dark:bg-dark-theme-accent-green text-white hover:bg-green-700 dark:hover:bg-green-400 focus:ring-theme-accent-green dark:focus:ring-dark-theme-accent-green' 
                  : 'bg-theme-bg-muted dark:bg-dark-theme-bg-muted text-theme-text-muted dark:text-dark-theme-text-muted border border-theme-border dark:border-dark-theme-border cursor-pointer hover:bg-theme-bg-hover dark:hover:bg-dark-theme-bg-hover focus:ring-gray-400 dark:focus:ring-gray-500 disabled:opacity-70'
                }
              `}
            >
              {isLoadingReport ? <LoadingSpinner size="sm" /> : <Icon name="draft" className="w-5 h-5 mr-2.5" />}
              {isLoadingReport ? 'Generating Report...' : 'Generate CEng Application'}
            </button>
            {!isReadyToGenerate && !isLoadingReport && (
                <p className="text-xs text-theme-text-muted dark:text-dark-theme-text-muted mt-2 text-center">
                    { subCompetenciesWithNoEvidence.length > 0 && `Cover ${subCompetenciesWithNoEvidence.length} more sub-competencies. `}
                    { totalRedEvidenceItems > 0 && `Address ${totalRedEvidenceItems} 'Red' item(s). `}
                </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base mb-4">Recommended Next Steps</h3>
          {nextSteps.length > 0 ? (
            <ul className="space-y-3">
              {nextSteps.slice(0, 4).map((step, index) => (
                <li key={index} className="flex items-start">
                  <Icon name="chevronRight" className="w-5 h-5 text-theme-link-text dark:text-dark-theme-link-text mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-theme-text-muted dark:text-dark-theme-text-muted">{step}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-theme-text-muted dark:text-dark-theme-text-muted">Great progress! Keep up the good work.</p>
          )}
        </div>

        <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base mb-4">Quick Links</h3>
          <div className="space-y-3">
            <Link to="/competencies" className="block text-theme-link-text dark:text-dark-theme-link-text hover:underline font-medium flex items-center">
              <Icon name="competencies" className="w-5 h-5 mr-2" /> Go to Competency Navigator
            </Link>
            <Link to="/draft-application" className="block text-theme-link-text dark:text-dark-theme-link-text hover:underline font-medium flex items-center">
              <Icon name="draft" className="w-5 h-5 mr-2" /> Start Drafting Sections
            </Link>
            <Link to="/resources" className="block text-theme-link-text dark:text-dark-theme-link-text hover:underline font-medium flex items-center">
              <Icon name="resources" className="w-5 h-5 mr-2" /> Visit Resource Hub
            </Link>
          </div>
        </div>
      </div>

      {/* Full Application Report Modal */}
      {isReportModalOpen && (
        <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 overflow-y-auto h-full w-full flex items-center justify-center z-[100]"
            onClick={() => setIsReportModalOpen(false)}
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
          <div 
            className="relative bg-theme-bg-surface dark:bg-dark-theme-bg-surface rounded-lg shadow-xl p-6 md:p-8 w-full max-w-3xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()} // Prevent click inside modal from closing it
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-theme-border dark:border-dark-theme-border">
              <h2 id="modal-title" className="text-2xl font-semibold text-theme-text-base dark:text-dark-theme-text-base">
                Generated CEng Application Draft
              </h2>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-full text-theme-text-muted dark:text-dark-theme-text-muted hover:bg-theme-bg-hover dark:hover:bg-dark-theme-bg-hover focus:outline-none focus:ring-2 focus:ring-theme-primary"
                aria-label="Close modal"
              >
                <Icon name="close" className="w-6 h-6" />
              </button>
            </div>

            {isLoadingReport && <LoadingSpinner text="Generating full report..." />}
            
            {!isLoadingReport && generatedReportContent && (
              <div className="overflow-y-auto flex-grow pr-2">
                <div 
                  dangerouslySetInnerHTML={{ __html: generatedReportContent }} 
                  className="prose prose-sm max-w-none dark:prose-invert text-theme-text-base dark:text-dark-theme-text-base selection:bg-theme-primary/30 dark:selection:bg-dark-theme-primary/30"
                />
              </div>
            )}
            {!isLoadingReport && !generatedReportContent && (
                 <p className="text-theme-text-muted dark:text-dark-theme-text-muted">Could not generate report content.</p>
            )}
            
            {!isLoadingReport && (
                <div className="mt-6 pt-4 border-t border-theme-border dark:border-dark-theme-border flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                        onClick={handleCopyReport}
                        className="px-4 py-2 flex items-center justify-center text-sm font-medium rounded-md shadow-sm bg-theme-secondary dark:bg-dark-theme-secondary hover:bg-theme-secondary/80 dark:hover:bg-dark-theme-secondary/80 text-white transition-colors duration-150"
                    >
                        <Icon name={isReportCopied ? "check" : "copy"} className="w-5 h-5 mr-2" />
                        {isReportCopied ? 'Report Copied!' : 'Copy Full Report'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsReportModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium rounded-md shadow-sm border border-theme-border dark:border-dark-theme-border text-theme-text-base dark:text-dark-theme-text-base bg-theme-bg-muted dark:bg-dark-theme-bg-muted hover:bg-theme-bg-hover dark:hover:bg-dark-theme-bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-dark-theme-primary"
                    >
                        Close
                    </button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
