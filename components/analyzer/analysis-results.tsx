"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Globe2, Loader2, Lock, RotateCcw, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="glass-card relative overflow-hidden rounded-2xl p-5 md:p-7">
        <div className="absolute right-5 top-5 z-10">
          <LanguageBadge language={detectedLanguage} />
        </div>
        <div className="grid gap-8 pt-12 md:grid-cols-[260px_1fr] md:items-center md:pt-0">
          <ScoreRing score={analysis.overallMatchScore} />
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <RiskBadge level={analysis.atsRiskLevel} />
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-slate-300">
                <TrendingUp size={15} aria-hidden="true" />
                ATS analytics preview
              </span>
            </div>
            <h2 className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              Your free ATS preview is ready
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-400">{analysis.shortSummary}</p>
            {leadCapture?.email ? (
              <p className="mt-4 text-sm text-slate-500">
                Email captured for this session: <span className="font-semibold text-slate-300">{leadCapture.email}</span>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <KeywordPills title="Missing keywords preview" items={previewMissingKeywords} />
        <StrengthCards title="Strengths preview" items={previewStrengths} />
      </div>

      {isFullReportUnlocked ? (
        <>
          <div className="glass-card rounded-2xl border-emerald-400/20 p-5">
            <p className="font-semibold text-emerald-300">Full report unlocked after Stripe checkout.</p>
          </div>
          <FullReport analysis={analysis} />
        </>
      ) : (
        <div className="relative">
          <LockedReportPreview onUnlock={handleUnlock} />
          <PaywallCard error={checkoutError} isLoading={isCheckoutLoading} onUnlock={handleUnlock} />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={onReset}
          variant="secondary"
          className="rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          <RotateCcw size={17} aria-hidden="true" />
          Re-run analysis with new CV
        </Button>
        <p className="text-sm font-semibold text-cyan-200">Improve your CV again -&gt;</p>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const color = score < 50 ? "#EF4444" : score < 75 ? "#FACC15" : "#22C55E";
  const background = `conic-gradient(${color} ${displayScore * 3.6}deg, rgba(148,163,184,0.16) 0deg)`;

  useEffect(() => {
    const duration = 700;
    const start = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      setDisplayScore(Math.round(score * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="mx-auto text-center">
      <div className="flex h-52 w-52 items-center justify-center rounded-full shadow-[0_0_80px_rgba(99,102,241,0.22)]" style={{ background }}>
        <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border border-white/10 bg-[#0B0F1A]">
          <span className="text-6xl font-bold text-white">{displayScore}</span>
          <span className="text-sm font-medium text-slate-400">out of 100</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-400">ATS Match Score</p>
    </div>
  );
}

function RiskBadge({ level }: { level: CvAnalysisResult["atsRiskLevel"] }) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-semibold",
        level === "Low" && "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        level === "Medium" && "border-yellow-300/20 bg-yellow-300/10 text-yellow-200",
        level === "High" && "border-red-400/20 bg-red-400/10 text-red-300"
      )}
    >
      Risk level: {level}
    </span>
  );
}

function LanguageBadge({ language }: { language: LanguageCode }) {
  const label = language === "it" ? "🇮🇹 Italian CV detected" : "🇬🇧 English CV detected";

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-semibold text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
      <Globe2 size={15} aria-hidden="true" />
      {label}
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
    <div className="absolute inset-0 z-10 flex items-center justify-center p-5">
      <div className="glass-card w-full max-w-xl rounded-3xl border-indigo-300/20 p-6 text-center shadow-[0_30px_120px_rgba(99,102,241,0.32)] md:p-8">
        <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-[0_0_48px_rgba(139,92,246,0.45)]">
          <Lock size={28} aria-hidden="true" />
        </div>
        <h3 className="mt-6 text-3xl font-bold text-white">Unlock Full AI Report</h3>
        <p className="mx-auto mt-3 max-w-md leading-7 text-slate-400">
          Get complete ATS breakdown, keyword gaps and CV optimization strategy.
        </p>
        <p className="mt-6 text-4xl font-bold text-white">{"\u20ac"}19</p>
        <p className="mt-1 text-sm font-medium text-slate-400">one-time payment</p>
        <Button
          onClick={onUnlock}
          className="animate-gradient mt-6 h-13 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500 px-7 text-base shadow-[0_0_36px_rgba(99,102,241,0.35)] transition hover:scale-[1.02]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Opening checkout
            </>
          ) : (
            "Unlock now"
          )}
        </Button>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-medium text-slate-400">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-300" aria-hidden="true" />
            Secure payment powered by Stripe
          </span>
          <span className="inline-flex items-center gap-2">
            <Zap size={15} className="text-cyan-300" aria-hidden="true" />
            Instant access after payment
          </span>
        </div>
        {error ? <p className="mt-4 text-sm leading-6 text-red-300">{error}</p> : null}
      </div>
    </div>
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
    <div className="pointer-events-none blur-sm">
      <div className="grid gap-5 lg:grid-cols-2">
        {lockedSections.map((section) => (
          <LockedListCard key={section.title} {...section} onUnlock={onUnlock} />
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <LockedTextCard title="AI Recommendations" />
        <LockedTextCard title="Final optimization strategy" />
      </div>
    </div>
  );
}

function LockedListCard({
  title,
  tone
}: {
  title: string;
  tone: "blue" | "green" | "amber" | "red";
  onUnlock: () => void;
}) {
  return (
    <DashboardCard>
      <ListCardContent title={title} items={premiumPlaceholders} tone={tone} />
    </DashboardCard>
  );
}

function LockedTextCard({ title }: { title: string }) {
  return (
    <DashboardCard>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        <div className="shimmer h-4 rounded-full bg-white/10" />
        <div className="shimmer h-4 w-4/5 rounded-full bg-white/10" />
        <div className="shimmer h-4 w-2/3 rounded-full bg-white/10" />
      </div>
    </DashboardCard>
  );
}

function FullReport({ analysis }: { analysis: CvAnalysisResult }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <KeywordPills title="All missing keywords" items={analysis.missingKeywords} />
        <ListCard title="Matching keywords" items={analysis.matchingKeywords} tone="green" />
        <ListCard title="Weaknesses" items={analysis.weaknesses} tone="amber" />
        <RecommendationBlocks title="AI Recommendations" items={analysis.suggestedCvImprovements} />
        <ListCard title="Recommended skills to add" items={analysis.recommendedSkillsToAdd} tone="blue" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <NotionBlock title="AI rewritten professional summary" text={analysis.rewrittenProfessionalSummary} />
        <NotionBlock title="Final optimization strategy" text={analysis.finalRecommendation} />
      </div>
    </div>
  );
}

function DashboardCard({ children }: { children: React.ReactNode }) {
  return <div className="glass-card rounded-2xl p-5 transition duration-300 hover:scale-[1.02] md:p-6">{children}</div>;
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
    <DashboardCard>
      <ListCardContent title={title} items={items} tone={tone} />
    </DashboardCard>
  );
}

function KeywordPills({ title, items }: { title: string; items: string[] }) {
  return (
    <DashboardCard>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {items.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-sm font-semibold text-red-200">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-400">No missing keywords returned.</p>
      )}
    </DashboardCard>
  );
}

function StrengthCards({ title, items }: { title: string; items: string[] }) {
  return (
    <DashboardCard>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-slate-300">
            <CheckCircle2 size={16} className="mr-2 inline text-emerald-300" aria-hidden="true" />
            {item}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function RecommendationBlocks({ title, items }: { title: string; items: string[] }) {
  return (
    <DashboardCard>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300">
            <Sparkles size={16} className="mr-2 inline text-cyan-300" aria-hidden="true" />
            {item}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

function NotionBlock({ title, text }: { title: string; text: string }) {
  return (
    <DashboardCard>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 leading-7 text-slate-300">
        {text}
      </div>
    </DashboardCard>
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
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
              {tone === "green" ? (
                <CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-300" aria-hidden="true" />
              ) : (
                <span
                  className={cn(
                    "mt-2 h-2 w-2 shrink-0 rounded-full",
                    tone === "blue" && "bg-cyan-300",
                    tone === "amber" && "bg-yellow-300",
                    tone === "red" && "bg-red-300"
                  )}
                />
              )}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-400">No items returned for this section.</p>
      )}
    </>
  );
}
