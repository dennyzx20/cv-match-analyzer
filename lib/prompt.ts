export function buildCvAnalysisPrompt(cvText: string, jobDescription: string) {
  return [
    {
      role: "system" as const,
      content:
        "You are an expert recruiter, resume strategist, and ATS optimization specialist. Always answer in English. Return only valid JSON matching the requested schema. Be concrete, evidence-based, and useful. Do not invent experience that is not present in the CV."
    },
    {
      role: "user" as const,
      content: `
Analyze the CV against the job description as both an experienced recruiter and an ATS-style screening system.

Scoring requirements:
- overallMatchScore must be an integer from 0 to 100.
- Penalize missing must-have skills, seniority mismatch, domain mismatch, vague achievements, and unclear role relevance.
- Reward directly relevant experience, measurable impact, matching tools, matching responsibilities, and strong evidence.
- atsRiskLevel must be "Low", "Medium", or "High".

Quality requirements:
- Be specific to the provided CV and job description.
- Do not give generic resume advice unless it directly applies.
- missingKeywords should include important job keywords not clearly present in the CV.
- matchingKeywords should include relevant keywords found or strongly evidenced in the CV.
- suggestedCvImprovements must be practical edits the candidate can make.
- rewrittenProfessionalSummary must be a polished CV summary aligned to the target job, without fabricating facts.
- recommendedSkillsToAdd must only include skills implied by the job description and not clearly present in the CV.

Return exactly this JSON shape:
{
  "overallMatchScore": 0,
  "shortSummary": "",
  "missingKeywords": [],
  "matchingKeywords": [],
  "strengths": [],
  "weaknesses": [],
  "suggestedCvImprovements": [],
  "rewrittenProfessionalSummary": "",
  "recommendedSkillsToAdd": [],
  "atsRiskLevel": "Low",
  "finalRecommendation": ""
}

CV TEXT:
${cvText}

JOB DESCRIPTION:
${jobDescription}
`
    }
  ];
}
