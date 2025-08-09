
import React from 'react';
import { EvidenceItem, UKSpecSubCompetency } from '../../types';
import EvidenceItemDisplay from './EvidenceItem'; 

interface EvidenceListProps {
  evidenceItems: EvidenceItem[];
  competency: UKSpecSubCompetency; 
  onDeleteEvidence: (itemId: string) => void;
}

const EvidenceList: React.FC<EvidenceListProps> = ({ evidenceItems, competency, onDeleteEvidence }) => {
  if (!evidenceItems || evidenceItems.length === 0) {
    return <p className="text-gray-500 text-sm italic text-center py-4">No evidence submitted yet for this sub-competency.</p>;
  }

  // Sort by newest first
  const sortedEvidence = [...evidenceItems].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4 mt-4">
      {sortedEvidence.map((item) => (
        <EvidenceItemDisplay 
            key={item.id} 
            evidenceItem={item} 
            competency={competency} 
            onDeleteEvidence={onDeleteEvidence}
        />
      ))}
    </div>
  );
};

export default EvidenceList;