import OpenAI from "openai";
import { buildCvAnalysisPrompt } from "@/lib/prompt";
import type { CvAnalysisResult, LanguageCode } from "@/lib/types";

type AnalyzeInput = {
  cvText: string;
  jobDescription: string;
  language: LanguageCode;
};

const fallbackModel = "gpt-4o-mini";

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

export async function analyzeCvMatch(input: AnalyzeInput): Promise<CvAnalysisResult> {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || fallbackModel;

  const completion = await client.chat.completions.create({
    model,
    messages: buildCvAnalysisPrompt(input.cvText, input.jobDescription, input.language),
    temperature: 0.2,
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response");
  }

  return normalizeAnalysis(JSON.parse(content));
}

function normalizeAnalysis(value: unknown): CvAnalysisResult {
  const input = value as Partial<CvAnalysisResult>;

  return {
    overallMatchScore: clampScore(Number(input.overallMatchScore ?? 0)),
    shortSummary: asString(input.shortSummary),
    missingKeywords: asStringArray(input.missingKeywords),
    matchingKeywords: asStringArray(input.matchingKeywords),
    strengths: asStringArray(input.strengths),
    weaknesses: asStringArray(input.weaknesses),
    suggestedCvImprovements: asStringArray(input.suggestedCvImprovements),
    rewrittenProfessionalSummary: asString(input.rewrittenProfessionalSummary),
    recommendedSkillsToAdd: asStringArray(input.recommendedSkillsToAdd),
    atsRiskLevel:
      input.atsRiskLevel === "Low" || input.atsRiskLevel === "Medium" || input.atsRiskLevel === "High"
        ? input.atsRiskLevel
        : "Medium",
    finalRecommendation: asString(input.finalRecommendation)
  };
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}
