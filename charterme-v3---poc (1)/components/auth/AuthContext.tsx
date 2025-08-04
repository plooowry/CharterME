import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ProfileData, StoredUserEvidence, EvidenceItem, RAGStatus, PocEvidenceFile, StoredPocEvidence } from '../../types';

interface AuthContextType {
  currentUser: User | null;
  profile: ProfileData | null;
  evidence: StoredUserEvidence;
  evidenceVersion: number; 
  pocEvidenceFiles: PocEvidenceFile[];
  pocEvidenceVersion: number;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>; 
  logout: () => void;
  updateProfile: (newProfile: ProfileData) => Promise<void>;
  addEvidenceItem: (item: EvidenceItem) => Promise<void>;
  updateEvidenceItemRAG: (itemId: string, subCompetencyCode: string, ragStatus: RAGStatus, aiFeedback?: string) => Promise<void>;
  getEvidenceForSubCompetency: (subCompetencyCode: string) => EvidenceItem[];
  
  // PoC Evidence Hub functions
  addPocEvidenceFile: (fileData: Omit<PocEvidenceFile, 'id' | 'uploadDate'>) => Promise<string>; // Returns new file ID
  deletePocEvidenceFile: (fileId: string) => Promise<void>;
  getPocEvidenceFileById: (fileId: string) => PocEvidenceFile | undefined;
  updatePocFileAssociations: (fileId: string, competencyIds: string[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [evidence, setEvidence] = useState<StoredUserEvidence>({});
  const [evidenceVersion, setEvidenceVersion] = useState<number>(0); 
  const [pocEvidenceFiles, setPocEvidenceFiles] = useState<PocEvidenceFile[]>([]);
  const [pocEvidenceVersion, setPocEvidenceVersion] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const storedProfile = localStorage.getItem('userProfile');
    const storedEvidence = localStorage.getItem('userEvidence');
    const storedPocEvidence = localStorage.getItem('pocUserEvidence');

    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      if (storedProfile) setProfile(JSON.parse(storedProfile));
      if (storedEvidence) setEvidence(JSON.parse(storedEvidence));
      if (storedPocEvidence) {
        const parsedPocEvidence: StoredPocEvidence = JSON.parse(storedPocEvidence);
        setPocEvidenceFiles(parsedPocEvidence.files || []);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _pass: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const user: User = { id: 'user123', email, name: email.split('@')[0] };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));

    const initialProfile: ProfileData = { careerSummary: '', targetPEI: '' };
    setProfile(initialProfile);
    localStorage.setItem('userProfile', JSON.stringify(initialProfile));
    
    const initialEvidence: StoredUserEvidence = {};
    setEvidence(initialEvidence);
    localStorage.setItem('userEvidence', JSON.stringify(initialEvidence));
    setEvidenceVersion(v => v + 1); 

    const initialPocEvidence: StoredPocEvidence = { files: [] };
    setPocEvidenceFiles(initialPocEvidence.files);
    localStorage.setItem('pocUserEvidence', JSON.stringify(initialPocEvidence));
    setPocEvidenceVersion(v => v + 1);

    setLoading(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setProfile(null);
    setEvidence({});
    setPocEvidenceFiles([]);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userEvidence');
    localStorage.removeItem('pocUserEvidence');
    setEvidenceVersion(v => v + 1); 
    setPocEvidenceVersion(v => v + 1);
  };

  const updateProfile = async (newProfile: ProfileData) => {
    setProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };
  
  const addEvidenceItem = async (item: EvidenceItem) => {
    setEvidence(prevEvidence => {
      const competencyEvidence = prevEvidence[item.subCompetencyCode] ? [...prevEvidence[item.subCompetencyCode]] : [];
      const existingItemIndex = competencyEvidence.findIndex(e => e.id === item.id);
      if (existingItemIndex > -1) {
        competencyEvidence[existingItemIndex] = item;
      } else {
        competencyEvidence.push(item);
      }
      const updatedEvidence = { ...prevEvidence, [item.subCompetencyCode]: competencyEvidence };
      localStorage.setItem('userEvidence', JSON.stringify(updatedEvidence));
      setEvidenceVersion(v => v + 1); 
      return updatedEvidence;
    });
  };

  const updateEvidenceItemRAG = async (itemId: string, subCompetencyCode: string, ragStatus: RAGStatus, aiFeedback?: string) => {
     setEvidence(prevEvidence => {
      const competencyEvidence = prevEvidence[subCompetencyCode] ? [...prevEvidence[subCompetencyCode]] : [];
      const itemIndex = competencyEvidence.findIndex(e => e.id === itemId);
      if (itemIndex > -1) {
        competencyEvidence[itemIndex] = {
          ...competencyEvidence[itemIndex],
          ragStatus,
          aiFeedback,
          updatedAt: new Date().toISOString(),
        };
        const updatedEvidence = { ...prevEvidence, [subCompetencyCode]: competencyEvidence };
        localStorage.setItem('userEvidence', JSON.stringify(updatedEvidence));
        setEvidenceVersion(v => v + 1); 
        return updatedEvidence;
      }
      return prevEvidence; 
    });
  };

  const getEvidenceForSubCompetency = (subCompetencyCode: string): EvidenceItem[] => {
    return evidence[subCompetencyCode] || [];
  };

  // PoC Evidence Hub Functions
  const addPocEvidenceFile = async (fileData: Omit<PocEvidenceFile, 'id' | 'uploadDate'>): Promise<string> => {
    const newFileId = `pocfile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const newFile: PocEvidenceFile = {
      ...fileData,
      id: newFileId,
      uploadDate: new Date().toISOString(),
    };
    setPocEvidenceFiles(prevFiles => {
      const updatedFiles = [...prevFiles, newFile];
      localStorage.setItem('pocUserEvidence', JSON.stringify({ files: updatedFiles }));
      setPocEvidenceVersion(v => v + 1);
      return updatedFiles;
    });
    return newFileId;
  };

  const deletePocEvidenceFile = async (fileId: string) => {
    setPocEvidenceFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(f => f.id !== fileId);
      localStorage.setItem('pocUserEvidence', JSON.stringify({ files: updatedFiles }));
      setPocEvidenceVersion(v => v + 1);
      return updatedFiles;
    });
  };

  const getPocEvidenceFileById = (fileId: string): PocEvidenceFile | undefined => {
    return pocEvidenceFiles.find(f => f.id === fileId);
  };
  
  const updatePocFileAssociations = async (fileId: string, competencyIds: string[]) => {
    setPocEvidenceFiles(prevFiles => {
      const updatedFiles = prevFiles.map(f => 
        f.id === fileId ? { ...f, associatedCompetencyIds: competencyIds, uploadDate: new Date().toISOString() } : f
      );
      localStorage.setItem('pocUserEvidence', JSON.stringify({ files: updatedFiles }));
      setPocEvidenceVersion(v => v + 1);
      return updatedFiles;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, profile, evidence, evidenceVersion, pocEvidenceFiles, pocEvidenceVersion, loading, 
      login, logout, updateProfile, 
      addEvidenceItem, updateEvidenceItemRAG, getEvidenceForSubCompetency,
      addPocEvidenceFile, deletePocEvidenceFile, getPocEvidenceFileById, updatePocFileAssociations
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};