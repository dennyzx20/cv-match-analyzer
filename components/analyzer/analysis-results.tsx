"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  purchasedPlan: "base" | "premium" | null;
  onReset: () => void;
};

export function AnalysisResults({
  analysisId,
  analysis,
  detectedLanguage,
  isFullReportUnlocked,
  isPaymentSuccess,
  leadCapture,
  purchasedPlan,
  onReset
}: AnalysisResultsProps) {
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const previewMissingKeywords = useMemo(() => analysis.missingKeywords.slice(0, 3), [analysis.missingKeywords]);
  const previewStrengths = useMemo(() => analysis.strengths.slice(0, 3), [analysis.strengths]);

  const handleUnlock = useCallback(async (plan: "base" | "premium") => {
    setCheckoutError("");
    setIsCheckoutLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ analysisId, plan })
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
  }, [analysisId]);

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
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">
                <TrendingUp size={15} aria-hidden="true" />
                ATS analytics preview
              </span>
            </div>
            <h2 className="bg-gradient-to-r from-slate-950 to-blue-900 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              Your free ATS preview is ready
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">{analysis.shortSummary}</p>
            {leadCapture?.email ? (
              <p className="mt-4 text-sm text-slate-500">
                Email captured for this session: <span className="font-semibold text-slate-700">{leadCapture.email}</span>
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
          <PaymentSuccessBanner analysis={analysis} isPaymentSuccess={isPaymentSuccess} purchasedPlan={purchasedPlan} />
          {purchasedPlan === "base" ? <BaseReport analysis={analysis} /> : <FullReport analysis={analysis} />}
        </>
      ) : (
        <div>
          <PaywallCard error={checkoutError} isLoading={isCheckoutLoading} onUnlock={handleUnlock} />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={onReset}
          variant="secondary"
          className="rounded-2xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
        >
          <RotateCcw size={17} aria-hidden="true" />
          Re-run analysis with new CV
        </Button>
        <p className="text-sm font-semibold text-blue-700">Improve your CV again -&gt;</p>
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
      <div className="flex h-52 w-52 items-center justify-center rounded-full shadow-xl shadow-slate-200/70" style={{ background }}>
        <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border border-slate-200 bg-white">
          <span className="text-6xl font-bold text-slate-950">{displayScore}</span>
          <span className="text-sm font-medium text-slate-500">out of 100</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-500">ATS Match Score</p>
    </div>
  );
}

function RiskBadge({ level }: { level: CvAnalysisResult["atsRiskLevel"] }) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-sm font-semibold",
        level === "Low" && "border-emerald-200 bg-emerald-50 text-emerald-700",
        level === "Medium" && "border-yellow-200 bg-yellow-50 text-yellow-700",
        level === "High" && "border-red-200 bg-red-50 text-red-700"
      )}
    >
      Risk level: {level}
    </span>
  );
}

function PaymentSuccessBanner({
  analysis,
  isPaymentSuccess,
  purchasedPlan
}: {
  analysis: CvAnalysisResult;
  isPaymentSuccess: boolean;
  purchasedPlan: "base" | "premium" | null;
}) {
  const hasPdfDownload = purchasedPlan !== "base";

  return (
    <div className="glass-card rounded-3xl border-emerald-200 p-5 md:flex md:items-center md:justify-between md:gap-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
          <CheckCircle2 size={25} aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-950">
            {isPaymentSuccess ? <>Payment successful {"\u{1F389}"}</> : "Full report unlocked"}
          </h3>
          <p className="mt-1 text-slate-600">
            Your {purchasedPlan === "base" ? "Base" : "Premium"} CV report is ready. The selected report is unlocked below.
          </p>
        </div>
      </div>
      {hasPdfDownload ? (
        <Button
          type="button"
          className="mt-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20 md:mt-0"
          onClick={() => downloadAnalysisPdf(analysis)}
        >
          <Download size={17} aria-hidden="true" />
          Download CV Report (PDF)
        </Button>
      ) : (
        <p className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 md:mt-0">
          PDF export is included in Premium.
        </p>
      )}
    </div>
  );
}

function LanguageBadge({ language }: { language: LanguageCode }) {
  const label = language === "it" ? "\u{1F1EE}\u{1F1F9} Italian CV detected" : "\u{1F1EC}\u{1F1E7} English CV detected";

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 shadow-sm">
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
  onUnlock: (plan: "base" | "premium") => void;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="glass-card w-full max-w-4xl rounded-3xl p-6 text-center md:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
          <Lock size={28} aria-hidden="true" />
        </div>
        <h3 className="mt-6 text-3xl font-bold text-slate-950">Choose your AI report</h3>
        <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
          Unlock complete ATS breakdown, keyword gaps and CV optimization strategy.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <OfferCard
            description="Compatibility analysis, match score, 3 strengths, 3 key weaknesses and concise CV improvement tips."
            isLoading={isLoading}
            name="Base"
            price={"9,99\u20ac"}
            cta="Unlock Base"
            onClick={() => onUnlock("base")}
          />
          <OfferCard
            description="Everything in Base plus full keyword analysis, deeper recommendations, rewritten CV sections and cover letter draft."
            featured
            isLoading={isLoading}
            name="Premium"
            price={"19,99\u20ac"}
            cta="Unlock Premium"
            onClick={() => onUnlock("premium")}
          />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-medium text-slate-600">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-600" aria-hidden="true" />
            Secure payment powered by Stripe
          </span>
          <span className="inline-flex items-center gap-2">
            <Zap size={15} className="text-blue-600" aria-hidden="true" />
            Instant access after payment
          </span>
        </div>
        {error ? <p className="mt-4 text-sm leading-6 text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

function OfferCard({
  cta,
  description,
  featured = false,
  isLoading,
  name,
  onClick,
  price
}: {
  cta: string;
  description: string;
  featured?: boolean;
  isLoading: boolean;
  name: string;
  onClick: () => void;
  price: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 ${featured ? "border-blue-200 bg-blue-50 shadow-lg shadow-blue-100/70" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{name}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{price}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {featured ? <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">Best value</span> : null}
      </div>
      <Button
        onClick={onClick}
        className={`mt-5 h-12 w-full rounded-2xl ${featured ? "bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20" : "border border-slate-200 bg-slate-900 text-white hover:bg-slate-800"}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Opening checkout
          </>
        ) : (
          cta
        )}
      </Button>
    </div>
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
      <NotionBlock title="Personalized cover letter draft" text={buildCoverLetterDraft(analysis)} />
    </div>
  );
}

function BaseReport({ analysis }: { analysis: CvAnalysisResult }) {
  const topStrengths = analysis.strengths.slice(0, 3);
  const topWeaknesses = analysis.weaknesses.slice(0, 3);
  const conciseImprovements = analysis.suggestedCvImprovements.slice(0, 3);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <StrengthCards title="Top strengths" items={topStrengths} />
        <ListCard title="Top CV weaknesses" items={topWeaknesses} tone="red" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <KeywordPills title="Priority missing keywords" items={analysis.missingKeywords.slice(0, 3)} />
        <RecommendationBlocks title="Concise CV improvements" items={conciseImprovements} />
      </div>
      <NotionBlock
        title="Base compatibility insight"
        text="This Base report unlocks the essential CV/job fit diagnosis: your match score, strongest selling points, key gaps and concise next actions. Premium adds the complete keyword map, deeper recommendations, rewritten CV sections, PDF export and a cover letter draft."
      />
    </div>
  );
}

function DashboardCard({ children }: { children: React.ReactNode }) {
  return <div className="glass-card rounded-2xl p-5 transition duration-200 hover:-translate-y-0.5 md:p-6">{children}</div>;
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
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      {items.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-600">No missing keywords returned.</p>
      )}
    </DashboardCard>
  );
}

function StrengthCards({ title, items }: { title: string; items: string[] }) {
  return (
    <DashboardCard>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-slate-700">
            <CheckCircle2 size={16} className="mr-2 inline text-emerald-600" aria-hidden="true" />
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
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <Sparkles size={16} className="mr-2 inline text-blue-600" aria-hidden="true" />
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
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 whitespace-pre-line rounded-2xl border border-slate-200 bg-slate-50 p-4 leading-7 text-slate-700">
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
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
              {tone === "green" ? (
                <CheckCircle2 size={16} className="mt-1 shrink-0 text-emerald-600" aria-hidden="true" />
              ) : (
                <span
                  className={cn(
                    "mt-2 h-2 w-2 shrink-0 rounded-full",
                    tone === "blue" && "bg-blue-500",
                    tone === "amber" && "bg-yellow-500",
                    tone === "red" && "bg-red-500"
                  )}
                />
              )}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-600">No items returned for this section.</p>
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

function buildCoverLetterDraft(analysis: CvAnalysisResult) {
  const strongestPoint = analysis.strengths[0] || "my background aligns with the role requirements";
  const improvementFocus = analysis.missingKeywords[0] || "the core priorities of the role";

  return [
    "Dear Hiring Manager,",
    "",
    `I am excited to apply for this role because ${strongestPoint}. After reviewing the position requirements, I can see a strong fit between my experience and the outcomes your team is looking for.`,
    "",
    `My CV already shows relevant strengths, and I would emphasize ${improvementFocus} more clearly to make the application even more targeted. ${analysis.finalRecommendation}`,
    "",
    "Thank you for considering my application. I would welcome the opportunity to discuss how my experience can support your team."
  ].join("\n");
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
  renderer.sectionTitle("Personalized Cover Letter Draft", "Premium application asset");
  renderer.callout(buildCoverLetterDraft(analysis), pdfColors.purple);
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
