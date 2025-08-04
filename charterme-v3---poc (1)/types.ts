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

export interface StoredUserEvidence {
  [subCompetencyCode: string]: EvidenceItem[];
}

// Types for Chartered Evidence Hub PoC
export interface PocCompetency {
  id: string;
  title: string;
  description?: string; // Optional brief description
  isAmberByDefault?: boolean; // For PoC RAG status logic
}

export interface PocEvidenceFile {
  id: string;
  fileName: string;
  fileType: string; // MIME type
  fileSize: number;
  uploadDate: string;
  associatedCompetencyIds: string[];
  fileDataUrl: string; // File content as a Data URL for PoC localStorage
}

export interface StoredPocEvidence {
  files: PocEvidenceFile[];
}