import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ProfileData, StoredUserEvidence, EvidenceItem, RAGStatus, PocEvidenceFile } from '../../types';

interface AuthContextType {
  currentUser: User | null;
  profile: ProfileData | null;
  evidence: StoredUserEvidence;
  evidenceVersion: number; 
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>; 
  logout: () => void;
  updateProfile: (newProfile: ProfileData) => Promise<void>;
  addEvidenceItem: (item: EvidenceItem) => Promise<void>;
  updateEvidenceItemRAG: (itemId: string, subCompetencyCode: string, ragStatus: RAGStatus, aiFeedback?: string) => Promise<void>;
  deleteEvidenceItem: (itemId: string, subCompetencyCode: string) => Promise<void>;
  getEvidenceForSubCompetency: (subCompetencyCode: string) => EvidenceItem[];
  // New properties for PoC Evidence Hub
  pocEvidenceFiles: PocEvidenceFile[];
  pocEvidenceVersion: number;
  addPocEvidenceFile: (fileData: Omit<PocEvidenceFile, 'id' | 'uploadDate'>) => Promise<string>;
  deletePocEvidenceFile: (fileId: string) => Promise<void>;
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
      if (storedPocEvidence) setPocEvidenceFiles(JSON.parse(storedPocEvidence));
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

    const initialPocEvidence: PocEvidenceFile[] = [];
    setPocEvidenceFiles(initialPocEvidence);
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

  const deleteEvidenceItem = async (itemId: string, subCompetencyCode: string) => {
    setEvidence(prevEvidence => {
      const competencyEvidence = prevEvidence[subCompetencyCode] ? [...prevEvidence[subCompetencyCode]] : [];
      const updatedCompetencyEvidence = competencyEvidence.filter(e => e.id !== itemId);
      
      const updatedEvidence = {
        ...prevEvidence,
        [subCompetencyCode]: updatedCompetencyEvidence,
      };

      if (updatedEvidence[subCompetencyCode].length === 0) {
        delete updatedEvidence[subCompetencyCode];
      }

      localStorage.setItem('userEvidence', JSON.stringify(updatedEvidence));
      setEvidenceVersion(v => v + 1);
      return updatedEvidence;
    });
  };

  const getEvidenceForSubCompetency = (subCompetencyCode: string): EvidenceItem[] => {
    return evidence[subCompetencyCode] || [];
  };

  const addPocEvidenceFile = async (fileData: Omit<PocEvidenceFile, 'id' | 'uploadDate'>): Promise<string> => {
    const newFile: PocEvidenceFile = {
      ...fileData,
      id: `poc-file-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      uploadDate: new Date().toISOString(),
    };

    setPocEvidenceFiles(prevFiles => {
      const updatedFiles = [...prevFiles, newFile];
      localStorage.setItem('pocUserEvidence', JSON.stringify(updatedFiles));
      setPocEvidenceVersion(v => v + 1);
      return updatedFiles;
    });
    return newFile.id;
  };

  const deletePocEvidenceFile = async (fileId: string): Promise<void> => {
    setPocEvidenceFiles(prevFiles => {
      const updatedFiles = prevFiles.filter(file => file.id !== fileId);
      localStorage.setItem('pocUserEvidence', JSON.stringify(updatedFiles));
      setPocEvidenceVersion(v => v + 1);
      return updatedFiles;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, profile, evidence, evidenceVersion, loading, 
      login, logout, updateProfile, 
      addEvidenceItem, updateEvidenceItemRAG, getEvidenceForSubCompetency, deleteEvidenceItem,
      pocEvidenceFiles, pocEvidenceVersion, addPocEvidenceFile, deletePocEvidenceFile
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