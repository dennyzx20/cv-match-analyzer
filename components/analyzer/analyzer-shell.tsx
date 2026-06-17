"use client";

import { useState } from "react";
import { AnalyzerForm } from "@/components/analyzer/analyzer-form";
import { AnalysisResults } from "@/components/analyzer/analysis-results";
import { LeadCaptureForm } from "@/components/analyzer/lead-capture-form";
import type { AnalyzeResponse, CvAnalysisResult, LeadCapture } from "@/lib/types";

export function AnalyzerShell() {
  const [analysis, setAnalysis] = useState<CvAnalysisResult | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<CvAnalysisResult | null>(null);
  const [leadCapture, setLeadCapture] = useState<LeadCapture | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAnalyze(file: File, jobDescription: string) {
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("jobDescription", jobDescription);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok || !data.analysis) {
        throw new Error(data.error || "We could not complete the analysis. Please check the CV and try again.");
      }

      setPendingAnalysis(data.analysis);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while analyzing your CV. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleLeadCapture(values: LeadCapture) {
    setLeadCapture(values);
    setAnalysis(pendingAnalysis);
    setPendingAnalysis(null);
  }

  function reset() {
    setAnalysis(null);
    setPendingAnalysis(null);
    setLeadCapture(null);
    setError("");
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">CV Analyzer</p>
        <h1 className="mt-3 text-3xl font-bold text-ink md:text-5xl">Analyze your CV against a real job post</h1>
        <p className="mt-4 leading-7 text-muted">
          Upload your CV PDF and paste a job description to generate a structured ATS-style report in English.
        </p>
      </div>

      {analysis ? (
        <AnalysisResults analysis={analysis} leadCapture={leadCapture} onReset={reset} />
      ) : pendingAnalysis ? (
        <LeadCaptureForm onContinue={handleLeadCapture} onBack={reset} />
      ) : (
        <AnalyzerForm onAnalyze={handleAnalyze} error={error} isLoading={isLoading} />
      )}
    </section>
  );
}
