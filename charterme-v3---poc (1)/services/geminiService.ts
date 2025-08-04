import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UKSpecSubCompetency, EvidenceItem, RAGStatus, ChatMessage, StoredUserEvidence, CompetencyAreaCode } from '../types';
import { GEMINI_API_KEY, GEMINI_TEXT_MODEL, COMPETENCY_AREAS, UK_SPEC_COMPETENCIES } from "../constants";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface AnalysisResponse {
  ragStatus: RAGStatus;
  feedback: string;
}

// Standard classes for AI-suggested placeholders
const ELABORATE_PLACEHOLDER_CLASS = "font-semibold text-indigo-600 dark:text-indigo-400";
// Standard classes for "More information needed" placeholders
const MORE_INFO_PLACEHOLDER_CLASS = "font-semibold text-amber-600 dark:text-amber-400";

function parseGeminiJsonResponse<T,>(jsonString: string): T | null {
  let cleanJsonString = jsonString.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
  const match = cleanJsonString.match(fenceRegex);
  if (match && match[2]) {
    cleanJsonString = match[2].trim();
  }

  try {
    return JSON.parse(cleanJsonString) as T;
  } catch (error) {
    console.error("Failed to parse JSON response from Gemini:", error);
    console.error("Original string from Gemini:", jsonString);
    if (cleanJsonString.startsWith("{") && !cleanJsonString.endsWith("}")) {
        const lastBracket = cleanJsonString.lastIndexOf("}");
        if (lastBracket > -1) {
            try {
                 return JSON.parse(cleanJsonString.substring(0, lastBracket + 1)) as T;
            } catch (e) {
                // ignore
            }
        }
    }
    return null;
  }
}

function styleElaborationPlaceholders(text: string): string {
  const placeholderRegex = /\[(.*?)\]/g;
  return text.replace(placeholderRegex, (match, p1) => {
    return `<span class="${ELABORATE_PLACEHOLDER_CLASS}">[${p1.trim()}]</span>`;
  });
}


export const analyzeEvidenceWithGemini = async (
  evidenceText: string,
  competency: UKSpecSubCompetency,
  fileName?: string
): Promise<AnalysisResponse> => {
  const evidencePreamble = fileName
    ? `User's Evidence (from file: ${fileName}):`
    : `User's Evidence:`;

  const prompt = `
    You are an AI assistant evaluating evidence for a Chartered Engineer (CEng) application against UK-SPEC.
    The user is providing evidence for the following sub-competency:
    Code: ${competency.Sub_Competency_Code}
    Title: ${competency.Sub_Competency_Title}
    Description: ${competency.Sub_Competency_Full_Description}
    Illustrative Keywords: ${competency.Illustrative_Examples_Keywords}

    ${evidencePreamble}
    "${evidenceText}"

    Based *only* on the provided evidence and its alignment with the specific sub-competency requirements, provide:
    1. A RAG status: "Green" (strong alignment, clear personal contribution to significant tasks), "Amber" (partial alignment, lacks detail, insufficient scale/complexity, or generic), or "Red" (little/no alignment, irrelevant).
    2. Brief, actionable feedback (max 50 words) explaining the RAG status and suggesting specific improvements if Amber or Red. Focus on what's missing or needs clarification in relation to the competency.

    Respond strictly in JSON format like this:
    {
      "ragStatus": "Green",
      "feedback": "Your feedback here."
    }
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: [{ role: "user", parts: [{text: prompt}] }],
        config: {
            responseMimeType: "application/json",
            temperature: 0.3, 
        }
    });
    
    const rawJson = response.text;
    const parsed = parseGeminiJsonResponse<AnalysisResponse>(rawJson);

    if (parsed && Object.values(RAGStatus).includes(parsed.ragStatus as RAGStatus)) {
      return parsed;
    } else {
      console.warn("Gemini response was not valid JSON or ragStatus was incorrect. Raw:", rawJson, "Parsed:", parsed);
      let status = RAGStatus.Amber;
      let fb = "AI analysis issue. Could not parse response. Please try rephrasing evidence.";
      if (rawJson.toLowerCase().includes("green")) status = RAGStatus.Green;
      else if (rawJson.toLowerCase().includes("red")) status = RAGStatus.Red;
      
      if (parsed?.feedback) {
        fb = parsed.feedback;
      } else {
        const feedbackMatch = rawJson.match(/"feedback"\s*:\s*"(.*?)"/);
        if (feedbackMatch && feedbackMatch[1]) {
          fb = feedbackMatch[1];
        } else if (rawJson.length < 150 && !rawJson.includes("{")) {
             fb = rawJson;
        }
      }
      
      return { ragStatus: status, feedback: fb };
    }
  } catch (error) {
    console.error("Error calling Gemini API for evidence analysis:", error);
    return {
      ragStatus: RAGStatus.Red,
      feedback: "Error analyzing evidence with AI. Please check your connection or try again later.",
    };
  }
};

export const draftApplicationSectionWithGemini = async (
  competencyAreaTitle: string,
  subCompetencyCode: string, // Representative sub-competency code for the area
  evidenceItems: EvidenceItem[]
): Promise<string> => {
  if (evidenceItems.length === 0) {
    return "No evidence provided for this section.";
  }

  const evidenceSummary = evidenceItems
    .map(
      (e, idx) => {
        const fileInfo = e.type === 'file' && e.fileName ? ` (from file: ${e.fileName})` : '';
        return `Evidence ${idx + 1} (for ${e.subCompetencyCode})${fileInfo}:\n${e.content}\nAI Feedback received: ${e.ragStatus} - ${e.aiFeedback || 'N/A'}\n`;
      }
    )
    .join("\n");

  const prompt = `
    You are an AI assistant helping a UK engineer draft a section of their Chartered Engineer (CEng) Professional Review Report.
    This section is for Competency Area: "${competencyAreaTitle}", primarily focusing on evidence related to sub-competency codes like "${subCompetencyCode}".

    Here is the user's validated evidence (rated Green or Amber) for this area:
    ${evidenceSummary}

    Your task is to:
    1. Weave the provided evidence into a coherent narrative covering the competency area.
    2. Structure the narrative logically, perhaps by project or theme, highlighting alignment with various sub-competencies within this area.
    3. Emphasize the user's personal contributions using "I" statements (e.g., "I designed," "I managed," "I analyzed").
    4. Where appropriate, insert placeholders like "[Elaborate on your specific role in Project X, detailing challenges and outcomes]" or "[Reflect on what you learned from this experience and how it demonstrated Y competency]" to prompt the user to add crucial personal context, reflection, and details about scale/complexity. These placeholders MUST be enclosed in square brackets.
    5. Maintain a professional and formal tone suitable for a CEng application.
    6. Do NOT invent new evidence. Stick to what is provided.
    7. The output should be ready for the user to copy, paste, and further refine. Do not include this instruction preamble in the output.

    Draft the report section now:
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: [{ role: "user", parts: [{text: prompt}] }],
        config: {
            temperature: 0.6, 
        }
    });
    
    return styleElaborationPlaceholders(response.text);
  } catch (error) {
    console.error("Error calling Gemini API for application drafting:", error);
    return "Error generating draft content with AI. Please try again later.";
  }
};


export const draftFullCompetencyAreaWithGemini = async (
  area: { code: CompetencyAreaCode; title: string },
  subCompetenciesInArea: UKSpecSubCompetency[],
  allUserEvidence: StoredUserEvidence
): Promise<string> => {
  
  let subCompetenciesDataString = "";
  for (const sc of subCompetenciesInArea) {
    subCompetenciesDataString += `\n\n### Sub-Competency ${sc.Sub_Competency_Code}: ${sc.Sub_Competency_Title}\nDescription: ${sc.Sub_Competency_Full_Description}\n`;
    
    const items = allUserEvidence[sc.Sub_Competency_Code] || [];
    const goodEvidenceItems = items.filter(item => item.ragStatus === RAGStatus.Green || item.ragStatus === RAGStatus.Amber);

    if (goodEvidenceItems.length > 0) {
      const evidenceSummary = goodEvidenceItems
        .map((e, idx) => {
          const fileInfo = e.type === 'file' && e.fileName ? ` (from file: ${e.fileName})` : '';
          return `Evidence Piece ${idx + 1}${fileInfo}:\n${e.content}\n(Original AI Feedback: ${e.ragStatus} - ${e.aiFeedback || 'N/A'})`;
        })
        .join("\n---\n");
      subCompetenciesDataString += `User's Evidence for ${sc.Sub_Competency_Code}:\n${evidenceSummary}\n`;
    } else {
      // Instruct AI to place the specific placeholder for this sub-competency
      const placeholderHtml = `<p><span class="${MORE_INFO_PLACEHOLDER_CLASS}">[More information is needed for ${sc.Sub_Competency_Code}: ${sc.Sub_Competency_Title}]</span></p>`;
      subCompetenciesDataString += `INSTRUCTION_FOR_AI: For sub-competency ${sc.Sub_Competency_Code}, no sufficient (Green/Amber) evidence was found by the system. You MUST include the following text verbatim as its section: "${placeholderHtml}"\n`;
    }
  }

  const prompt = `
    You are an AI assistant helping a UK engineer draft a section of their Chartered Engineer (CEng) Professional Review Report for Competency Area: "${area.title} (${area.code})".

    Your task is to generate a narrative for this entire competency area. Structure your response with clear headings or delineations for each sub-competency.
    
    For each sub-competency detailed below:
    1.  If user's evidence is provided: Weave it into a coherent narrative. Emphasize personal contributions ("I designed," "I managed"). Include placeholders like "[Elaborate on specific project details or outcomes]" where the user should add more depth. These placeholders MUST be enclosed in square brackets.
    2.  If an "INSTRUCTION_FOR_AI" is present for a sub-competency stating to include specific text verbatim: You MUST follow that instruction exactly and include the specified HTML placeholder text for that sub-competency's section. Do not attempt to draft content for it or summarize the instruction.
    3.  Maintain a professional and formal tone. Do NOT invent new evidence.
    4.  The output should be a continuous piece of text for the entire Area ${area.code}, ready for the user. Do not include this preamble or any section titles like "Draft for Area X:" in your final response. Just provide the draft itself.

    ---
    Sub-Competencies and Evidence for Area ${area.code}:${subCompetenciesDataString}
    ---

    Begin drafting the content for Competency Area ${area.code}:
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: [{ role: "user", parts: [{text: prompt}] }],
        config: {
            temperature: 0.65, 
        }
    });
    
    // Style any [elaborate] placeholders AI might have added
    return styleElaborationPlaceholders(response.text);
  } catch (error) {
    console.error(`Error calling Gemini API for drafting Area ${area.code}:`, error);
    return `<p>Error generating draft content for Area ${area.code} with AI. Please try again later.</p>`;
  }
};
