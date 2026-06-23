"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Globe2, Loader2, Lock, RotateCcw, ShieldCheck, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CvAnalysisResult, LanguageCode, LeadCapture } from "@/lib/types";
import { cn } from "@/lib/utils";

type AnalysisResultsProps = {
  analysisId: string | null;
  analysis: CvAnalysisResult;
  detectedLanguage: LanguageCode;
  isFullReportUnlocked: boolean;
  isPaymentSuccess: boolean;
  leadCapture: LeadCapture | null;
  onReset: () => void;
};

const premiumPlaceholders = [
  "Personalized detail available in the full report",
  "Role-specific insight available after unlock",
  "Complete recommendation hidden in free preview"
];

export function AnalysisResults({
  analysisId,
  analysis,
  detectedLanguage,
  isFullReportUnlocked,
  isPaymentSuccess,
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
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ analysisId })
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
          <PaymentSuccessBanner analysis={analysis} isPaymentSuccess={isPaymentSuccess} />
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

function PaymentSuccessBanner({
  analysis,
  isPaymentSuccess
}: {
  analysis: CvAnalysisResult;
  isPaymentSuccess: boolean;
}) {
  return (
    <div className="glass-card rounded-3xl border-emerald-400/20 p-5 md:flex md:items-center md:justify-between md:gap-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 shadow-[0_0_36px_rgba(34,197,94,0.18)]">
          <CheckCircle2 size={25} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">
            {isPaymentSuccess ? <>Payment successful {"\u{1F389}"}</> : "Full report unlocked"}
          </h3>
          <p className="mt-1 text-slate-400">Your CV report is ready. The full AI analysis is unlocked below.</p>
        </div>
      </div>
      <Button
        type="button"
        className="mt-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_28px_rgba(99,102,241,0.26)] md:mt-0"
        onClick={() => downloadAnalysisPdf(analysis)}
      >
        <Download size={17} aria-hidden="true" />
        Download CV Report (PDF)
      </Button>
    </div>
  );
}

function LanguageBadge({ language }: { language: LanguageCode }) {
  const label = language === "it" ? "\u{1F1EE}\u{1F1F9} Italian CV detected" : "\u{1F1EC}\u{1F1E7} English CV detected";

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

function downloadAnalysisPdf(analysis: CvAnalysisResult) {
  const pdf = buildPremiumPdfReport(analysis);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cv-match-report.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

type PdfColor = [number, number, number];
type PdfPage = string[];

const pdfColors = {
  ink: [15, 23, 42] as PdfColor,
  muted: [71, 85, 105] as PdfColor,
  line: [226, 232, 240] as PdfColor,
  soft: [248, 250, 252] as PdfColor,
  blue: [37, 99, 235] as PdfColor,
  purple: [124, 58, 237] as PdfColor,
  cyan: [8, 145, 178] as PdfColor,
  green: [22, 163, 74] as PdfColor,
  yellow: [202, 138, 4] as PdfColor,
  red: [220, 38, 38] as PdfColor,
  white: [255, 255, 255] as PdfColor
};

function buildPremiumPdfReport(analysis: CvAnalysisResult) {
  const renderer = createPdfRenderer();
  const scoreColor = getScorePdfColor(analysis.overallMatchScore);
  const riskColor = getRiskPdfColor(analysis.atsRiskLevel);

  renderer.header(analysis, scoreColor, riskColor);
  renderer.sectionTitle("AI Summary", "Short recruiter-style insight");
  renderer.paragraph(analysis.shortSummary, 10.5, pdfColors.muted);
  renderer.scoreSection(analysis, scoreColor, riskColor);
  renderer.twoColumnLists("Strengths", analysis.strengths, pdfColors.green, "Weaknesses", analysis.weaknesses, pdfColors.red);
  renderer.pillsSection("Missing Keywords", analysis.missingKeywords, pdfColors.red);
  renderer.pillsSection("Matching Keywords", analysis.matchingKeywords, pdfColors.green);
  renderer.listSection("CV Improvements", analysis.suggestedCvImprovements, pdfColors.blue, "ACTION");
  renderer.sectionTitle("AI Rewritten Professional Summary", "Ready-to-use positioning");
  renderer.callout(analysis.rewrittenProfessionalSummary, pdfColors.blue);
  renderer.pillsSection("Recommended Skills To Add", analysis.recommendedSkillsToAdd, pdfColors.purple);
  renderer.sectionTitle("Final Recommendation", "Recruiter-ready next step");
  renderer.callout(analysis.finalRecommendation, pdfColors.cyan);
  renderer.footer();

  return renderer.toPdf();
}

function createPdfRenderer() {
  const pages: PdfPage[] = [[]];
  let page = pages[0];
  let y = 742;

  function ensureSpace(required: number) {
    if (y - required < 54) {
      page = [];
      pages.push(page);
      y = 742;
      drawPageChrome();
    }
  }

  function drawPageChrome() {
    rect(0, 0, 612, 792, pdfColors.white, true);
    rect(34, 34, 544, 724, [255, 255, 255], true, pdfColors.line);
  }

  function rect(x: number, rectY: number, width: number, height: number, fill: PdfColor, shouldFill = true, stroke?: PdfColor) {
    if (shouldFill) {
      page.push(`${rgb(fill)} rg ${x} ${rectY} ${width} ${height} re f`);
    }
    if (stroke) {
      page.push(`${rgb(stroke)} RG ${x} ${rectY} ${width} ${height} re S`);
    }
  }

  function text(value: string, x: number, textY: number, size = 10, color = pdfColors.ink, font: "regular" | "bold" = "regular") {
    page.push(`BT ${rgb(color)} rg /${font === "bold" ? "F2" : "F1"} ${size} Tf ${x} ${textY} Td (${escapePdfText(sanitizePdfText(value))}) Tj ET`);
  }

  function line(x1: number, y1: number, x2: number, y2: number, color = pdfColors.line) {
    page.push(`${rgb(color)} RG ${x1} ${y1} m ${x2} ${y2} l S`);
  }

  function paragraph(value: string, size = 10.5, color = pdfColors.muted, x = 58, maxLength = 92) {
    const lines = wrapPdfText(value, maxLength);
    ensureSpace(lines.length * 15 + 14);
    lines.forEach((lineText) => {
      text(lineText, x, y, size, color);
      y -= 15;
    });
    y -= 8;
  }

  function sectionTitle(title: string, eyebrow?: string) {
    ensureSpace(54);
    y -= 8;
    if (eyebrow) {
      text(eyebrow.toUpperCase(), 58, y, 8, pdfColors.blue, "bold");
      y -= 15;
    }
    text(title, 58, y, 17, pdfColors.ink, "bold");
    y -= 13;
    line(58, y, 554, y, pdfColors.line);
    y -= 18;
  }

  function header(analysis: CvAnalysisResult, scoreColor: PdfColor, riskColor: PdfColor) {
    drawPageChrome();
    rect(34, 650, 544, 108, [239, 246, 255], true);
    text("CV Match Analyzer", 58, 724, 22, pdfColors.ink, "bold");
    text("Premium ATS + recruiter-style CV analysis", 58, 704, 10.5, pdfColors.muted);
    text("ATS SCORE", 420, 724, 8, pdfColors.muted, "bold");
    text(`${analysis.overallMatchScore}/100`, 420, 696, 30, scoreColor, "bold");
    pill(`Risk: ${analysis.atsRiskLevel}`, 420, 662, riskColor, 96);
    y = 620;
  }

  function pill(label: string, x: number, pillY: number, color: PdfColor, width?: number) {
    const pillWidth = width ?? Math.max(62, sanitizePdfText(label).length * 5.2 + 18);
    rect(x, pillY - 5, pillWidth, 18, [248, 250, 252], true, color);
    text(label, x + 9, pillY, 8.5, color, "bold");
    return pillWidth;
  }

  function scoreSection(analysis: CvAnalysisResult, scoreColor: PdfColor, riskColor: PdfColor) {
    sectionTitle("Score Breakdown", "ATS match score");
    ensureSpace(82);
    text("Overall CV to job match", 58, y, 11, pdfColors.ink, "bold");
    text(`${analysis.overallMatchScore}%`, 500, y, 13, scoreColor, "bold");
    y -= 20;
    rect(58, y, 496, 12, [226, 232, 240], true);
    rect(58, y, Math.max(8, 496 * (analysis.overallMatchScore / 100)), 12, scoreColor, true);
    y -= 28;
    text("ATS Risk Level", 58, y, 11, pdfColors.ink, "bold");
    pill(analysis.atsRiskLevel, 150, y, riskColor, 76);
    y -= 30;
  }

  function twoColumnLists(leftTitle: string, leftItems: string[], leftColor: PdfColor, rightTitle: string, rightItems: string[], rightColor: PdfColor) {
    sectionTitle("Recruiter Review", "Strengths and weaknesses");
    const startY = y;
    listBlock(leftTitle, leftItems, leftColor, 58, 238, false);
    const leftEndY = y;
    y = startY;
    listBlock(rightTitle, rightItems, rightColor, 316, 238, false);
    y = Math.min(leftEndY, y) - 4;
  }

  function listBlock(title: string, items: string[], color: PdfColor, x: number, maxWidth: number, reserveSpace = true) {
    if (reserveSpace) {
      ensureSpace(60 + items.length * 28);
    }
    rect(x, y - 8, maxWidth, 24, [248, 250, 252], true, pdfColors.line);
    text(title, x + 12, y, 11, color, "bold");
    y -= 30;
    const safeItems = items.length ? items : ["No items returned"];
    safeItems.forEach((item) => {
      const lines = wrapPdfText(item, Math.floor(maxWidth / 5.4));
      text("OK", x + 2, y, 8, color, "bold");
      lines.forEach((lineText, lineIndex) => {
        text(lineText, x + 24, y - lineIndex * 13, 9.2, pdfColors.muted);
      });
      y -= Math.max(20, lines.length * 13 + 6);
    });
  }

  function listSection(title: string, items: string[], color: PdfColor, icon: string) {
    sectionTitle(title, "Actionable recommendations");
    const safeItems = items.length ? items : ["No items returned"];
    safeItems.forEach((item) => {
      ensureSpace(44);
      const lines = wrapPdfText(item, 84);
      rect(58, y - lines.length * 13 - 10, 496, lines.length * 13 + 22, [248, 250, 252], true, pdfColors.line);
      text(icon, 72, y, 8, color, "bold");
      lines.forEach((lineText, index) => text(lineText, 112, y - index * 13, 9.4, pdfColors.muted));
      y -= lines.length * 13 + 28;
    });
  }

  function pillsSection(title: string, items: string[], color: PdfColor) {
    sectionTitle(title, "Keyword analysis");
    const safeItems = items.length ? items : ["No keywords returned"];
    let x = 58;
    safeItems.forEach((item) => {
      const label = sanitizePdfText(item).slice(0, 38);
      const width = Math.max(58, label.length * 5.1 + 18);
      if (x + width > 554) {
        x = 58;
        y -= 28;
      }
      ensureSpace(32);
      pill(label, x, y, color, width);
      x += width + 8;
    });
    y -= 36;
  }

  function callout(value: string, color: PdfColor) {
    const lines = wrapPdfText(value, 86);
    ensureSpace(lines.length * 15 + 34);
    rect(58, y - lines.length * 15 - 12, 496, lines.length * 15 + 28, [248, 250, 252], true, pdfColors.line);
    rect(58, y - lines.length * 15 - 12, 4, lines.length * 15 + 28, color, true);
    lines.forEach((lineText, index) => text(lineText, 76, y - index * 15, 10, pdfColors.muted));
    y -= lines.length * 15 + 34;
  }

  function footer() {
    pages.forEach((pdfPage, index) => {
      pdfPage.push(`BT ${rgb(pdfColors.muted)} rg /F1 8 Tf 58 24 Td (${escapePdfText(`CV Match Analyzer - Page ${index + 1}`)}) Tj ET`);
    });
  }

  function toPdf() {
    return serializePdf(pages);
  }

  return {
    callout,
    footer,
    header,
    listSection,
    paragraph,
    pillsSection,
    scoreSection,
    sectionTitle,
    toPdf,
    twoColumnLists
  };
}

function serializePdf(pages: PdfPage[]) {
  const fontObjectNumber = 3 + pages.length * 2;
  const boldFontObjectNumber = fontObjectNumber + 1;
  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`);

  pages.forEach((page, pageIndex) => {
    const pageObjectNumber = 3 + pageIndex * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectNumber} 0 R /F2 ${boldFontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`
    );
    const stream = page.join("\n");
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function getScorePdfColor(score: number): PdfColor {
  if (score < 50) {
    return pdfColors.red;
  }

  if (score < 75) {
    return pdfColors.yellow;
  }

  return pdfColors.green;
}

function getRiskPdfColor(level: CvAnalysisResult["atsRiskLevel"]): PdfColor {
  if (level === "Low") {
    return pdfColors.green;
  }

  if (level === "High") {
    return pdfColors.red;
  }

  return pdfColors.yellow;
}

function rgb(color: PdfColor) {
  return color.map((value) => (value / 255).toFixed(3)).join(" ");
}

function wrapPdfText(text: string, maxLength: number) {
  const sanitized = sanitizePdfText(text);
  if (!sanitized) {
    return [""];
  }

  const words = sanitized.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > maxLength) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function sanitizePdfText(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
