"use client";

import { useEffect, useState } from "react";
import { AnalyzerForm } from "@/components/analyzer/analyzer-form";
import { AnalysisResults } from "@/components/analyzer/analysis-results";
import { LeadCaptureForm } from "@/components/analyzer/lead-capture-form";
import type { AnalyzeResponse, CvAnalysisResult, LanguageCode, LeadCapture } from "@/lib/types";

const storedReportKey = "cv-match-analyzer-report";

type StoredReport = {
  analysis: CvAnalysisResult;
  detectedLanguage: LanguageCode;
  leadCapture: LeadCapture | null;
};

export function AnalyzerShell() {
  const [analysis, setAnalysis] = useState<CvAnalysisResult | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<CvAnalysisResult | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<LanguageCode | null>(null);
  const [pendingLanguage, setPendingLanguage] = useState<LanguageCode | null>(null);
  const [leadCapture, setLeadCapture] = useState<LeadCapture | null>(null);
  const [isFullReportUnlocked, setIsFullReportUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") !== "true") {
      return;
    }

    const storedReport = readStoredReport();
    if (!storedReport) {
      setError("Payment was completed, but the report could not be restored in this browser session.");
      return;
    }

    setAnalysis(storedReport.analysis);
    setDetectedLanguage(storedReport.detectedLanguage);
    setLeadCapture(storedReport.leadCapture);
    setIsFullReportUnlocked(true);
    window.history.replaceState(null, "", "/analyzer");
  }, []);

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
      setPendingLanguage(data.detectedLanguage ?? "en");
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
    setDetectedLanguage(pendingLanguage);
    if (pendingAnalysis && pendingLanguage) {
      storeReport({
        analysis: pendingAnalysis,
        detectedLanguage: pendingLanguage,
        leadCapture: values
      });
    }
    setPendingAnalysis(null);
    setPendingLanguage(null);
  }

  function reset() {
    setAnalysis(null);
    setPendingAnalysis(null);
    setDetectedLanguage(null);
    setPendingLanguage(null);
    setLeadCapture(null);
    setIsFullReportUnlocked(false);
    setError("");
    window.sessionStorage.removeItem(storedReportKey);
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:py-14">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">CV Analyzer</p>
        <h1 className="mt-3 text-3xl font-bold text-ink md:text-5xl">Analyze your CV against a real job post</h1>
        <p className="mt-4 leading-7 text-muted">
          Upload your CV PDF and paste a job description to generate a structured ATS-style report in the CV language.
        </p>
      </div>

      {analysis ? (
        <AnalysisResults
          analysis={analysis}
          detectedLanguage={detectedLanguage ?? "en"}
          isFullReportUnlocked={isFullReportUnlocked}
          leadCapture={leadCapture}
          onReset={reset}
        />
      ) : pendingAnalysis ? (
        <LeadCaptureForm onContinue={handleLeadCapture} onBack={reset} />
      ) : (
        <AnalyzerForm onAnalyze={handleAnalyze} error={error} isLoading={isLoading} />
      )}
    </section>
  );
}

function storeReport(report: StoredReport) {
  window.sessionStorage.setItem(storedReportKey, JSON.stringify(report));
}

function readStoredReport(): StoredReport | null {
  try {
    const raw = window.sessionStorage.getItem(storedReportKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredReport;
    if (!parsed.analysis || (parsed.detectedLanguage !== "it" && parsed.detectedLanguage !== "en")) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
