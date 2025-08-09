export interface User {
  id: string;
  email: string;
  name?: string;
}

export type CompetencyAreaCode = "A" | "B" | "C" | "D" | "E";

export interface UKSpecSubCompetency {
  Competency_Area_Code: CompetencyAreaCode;
  Competency_Area_Title: string;
  Sub_Competency_Code: string;
  Sub_Competency_Title: string;
  Sub_Competency_Full_Description: string;
  Illustrative_Examples_Keywords: string; // comma-separated
}

export enum RAGStatus {
  Red = "Red",
  Amber = "Amber",
  Green = "Green",
  NotAssessed = "NotAssessed",
}

export interface EvidenceItem {
  id: string;
  subCompetencyCode: string;
  userId: string;
  type: "text" | "file" | "link"; // Simplified
  content: string; // For text type, or file content, or filename/URL
  fileName?: string; // Optional: To store the name of the uploaded file
  justification?: string; // For multi-mapping, not fully implemented in UI
  ragStatus: RAGStatus;
  aiFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileData {
  careerSummary: string;
  targetPEI: string;
}

// For Gemini chat or general messages
export interface ChatMessage {
  role: "user" | "model" | "system";
  parts: { text: string }[];
}

// --- Types for Proof-of-Concept (PoC) Evidence Hub ---
export interface PocCompetency {
    id: string;
    title: string;
    description?: string;
    isAmberByDefault?: boolean;
}

export interface PocEvidenceFile {
  id: string;
  uploadDate: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  associatedCompetencyIds: string[];
  fileDataUrl: string; // Using data URL to store file content for this PoC
}

export interface StoredUserEvidence {
  [subCompetencyCode: string]: EvidenceItem[];
}