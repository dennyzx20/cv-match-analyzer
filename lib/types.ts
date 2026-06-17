export type AtsRiskLevel = "Low" | "Medium" | "High";
export type LanguageCode = "it" | "en";

export type CvAnalysisResult = {
  overallMatchScore: number;
  shortSummary: string;
  missingKeywords: string[];
  matchingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestedCvImprovements: string[];
  rewrittenProfessionalSummary: string;
  recommendedSkillsToAdd: string[];
  atsRiskLevel: AtsRiskLevel;
  finalRecommendation: string;
};

export type LeadCapture = {
  email: string;
  sendReportByEmail: boolean;
};

export type AnalyzeResponse = {
  analysis?: CvAnalysisResult;
  detectedLanguage?: LanguageCode;
  error?: string;
};
