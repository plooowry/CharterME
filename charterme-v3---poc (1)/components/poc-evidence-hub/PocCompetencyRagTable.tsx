import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { POC_COMPETENCIES, PocRAGStatus, POC_RAG_CLASSES } from '../../constants';
import { PocCompetency } from '../../types';

const PocCompetencyRagTable: React.FC = () => {
  const { pocEvidenceFiles, pocEvidenceVersion } = useAuth(); // pocEvidenceVersion to trigger re-render

  const getCompetencyRAGStatus = (competency: PocCompetency): PocRAGStatus => {
    const isGreen = pocEvidenceFiles.some(file => file.associatedCompetencyIds.includes(competency.id));
    if (isGreen) return PocRAGStatus.Green;
    if (competency.isAmberByDefault) return PocRAGStatus.Amber;
    return PocRAGStatus.Red;
  };

  // Recompute RAG statuses when pocEvidenceFiles or pocEvidenceVersion changes
  const competencyStatuses = React.useMemo(() => {
    return POC_COMPETENCIES.map(comp => ({
      ...comp,
      ragStatus: getCompetencyRAGStatus(comp),
    }));
  }, [pocEvidenceFiles, pocEvidenceVersion]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-theme-border dark:divide-dark-theme-border bg-theme-bg-surface dark:bg-dark-theme-bg-surface">
        <thead className="bg-theme-bg-muted dark:bg-dark-theme-bg-muted">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted dark:text-dark-theme-text-muted uppercase tracking-wider">
              Competency
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted dark:text-dark-theme-text-muted uppercase tracking-wider">
              Description
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-text-muted dark:text-dark-theme-text-muted uppercase tracking-wider">
              RAG Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-theme-border dark:divide-dark-theme-border">
          {competencyStatuses.map((comp) => {
            const ragClasses = POC_RAG_CLASSES[comp.ragStatus];
            return (
              <tr key={comp.id} className="hover:bg-theme-bg-hover/50 dark:hover:bg-dark-theme-bg-hover/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base">
                  {comp.title}
                </td>
                <td className="px-6 py-4 whitespace-normal text-xs text-theme-text-muted dark:text-dark-theme-text-muted">
                  {comp.description || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${ragClasses.dot}`}></span>
                    <span className={`${ragClasses.text} font-semibold`}>{comp.ragStatus}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PocCompetencyRagTable;