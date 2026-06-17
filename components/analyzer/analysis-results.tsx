"use client";

import { useState } from "react";
import { CheckCircle2, Globe2, Loader2, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CvAnalysisResult, LanguageCode, LeadCapture } from "@/lib/types";
import { cn } from "@/lib/utils";

type AnalysisResultsProps = {
  analysis: CvAnalysisResult;
  detectedLanguage: LanguageCode;
  isFullReportUnlocked: boolean;
  leadCapture: LeadCapture | null;
  onReset: () => void;
};

const premiumPlaceholders = [
  "Personalized detail available in the full report",
  "Role-specific insight available after unlock",
  "Complete recommendation hidden in free preview"
];

export function AnalysisResults({
  analysis,
  detectedLanguage,
  isFullReportUnlocked,
  leadCapture,
  onReset
}: AnalysisResultsProps) {
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const previewMissingKeywords = analysis.missingKeywords.slice(0, 3);
  const previewStrengths = analysis.strengths.slice(0, 3);

  async function handleUnlock() {
    setCheckoutError("");
    setIsCheckoutLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST"
      });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Stripe checkout could not be started.");
      }

      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Stripe checkout could not be started.");
      setIsCheckoutLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 md:p-7">
        <div className="grid gap-6 md:grid-cols-[220px_1fr] md:items-center">
          <ScoreRing score={analysis.overallMatchScore} />
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <RiskBadge level={analysis.atsRiskLevel} />
              <span className="text-sm font-medium text-muted">ATS risk level</span>
              <LanguageBadge language={detectedLanguage} />
            </div>
            <h2 className="text-2xl font-bold text-ink">Your CV match report</h2>
            <p className="mt-3 leading-7 text-muted">{analysis.shortSummary}</p>
            {leadCapture?.email ? (
              <p className="mt-3 text-sm text-muted">
                Email captured for this session: <span className="font-semibold text-ink">{leadCapture.email}</span>
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <ListCard title="Missing keywords preview" items={previewMissingKeywords} tone="red" />
        <ListCard title="Strengths preview" items={previewStrengths} tone="green" />
      </div>

      {isFullReportUnlocked ? (
        <>
          <Card className="border-green-200 bg-green-50 p-5 md:p-6">
            <p className="font-semibold text-signal-green">Full report unlocked after Stripe checkout.</p>
          </Card>
          <FullReport analysis={analysis} />
        </>
      ) : (
        <>
          <PaywallCard error={checkoutError} isLoading={isCheckoutLoading} onUnlock={handleUnlock} />
          <LockedReportPreview onUnlock={handleUnlock} />
        </>
      )}

      <Button onClick={onReset} variant="secondary">
        <RotateCcw size={17} aria-hidden="true" />
        Analyze another CV
      </Button>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const background = `conic-gradient(#1769E0 ${score * 3.6}deg, #E3E8EF 0deg)`;

  return (
    <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full" style={{ background }}>
      <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
        <span className="text-4xl font-bold text-ink">{score}</span>
        <span className="text-sm font-medium text-muted">out of 100</span>
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level: CvAnalysisResult["atsRiskLevel"] }) {
  return (
    <span
      className={cn(
        "rounded-md px-3 py-1 text-sm font-semibold",
        level === "Low" && "bg-green-50 text-signal-green",
        level === "Medium" && "bg-amber-50 text-signal-amber",
        level === "High" && "bg-red-50 text-signal-red"
      )}
    >
      {level}
    </span>
  );
}

function LanguageBadge({ language }: { language: LanguageCode }) {
  const label = language === "it" ? "Detected language: Italiano" : "Detected language: English";
  const flag = language === "it" ? "IT" : "UK";

  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
      <Globe2 size={15} aria-hidden="true" />
      {label} ({flag})
    </span>
  );
}

function PaywallCard({
  error,
  isLoading,
  onUnlock
}: {
  error: string;
  isLoading: boolean;
  onUnlock: () => void;
}) {
  return (
    <Card className="overflow-hidden border-brand-100">
      <div className="grid gap-5 bg-white p-5 md:grid-cols-[1fr_auto] md:items-center md:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
            <Lock size={21} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Unlock full report</p>
            <h3 className="mt-2 text-2xl font-bold text-ink">Get the complete ATS report</h3>
            <p className="mt-2 max-w-2xl leading-7 text-muted">
              Get the complete ATS report, rewritten professional summary, missing keywords, and personalized CV
              improvements.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4 md:min-w-56">
          <p className="text-sm font-medium text-muted">One-time payment</p>
          <p className="mt-1 text-4xl font-bold text-ink">{"\u20ac"}19</p>
          <Button onClick={onUnlock} className="mt-4 w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                Opening checkout
              </>
            ) : (
              "Unlock full report for \u20ac19"
            )}
          </Button>
          {error ? <p className="mt-3 text-sm leading-6 text-signal-red">{error}</p> : null}
        </div>
      </div>
    </Card>
  );
}

function LockedReportPreview({ onUnlock }: { onUnlock: () => void }) {
  const lockedSections = [
    { title: "All missing keywords", tone: "red" as const },
    { title: "Matching keywords", tone: "green" as const },
    { title: "Weaknesses", tone: "amber" as const },
    { title: "Suggested CV improvements", tone: "blue" as const },
    { title: "Recommended skills to add", tone: "blue" as const }
  ];

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-2">
        {lockedSections.map((section) => (
          <LockedListCard key={section.title} {...section} onUnlock={onUnlock} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <LockedTextCard title="AI rewritten professional summary" onUnlock={onUnlock} />
        <LockedTextCard title="Final recommendation" onUnlock={onUnlock} />
      </div>
    </div>
  );
}

function LockedListCard({
  title,
  tone,
  onUnlock
}: {
  title: string;
  tone: "blue" | "green" | "amber" | "red";
  onUnlock: () => void;
}) {
  return (
    <Card className="relative min-h-52 overflow-hidden p-5 md:p-6">
      <div className="pointer-events-none blur-[3px]">
        <ListCardContent title={title} items={premiumPlaceholders} tone={tone} />
      </div>
      <LockedOverlay onUnlock={onUnlock} />
    </Card>
  );
}

function LockedTextCard({ title, onUnlock }: { title: string; onUnlock: () => void }) {
  return (
    <Card className="relative min-h-48 overflow-hidden p-5 md:p-6">
      <div className="pointer-events-none blur-[3px]">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-3 leading-7 text-muted">
          Unlock the full report to view this personalized section and apply the role-specific recommendations.
        </p>
      </div>
      <LockedOverlay onUnlock={onUnlock} />
    </Card>
  );
}

function LockedOverlay({ onUnlock }: { onUnlock: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 p-5 text-center backdrop-blur-sm">
      <div>
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md bg-brand-600 text-white">
          <Lock size={20} aria-hidden="true" />
        </div>
        <p className="mt-3 font-semibold text-ink">Full report locked</p>
        <button type="button" className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700" onClick={onUnlock}>
          Unlock for {"\u20ac"}19
        </button>
      </div>
    </div>
  );
}

function FullReport({ analysis }: { analysis: CvAnalysisResult }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <ListCard title="All missing keywords" items={analysis.missingKeywords} tone="red" />
        <ListCard title="Matching keywords" items={analysis.matchingKeywords} tone="green" />
        <ListCard title="Weaknesses" items={analysis.weaknesses} tone="amber" />
        <ListCard title="Suggested CV improvements" items={analysis.suggestedCvImprovements} tone="blue" />
        <ListCard title="Recommended skills to add" items={analysis.recommendedSkillsToAdd} tone="blue" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5 md:p-6">
          <h3 className="text-lg font-semibold text-ink">AI rewritten professional summary</h3>
          <p className="mt-3 leading-7 text-muted">{analysis.rewrittenProfessionalSummary}</p>
        </Card>
        <Card className="p-5 md:p-6">
          <h3 className="text-lg font-semibold text-ink">Final recommendation</h3>
          <p className="mt-3 leading-7 text-muted">{analysis.finalRecommendation}</p>
        </Card>
      </div>
    </div>
  );
}

function ListCard({
  title,
  items,
  tone
}: {
  title: string;
  items: string[];
  tone: "blue" | "green" | "amber" | "red";
}) {
  return (
    <Card className="p-5 md:p-6">
      <ListCardContent title={title} items={items} tone={tone} />
    </Card>
  );
}

function ListCardContent({
  title,
  items,
  tone
}: {
  title: string;
  items: string[];
  tone: "blue" | "green" | "amber" | "red";
}) {
  return (
    <>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-muted">
              {tone === "green" ? (
                <CheckCircle2 size={16} className="mt-1 shrink-0 text-signal-green" aria-hidden="true" />
              ) : (
                <span
                  className={cn(
                    "mt-2 h-2 w-2 shrink-0 rounded-full",
                    tone === "blue" && "bg-brand-600",
                    tone === "amber" && "bg-signal-amber",
                    tone === "red" && "bg-signal-red"
                  )}
                />
              )}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted">No items returned for this section.</p>
      )}
    </>
  );
}
