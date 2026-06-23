"use client";

import { useEffect, useState } from "react";
import { AnalyzerForm } from "@/components/analyzer/analyzer-form";
import { AnalysisResults } from "@/components/analyzer/analysis-results";
import { LeadCaptureForm } from "@/components/analyzer/lead-capture-form";
import type { AnalyzeResponse, CvAnalysisResult, LanguageCode, LeadCapture } from "@/lib/types";

const storedHistoryKey = "cv-match-analyzer-history";
const latestAnalysisIdKey = "cv-match-analyzer-latest-id";

type StoredReport = {
  id: string;
  analysis: CvAnalysisResult;
  detectedLanguage: LanguageCode;
  leadCapture: LeadCapture | null;
  createdAt: string;
};

type HistoryItem = StoredReport;

export function AnalyzerShell() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CvAnalysisResult | null>(null);
  const [pendingAnalysisId, setPendingAnalysisId] = useState<string | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState<CvAnalysisResult | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<LanguageCode | null>(null);
  const [pendingLanguage, setPendingLanguage] = useState<LanguageCode | null>(null);
  const [leadCapture, setLeadCapture] = useState<LeadCapture | null>(null);
  const [isFullReportUnlocked, setIsFullReportUnlocked] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState<"base" | "premium" | null>(null);
  const [isRestoringPayment, setIsRestoringPayment] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setHistory(readHistory());

    const params = new URLSearchParams(window.location.search);
    if (params.get("success") !== "true") {
      return;
    }

    setIsRestoringPayment(true);
    const requestedAnalysisId = params.get("analysisId");
    const storedReport = readStoredReport(requestedAnalysisId) ?? readLatestStoredReport();
    if (!storedReport) {
      return;
    }

    setAnalysisId(storedReport.id);
    setAnalysis(storedReport.analysis);
    setDetectedLanguage(storedReport.detectedLanguage);
    setLeadCapture(storedReport.leadCapture);
    setIsFullReportUnlocked(true);
    setPurchasedPlan(params.get("plan") === "base" ? "base" : "premium");
    setIsRestoringPayment(false);
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

      setPendingAnalysisId(data.analysisId ?? crypto.randomUUID());
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
    setAnalysisId(pendingAnalysisId);
    setAnalysis(pendingAnalysis);
    setDetectedLanguage(pendingLanguage);
    if (pendingAnalysisId && pendingAnalysis && pendingLanguage) {
      const report = {
        id: pendingAnalysisId,
        analysis: pendingAnalysis,
        detectedLanguage: pendingLanguage,
        leadCapture: values,
        createdAt: new Date().toISOString()
      };
      storeReport(report);
      setHistory(saveHistory(report));
    }
    setPendingAnalysisId(null);
    setPendingAnalysis(null);
    setPendingLanguage(null);
  }

  function reset() {
    setAnalysisId(null);
    setAnalysis(null);
    setPendingAnalysisId(null);
    setPendingAnalysis(null);
    setDetectedLanguage(null);
    setPendingLanguage(null);
    setLeadCapture(null);
    setIsFullReportUnlocked(false);
    setPurchasedPlan(null);
    setIsRestoringPayment(false);
    setError("");
  }

  function reopenHistory(item: HistoryItem) {
    setAnalysisId(item.id);
    setAnalysis(item.analysis);
    setDetectedLanguage(item.detectedLanguage);
    setLeadCapture(item.leadCapture);
    setIsFullReportUnlocked(false);
    setPurchasedPlan(null);
    storeReport(item);
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:py-16">
      <div className="mx-auto mb-10 max-w-4xl text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-200 shadow-lg shadow-cyan-500/10 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)]" />
          AI-powered ATS optimization
        </div>
        <h1 className="mt-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-6xl">
          Analyze your CV against a real job post
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
          Upload your CV PDF and paste a job description to generate a structured ATS-style report in the CV language.
        </p>
      </div>

      {isRestoringPayment && !analysis ? (
        <RestorePaymentState onReset={reset} />
      ) : analysis ? (
        <AnalysisResults
          analysisId={analysisId}
          analysis={analysis}
          detectedLanguage={detectedLanguage ?? "en"}
          isFullReportUnlocked={isFullReportUnlocked}
          isPaymentSuccess={isFullReportUnlocked}
          leadCapture={leadCapture}
          purchasedPlan={purchasedPlan}
          onReset={reset}
        />
      ) : pendingAnalysis ? (
        <LeadCaptureForm onContinue={handleLeadCapture} onBack={reset} />
      ) : (
        <div className="space-y-8">
          <AnalyzerForm onAnalyze={handleAnalyze} error={error} isLoading={isLoading} />
          <HistorySection history={history} onOpen={reopenHistory} />
        </div>
      )}
    </section>
  );
}

function storeReport(report: StoredReport) {
  window.localStorage.setItem(getAnalysisStorageKey(report.id), JSON.stringify(report));
  window.localStorage.setItem(latestAnalysisIdKey, report.id);
}

function readStoredReport(analysisId?: string | null): StoredReport | null {
  try {
    if (!analysisId) {
      return null;
    }

    const raw = window.localStorage.getItem(getAnalysisStorageKey(analysisId));
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

function readLatestStoredReport(): StoredReport | null {
  const latestId = window.localStorage.getItem(latestAnalysisIdKey);
  if (latestId) {
    const latestReport = readStoredReport(latestId);
    if (latestReport) {
      return latestReport;
    }
  }

  return readHistory()[0] ?? null;
}

function getAnalysisStorageKey(analysisId: string) {
  return `analysis_${analysisId}`;
}

function saveHistory(report: StoredReport): HistoryItem[] {
  const nextHistory = [report, ...readHistory().filter((item) => item.id !== report.id)].slice(0, 3);
  window.localStorage.setItem(storedHistoryKey, JSON.stringify(nextHistory));
  return nextHistory;
}

function readHistory(): HistoryItem[] {
  try {
    const raw = window.localStorage.getItem(storedHistoryKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as HistoryItem[];
    return parsed.filter((item) => item.analysis && (item.detectedLanguage === "it" || item.detectedLanguage === "en")).slice(0, 3);
  } catch {
    return [];
  }
}

function RestorePaymentState({ onReset }: { onReset: () => void }) {
  return (
    <div className="glass-card mx-auto max-w-2xl rounded-3xl p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_0_48px_rgba(139,92,246,0.45)]">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
      <h2 className="mt-6 text-3xl font-bold text-white">We are restoring your session, please wait...</h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-slate-400">
        Restoring your report after Stripe checkout. Keep this tab open while we recover your analysis.
      </p>
      <button type="button" className="mt-6 text-sm font-semibold text-cyan-200 hover:text-cyan-100" onClick={onReset}>
        Analyze another CV
      </button>
    </div>
  );
}

function HistorySection({ history, onOpen }: { history: HistoryItem[]; onOpen: (item: HistoryItem) => void }) {
  if (!history.length) {
    return null;
  }

  return (
    <div className="glass-card rounded-2xl p-5 transition duration-300">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Recent analyses</p>
          <h2 className="mt-1 text-xl font-bold text-white">Last 3 analyses</h2>
        </div>
        <p className="text-sm font-semibold text-cyan-200">Improve your CV again -&gt;</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {history.map((item) => (
          <button
            key={item.id}
            type="button"
            className="focus-ring rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition duration-300 hover:scale-[1.02] hover:border-cyan-300/40 hover:bg-white/[0.07] hover:shadow-[0_18px_50px_rgba(34,211,238,0.12)]"
            onClick={() => onOpen(item)}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-2xl font-bold text-white">{item.analysis.overallMatchScore}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                {item.detectedLanguage === "it" ? "Italian" : "English"}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{item.analysis.shortSummary}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
