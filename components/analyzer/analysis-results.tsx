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
  adminBypassEnabled: boolean;
  onReset: () => void;
};

type CheckoutPlan = "base" | "premium";

const pendingCheckoutKey = "cv-match-analyzer-pending-checkout";

export function AnalysisResults({
  analysisId,
  analysis,
  detectedLanguage,
  isFullReportUnlocked,
  isPaymentSuccess,
  leadCapture,
  purchasedPlan,
  adminBypassEnabled,
  onReset
}: AnalysisResultsProps) {
  const [checkoutError, setCheckoutError] = useState("");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const previewMissingKeywords = useMemo(() => analysis.missingKeywords.slice(0, 3), [analysis.missingKeywords]);
  const previewStrengths = useMemo(() => analysis.strengths.slice(0, 3), [analysis.strengths]);

  const handleUnlock = useCallback(async (plan: CheckoutPlan) => {
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

      writePendingCheckout(plan, analysisId, "stripe");
      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Stripe checkout could not be started.");
      setIsCheckoutLoading(false);
    }
  }, [analysisId]);

  const handleAdminUnlock = useCallback((plan: CheckoutPlan) => {
    writePendingCheckout(plan, analysisId, "admin");
    const redirectUrl = new URL("/analyzer", window.location.origin);
    redirectUrl.searchParams.set("success", "true");
    redirectUrl.searchParams.set("plan", plan);
    if (analysisId) {
      redirectUrl.searchParams.set("analysisId", analysisId);
    }

    window.location.href = redirectUrl.toString();
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
          <PaymentSuccessBanner
            analysis={analysis}
            detectedLanguage={detectedLanguage}
            isPaymentSuccess={isPaymentSuccess}
            purchasedPlan={purchasedPlan}
          />
          {purchasedPlan === "base" ? (
            <BaseReport analysis={analysis} />
          ) : (
            <FullReport analysis={analysis} detectedLanguage={detectedLanguage} />
          )}
        </>
      ) : (
        <div>
          <PaywallCard
            adminBypassEnabled={adminBypassEnabled}
            error={checkoutError}
            isLoading={isCheckoutLoading}
            onAdminUnlock={handleAdminUnlock}
            onUnlock={handleUnlock}
          />
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
  detectedLanguage,
  isPaymentSuccess,
  purchasedPlan
}: {
  analysis: CvAnalysisResult;
  detectedLanguage: LanguageCode;
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
          onClick={() => downloadAnalysisPdf(analysis, detectedLanguage)}
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
  adminBypassEnabled,
  error,
  isLoading,
  onAdminUnlock,
  onUnlock
}: {
  adminBypassEnabled: boolean;
  error: string;
  isLoading: boolean;
  onAdminUnlock: (plan: CheckoutPlan) => void;
  onUnlock: (plan: CheckoutPlan) => void;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="glass-card w-full max-w-4xl rounded-3xl p-5 text-center sm:p-6 md:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
          <Lock size={28} aria-hidden="true" />
        </div>
        <h3 className="mt-6 text-3xl font-bold text-slate-950">Choose your AI report</h3>
        <p className="mx-auto mt-3 max-w-md leading-7 text-slate-600">
          Unlock complete ATS breakdown, keyword gaps and CV optimization strategy.
        </p>
        <div className="mx-auto mt-6 w-full max-w-3xl space-y-5">
          {adminBypassEnabled ? <AdminBypassPanel isLoading={isLoading} onUnlock={onAdminUnlock} /> : null}
          <div className="grid items-stretch gap-4 md:grid-cols-2">
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
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-slate-600">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-600" aria-hidden="true" />
              Secure payment powered by Stripe
            </span>
            <span className="inline-flex items-center gap-2">
              <Zap size={15} className="text-blue-600" aria-hidden="true" />
              Instant access after payment
            </span>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm leading-6 text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}

function AdminBypassPanel({
  isLoading,
  onUnlock
}: {
  isLoading: boolean;
  onUnlock: (plan: CheckoutPlan) => void;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            ADMIN MODE
          </span>
          <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-amber-900">
            Payment bypass active. Use this only to test Base and Premium without Stripe.
          </p>
        </div>
        <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:min-w-[300px]">
          <Button
            type="button"
            variant="secondary"
            className="h-12 rounded-xl border border-amber-200 bg-white px-5 text-amber-900 hover:bg-amber-100"
            disabled={isLoading}
            onClick={() => onUnlock("base")}
          >
            Sblocca Base
          </Button>
          <Button
            type="button"
            className="h-12 rounded-xl bg-amber-500 px-5 text-white hover:bg-amber-600"
            disabled={isLoading}
            onClick={() => onUnlock("premium")}
          >
            Sblocca Premium
          </Button>
        </div>
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
    <div className={`flex h-full min-h-[260px] flex-col rounded-2xl border p-5 text-left transition duration-200 hover:-translate-y-0.5 ${featured ? "border-blue-200 bg-blue-50 shadow-lg shadow-blue-100/70" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{name}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{price}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {featured ? <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">Best value</span> : null}
      </div>
      <Button
        onClick={onClick}
        className={`mt-auto h-12 w-full rounded-2xl ${featured ? "bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20" : "border border-slate-200 bg-slate-900 text-white hover:bg-slate-800"}`}
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

function FullReport({ analysis, detectedLanguage }: { analysis: CvAnalysisResult; detectedLanguage: LanguageCode }) {
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
      <NotionBlock title={detectedLanguage === "it" ? "Lettera di presentazione personalizzata" : "Personalized cover letter draft"} text={buildCoverLetterDraft(analysis, detectedLanguage)} />
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

function downloadAnalysisPdf(analysis: CvAnalysisResult, language: LanguageCode) {
  const pdf = buildPremiumPdfReport(analysis, language);
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

function writePendingCheckout(plan: CheckoutPlan, analysisId: string | null, source: "stripe" | "admin") {
  if (!analysisId) {
    return;
  }

  window.localStorage.setItem(
    pendingCheckoutKey,
    JSON.stringify({
      analysisId,
      plan,
      createdAt: new Date().toISOString(),
      source
    })
  );
}

function buildCoverLetterDraft(analysis: CvAnalysisResult, language: LanguageCode) {
  const strengths = analysis.strengths.slice(0, 2);
  const skills = analysis.matchingKeywords.slice(0, 3);
  const improvementFocus = analysis.missingKeywords.slice(0, 2);

  if (language === "it") {
    return [
      "Gentile Responsabile della selezione,",
      "",
      "desidero candidarmi per questa opportunita perche il mio profilo presenta elementi concreti di coerenza con le esigenze del ruolo. Dall'analisi del CV emergono esperienze e competenze che possono essere valorizzate in modo piu mirato per comunicare subito il potenziale contributo al team.",
      "",
      strengths.length
        ? `In particolare, metterei in evidenza ${joinNaturalList(strengths, "it")}. Questi aspetti aiutano a posizionare la candidatura come solida, orientata ai risultati e rilevante rispetto alle responsabilita richieste.`
        : "In particolare, metterei in evidenza le esperienze piu rilevanti, i risultati ottenuti e le competenze trasferibili che dimostrano capacita di adattamento e contributo operativo.",
      "",
      skills.length
        ? `La candidatura puo essere rafforzata richiamando in modo naturale competenze gia presenti come ${joinNaturalList(skills, "it")}, collegandole a esempi concreti e risultati misurabili.`
        : "La candidatura puo essere rafforzata collegando le competenze principali a esempi concreti, responsabilita svolte e risultati misurabili.",
      "",
      improvementFocus.length
        ? `Per aumentare l'allineamento con l'offerta, consiglierei inoltre di integrare meglio riferimenti a ${joinNaturalList(improvementFocus, "it")}, evitando un elenco generico e inserendoli invece nei punti del CV piu pertinenti.`
        : "Per aumentare l'allineamento con l'offerta, consiglierei inoltre di rendere piu esplicito il legame tra esperienze, competenze e requisiti indicati nell'annuncio.",
      "",
      "Sarei lieto di approfondire in colloquio come il mio percorso possa rispondere alle necessita della posizione e contribuire agli obiettivi dell'azienda.",
      "",
      "Cordiali saluti"
    ].join("\n");
  }

  return [
    "Dear Hiring Manager,",
    "",
    "I am pleased to apply for this opportunity because my profile shows a clear connection with the requirements of the role. The CV analysis highlights experience and skills that can be positioned more strongly to communicate immediate relevance and value to your team.",
    "",
    strengths.length
      ? `In particular, I would emphasize ${joinNaturalList(strengths, "en")}. These points help present the application as focused, credible and aligned with the responsibilities described in the job post.`
      : "In particular, I would emphasize the most relevant responsibilities, achievements and transferable skills that show adaptability and practical impact.",
    "",
    skills.length
      ? `The application can also be strengthened by naturally referencing existing skills such as ${joinNaturalList(skills, "en")}, connecting them to concrete examples and measurable outcomes.`
      : "The application can also be strengthened by connecting core skills to concrete examples, responsibilities and measurable outcomes.",
    "",
    improvementFocus.length
      ? `To improve alignment with the role, I would also add clearer references to ${joinNaturalList(improvementFocus, "en")}, placing them in the most relevant CV sections rather than listing them generically.`
      : "To improve alignment with the role, I would make the connection between experience, skills and the job requirements more explicit throughout the CV.",
    "",
    "I would welcome the opportunity to discuss how my background can support the needs of the position and contribute to your team's goals.",
    "",
    "Kind regards"
  ].join("\n");
}

function buildSuggestedHeadline(analysis: CvAnalysisResult, language: LanguageCode) {
  const skills = [...analysis.matchingKeywords, ...analysis.recommendedSkillsToAdd].slice(0, 3);
  if (language === "it") {
    return skills.length
      ? `Profilo orientato al ruolo con focus su ${joinNaturalList(skills, "it")}`
      : "Profilo professionale orientato al ruolo con competenze trasferibili e attenzione ai risultati";
  }

  return skills.length
    ? `Role-aligned candidate focused on ${joinNaturalList(skills, "en")}`
    : "Role-aligned professional with transferable skills and results-focused experience";
}

function buildImprovedExperiencePhrases(analysis: CvAnalysisResult, language: LanguageCode) {
  const strengths = analysis.strengths.slice(0, 2);
  const keywords = analysis.matchingKeywords.slice(0, 2);
  const improvements = analysis.suggestedCvImprovements.slice(0, 2);

  if (language === "it") {
    return [
      strengths[0]
        ? `Ho contribuito in modo concreto a ${strengths[0].toLowerCase()}, collegando responsabilita operative e risultati rilevanti per il ruolo.`
        : "Ho gestito attivita operative rilevanti per il ruolo, mantenendo attenzione a qualita, affidabilita e collaborazione.",
      keywords[0]
        ? `Ho applicato competenze legate a ${keywords[0]} in contesti pratici, trasformandole in supporto misurabile alle attivita del team.`
        : "Ho applicato competenze tecniche e organizzative in contesti pratici, supportando il raggiungimento degli obiettivi del team.",
      improvements[0]
        ? `Per rafforzare il CV, riscriverei l'esperienza includendo esempi concreti relativi a ${improvements[0].toLowerCase()}.`
        : "Per rafforzare il CV, aggiungerei risultati misurabili, strumenti utilizzati e responsabilita direttamente collegate all'annuncio."
    ];
  }

  return [
    strengths[0]
      ? `Contributed directly to ${strengths[0].toLowerCase()}, connecting day-to-day responsibilities with outcomes relevant to the target role.`
      : "Managed role-relevant responsibilities with a focus on quality, reliability and collaboration.",
    keywords[0]
      ? `Applied ${keywords[0]} in practical contexts, turning this capability into measurable support for team activities.`
      : "Applied technical and organizational skills in practical contexts to support team goals.",
    improvements[0]
      ? `To strengthen the CV, rewrite the experience with concrete examples related to ${improvements[0].toLowerCase()}.`
      : "To strengthen the CV, add measurable outcomes, tools used and responsibilities directly connected to the job post."
  ];
}

function buildRequirementRows(analysis: CvAnalysisResult, copy: ReportCopy, language: LanguageCode) {
  const rows = [
    ...analysis.matchingKeywords.slice(0, 4).map((keyword) => ({
      requirement: keyword,
      status: copy.present,
      color: pdfColors.green,
      suggestion:
        language === "it"
          ? `Mantienilo nel CV e collegalo a un risultato o responsabilita concreta.`
          : "Keep it in the CV and connect it to a concrete result or responsibility."
    })),
    ...analysis.missingKeywords.slice(0, 4).map((keyword) => ({
      requirement: keyword,
      status: copy.missing,
      color: pdfColors.red,
      suggestion:
        language === "it"
          ? `Inserisci questa keyword in una sezione pertinente solo se supportata da esperienza reale.`
          : "Add this keyword in a relevant section only when it is supported by real experience."
    })),
    ...analysis.recommendedSkillsToAdd.slice(0, 2).map((skill) => ({
      requirement: skill,
      status: copy.partial,
      color: pdfColors.yellow,
      suggestion:
        language === "it"
          ? "Aggiungi contesto: strumenti, attivita svolte e impatto prodotto."
          : "Add context: tools used, activities performed and impact created."
    }))
  ];

  return rows.slice(0, 8);
}

function buildSevenDayPlan(analysis: CvAnalysisResult, language: LanguageCode) {
  const missing = analysis.missingKeywords.slice(0, 3);
  const improvements = analysis.suggestedCvImprovements.slice(0, 3);

  if (language === "it") {
    return [
      "Giorno 1: Rileggi l'annuncio e seleziona i 6 requisiti piu importanti da riflettere nel CV.",
      `Giorno 2: Integra le keyword prioritarie${missing.length ? `: ${joinNaturalList(missing, "it")}` : ""}, senza forzature e solo dove coerenti.`,
      "Giorno 3: Riscrivi il profilo professionale usando il testo ottimizzato del report.",
      improvements[0] ? `Giorno 4: Applica questa modifica concreta: ${improvements[0]}` : "Giorno 4: Aggiungi esempi concreti e risultati misurabili alle esperienze principali.",
      improvements[1] ? `Giorno 5: Rafforza una seconda area: ${improvements[1]}` : "Giorno 5: Migliora la leggibilita ATS con sezioni chiare e titoli standard.",
      "Giorno 6: Prepara email breve e lettera di presentazione, adattandole al nome dell'azienda.",
      "Giorno 7: Controlla checklist ATS, esporta il CV in PDF pulito e invia la candidatura."
    ];
  }

  return [
    "Day 1: Re-read the job post and identify the 6 most important requirements to reflect in the CV.",
    `Day 2: Add priority keywords${missing.length ? `: ${joinNaturalList(missing, "en")}` : ""}, only where they are accurate and relevant.`,
    "Day 3: Rewrite the professional summary using the optimized version in this report.",
    improvements[0] ? `Day 4: Apply this concrete improvement: ${improvements[0]}` : "Day 4: Add concrete examples and measurable outcomes to the main experience entries.",
    improvements[1] ? `Day 5: Strengthen a second area: ${improvements[1]}` : "Day 5: Improve ATS readability with clear sections and standard headings.",
    "Day 6: Prepare the short email and cover letter, adapting them to the company name.",
    "Day 7: Review the ATS checklist, export a clean PDF CV and submit the application."
  ];
}

function buildAtsChecklist(analysis: CvAnalysisResult, copy: ReportCopy, language: LanguageCode) {
  const score = analysis.overallMatchScore;
  const status = {
    positive: language === "it" ? "POSITIVO" : "POSITIVE",
    partial: language === "it" ? "PARZIALE" : "PARTIAL",
    negative: language === "it" ? "NEGATIVO" : "NEGATIVE"
  };

  return [
    {
      item: language === "it" ? "Keyword" : "Keywords",
      state: analysis.missingKeywords.length <= 2 ? status.positive : analysis.missingKeywords.length <= 5 ? status.partial : status.negative,
      color: analysis.missingKeywords.length <= 2 ? pdfColors.green : analysis.missingKeywords.length <= 5 ? pdfColors.yellow : pdfColors.red,
      note: language === "it" ? "Copertura keyword rispetto all'annuncio." : "Keyword coverage against the job post."
    },
    {
      item: language === "it" ? "Formato" : "Format",
      state: status.partial,
      color: pdfColors.yellow,
      note: language === "it" ? "Usa sezioni standard e PDF pulito senza elementi grafici complessi." : "Use standard sections and a clean PDF without complex graphics."
    },
    {
      item: language === "it" ? "Competenze" : "Skills",
      state: analysis.matchingKeywords.length >= 4 ? status.positive : status.partial,
      color: analysis.matchingKeywords.length >= 4 ? pdfColors.green : pdfColors.yellow,
      note: language === "it" ? "Rendi visibili competenze tecniche e trasferibili." : "Make technical and transferable skills clearly visible."
    },
    {
      item: language === "it" ? "Esperienze" : "Experience",
      state: score >= 70 ? status.positive : status.partial,
      color: score >= 70 ? pdfColors.green : pdfColors.yellow,
      note: language === "it" ? "Collega responsabilita ed esperienze ai requisiti dell'offerta." : "Connect responsibilities and experience to the job requirements."
    },
    {
      item: language === "it" ? "Risultati misurabili" : "Measurable results",
      state: status.partial,
      color: pdfColors.yellow,
      note: language === "it" ? "Aggiungi numeri, volumi, tempi, obiettivi o impatto dove possibile." : "Add numbers, volumes, timelines, targets or impact wherever possible."
    },
    {
      item: language === "it" ? "Coerenza con l'offerta" : "Role alignment",
      state: score >= 75 ? status.positive : score >= 50 ? status.partial : status.negative,
      color: score >= 75 ? pdfColors.green : score >= 50 ? pdfColors.yellow : pdfColors.red,
      note: language === "it" ? "Il CV deve sembrare scritto per questa offerta specifica." : "The CV should feel tailored to this specific job post."
    },
    {
      item: language === "it" ? "Leggibilita ATS" : "ATS readability",
      state: status.partial,
      color: pdfColors.yellow,
      note: language === "it" ? "Mantieni layout semplice, testo selezionabile e titoli chiari." : "Keep the layout simple, text selectable and headings clear."
    }
  ];
}

function buildShortApplicationEmail(analysis: CvAnalysisResult, language: LanguageCode) {
  const strengths = analysis.strengths.slice(0, 1);
  const skills = analysis.matchingKeywords.slice(0, 2);

  if (language === "it") {
    return [
      "Oggetto: Candidatura per la posizione",
      "",
      "Gentile Responsabile della selezione,",
      "",
      `le invio la mia candidatura per la posizione. Il mio profilo risulta particolarmente coerente con il ruolo grazie a ${strengths[0] || "esperienze e competenze trasferibili rilevanti"}.${skills.length ? ` Nel CV ho valorizzato competenze come ${joinNaturalList(skills, "it")}.` : ""}`,
      "",
      "Resto a disposizione per un colloquio e per approfondire come potrei contribuire agli obiettivi del team.",
      "",
      "Cordiali saluti"
    ].join("\n");
  }

  return [
    "Subject: Application for the role",
    "",
    "Dear Hiring Manager,",
    "",
    `I am sending my application for the role. My profile is especially relevant because of ${strengths[0] || "transferable experience and role-relevant skills"}.${skills.length ? ` I have highlighted skills such as ${joinNaturalList(skills, "en")} in my CV.` : ""}`,
    "",
    "I would welcome the opportunity to discuss how I could contribute to your team's goals.",
    "",
    "Kind regards"
  ].join("\n");
}

function buildRecruiterSimulation(analysis: CvAnalysisResult, language: LanguageCode) {
  const firstStrength = analysis.strengths[0];
  const firstWeakness = analysis.weaknesses[0] || analysis.missingKeywords[0];

  if (language === "it") {
    return [
      `Nei primi 20 secondi un recruiter noterebbe soprattutto un livello di compatibilita pari a ${analysis.overallMatchScore}/100 e un rischio ATS ${analysis.atsRiskLevel}.`,
      firstStrength
        ? `Il primo elemento positivo e: ${firstStrength}. Va reso subito visibile nella parte alta del CV.`
        : "Il primo elemento positivo e la presenza di competenze potenzialmente trasferibili al ruolo.",
      firstWeakness
        ? `Il punto che potrebbe ridurre l'interesse iniziale e: ${firstWeakness}. Deve essere corretto prima dell'invio.`
        : "Il punto da migliorare e rendere piu esplicita la coerenza tra esperienze e requisiti dell'offerta.",
      "La priorita e far capire immediatamente perche questa candidatura e adatta proprio a questa posizione."
    ].join("\n");
  }

  return [
    `In the first 20 seconds, a recruiter would notice a ${analysis.overallMatchScore}/100 match score and a ${analysis.atsRiskLevel} ATS risk level.`,
    firstStrength
      ? `The first positive signal is: ${firstStrength}. It should be visible near the top of the CV.`
      : "The first positive signal is the presence of transferable skills that can be aligned with the role.",
    firstWeakness
      ? `The point that could reduce initial interest is: ${firstWeakness}. This should be corrected before applying.`
      : "The main improvement area is making the connection between experience and job requirements more explicit.",
    "The priority is to make it immediately clear why this candidate fits this specific role."
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

function joinNaturalList(items: string[], language: LanguageCode) {
  if (items.length <= 1) {
    return items[0] ?? "";
  }

  const conjunction = language === "it" ? " e " : " and ";
  return `${items.slice(0, -1).join(", ")}${conjunction}${items[items.length - 1]}`;
}

type ReportCopy = ReturnType<typeof getReportCopy>;

function getReportCopy(language: LanguageCode) {
  return language === "it"
    ? {
        generatedOn: "Generato il",
        premiumLabel: "Report Premium ATS + revisione recruiter",
        executiveSummary: "Executive summary",
        executiveEyebrow: "Sintesi professionale",
        scoreBreakdown: "Analisi punteggio ATS",
        atsMatchScore: "Punteggio di compatibilita ATS",
        overallMatch: "Compatibilita CV/offerta",
        riskLevel: "Livello di rischio ATS",
        scoreExplanation: "Il punteggio combina corrispondenza tra competenze, parole chiave, chiarezza del profilo e allineamento con l'annuncio.",
        recruiterReview: "Valutazione recruiter",
        recruiterEyebrow: "Punti forti e aree da migliorare",
        strengths: "Punti di forza",
        weaknesses: "Aree deboli",
        strengthLabel: "PUNTO FORTE",
        weaknessLabel: "DA MIGLIORARE",
        missingKeywords: "Keyword mancanti",
        matchingKeywords: "Keyword presenti",
        keywordEyebrow: "Analisi keyword",
        improvements: "Raccomandazioni operative",
        improvementsEyebrow: "Azioni concrete sul CV",
        improvementLabel: "AZIONE",
        rewrittenSummary: "Profilo professionale riscritto",
        rewrittenEyebrow: "Testo pronto da usare",
        recommendedSkills: "Competenze consigliate da aggiungere",
        optimizedCv: "Versione ottimizzata del profilo CV",
        optimizedCvEyebrow: "Asset pronti da inserire",
        suggestedHeadline: "Titolo professionale suggerito",
        improvedExperiencePhrases: "Frasi migliorate per le esperienze",
        matchTable: "Tabella di corrispondenza CV / offerta",
        matchTableEyebrow: "Requisiti, stato e azione consigliata",
        requiredRequirement: "Requisito richiesto",
        cvStatus: "Stato nel CV",
        alignmentSuggestion: "Suggerimento concreto",
        present: "Presente",
        missing: "Assente",
        partial: "Parziale",
        actionPlan: "Piano d'azione in 7 giorni",
        actionPlanEyebrow: "Roadmap pratica per candidarsi meglio",
        dayLabel: "GIORNO",
        atsChecklist: "Checklist ATS finale",
        atsChecklistEyebrow: "Controllo prima dell'invio",
        shortEmail: "Email breve di candidatura",
        shortEmailEyebrow: "Pronta da copiare al recruiter",
        recruiterSimulation: "Cosa nota un recruiter nei primi 20 secondi",
        recruiterSimulationEyebrow: "Impressione rapida e priorita",
        finalRecommendation: "Raccomandazione finale",
        finalEyebrow: "Prossima mossa consigliata",
        coverLetter: "Lettera di presentazione personalizzata",
        coverLetterEyebrow: "Pronta da copiare e adattare",
        noItems: "Nessun elemento restituito",
        noKeywords: "Nessuna keyword restituita",
        footer: "CV Match Analyzer - Report Premium",
        page: "Pagina"
      }
    : {
        generatedOn: "Generated on",
        premiumLabel: "Premium ATS + recruiter-style CV analysis",
        executiveSummary: "Executive summary",
        executiveEyebrow: "Professional snapshot",
        scoreBreakdown: "ATS score analysis",
        atsMatchScore: "ATS match score",
        overallMatch: "Overall CV to job match",
        riskLevel: "ATS risk level",
        scoreExplanation: "The score combines skill match, keyword coverage, profile clarity and alignment with the job description.",
        recruiterReview: "Recruiter review",
        recruiterEyebrow: "Strengths and improvement areas",
        strengths: "Strengths",
        weaknesses: "Weaknesses",
        strengthLabel: "STRENGTH",
        weaknessLabel: "IMPROVE",
        missingKeywords: "Missing keywords",
        matchingKeywords: "Matching keywords",
        keywordEyebrow: "Keyword analysis",
        improvements: "CV improvement actions",
        improvementsEyebrow: "Concrete next steps",
        improvementLabel: "ACTION",
        rewrittenSummary: "AI rewritten professional summary",
        rewrittenEyebrow: "Ready-to-use positioning",
        recommendedSkills: "Recommended skills to add",
        optimizedCv: "Optimized CV profile version",
        optimizedCvEyebrow: "Ready-to-use application assets",
        suggestedHeadline: "Suggested professional headline",
        improvedExperiencePhrases: "Improved experience bullet phrases",
        matchTable: "CV / Job Description match table",
        matchTableEyebrow: "Requirement, status and concrete action",
        requiredRequirement: "Required requirement",
        cvStatus: "CV status",
        alignmentSuggestion: "Concrete alignment suggestion",
        present: "Present",
        missing: "Missing",
        partial: "Partial",
        actionPlan: "7-day action plan",
        actionPlanEyebrow: "Practical roadmap to improve the application",
        dayLabel: "DAY",
        atsChecklist: "Final ATS checklist",
        atsChecklistEyebrow: "Pre-submission quality control",
        shortEmail: "Short application email",
        shortEmailEyebrow: "Ready to copy for a recruiter",
        recruiterSimulation: "What a recruiter notices in the first 20 seconds",
        recruiterSimulationEyebrow: "Fast impression and priorities",
        finalRecommendation: "Final recommendation",
        finalEyebrow: "Recruiter-ready next step",
        coverLetter: "Personalized cover letter",
        coverLetterEyebrow: "Ready to copy and adapt",
        noItems: "No items returned",
        noKeywords: "No keywords returned",
        footer: "CV Match Analyzer - Premium Report",
        page: "Page"
      };
}

function buildPremiumPdfReport(analysis: CvAnalysisResult, language: LanguageCode) {
  const renderer = createPdfRenderer();
  const copy = getReportCopy(language);
  const scoreColor = getScorePdfColor(analysis.overallMatchScore);
  const riskColor = getRiskPdfColor(analysis.atsRiskLevel);

  renderer.header(analysis, copy, language, scoreColor, riskColor);
  renderer.sectionTitle(copy.executiveSummary, copy.executiveEyebrow);
  renderer.paragraph(analysis.shortSummary, 10.5, pdfColors.muted);
  renderer.scoreSection(analysis, copy, scoreColor, riskColor);
  renderer.twoColumnLists(
    copy.recruiterReview,
    copy.recruiterEyebrow,
    copy.strengths,
    analysis.strengths,
    pdfColors.green,
    copy.strengthLabel,
    copy.weaknesses,
    analysis.weaknesses,
    pdfColors.red,
    copy.weaknessLabel
  );
  renderer.pillsSection(copy.missingKeywords, copy.keywordEyebrow, analysis.missingKeywords, pdfColors.red, copy.noKeywords);
  renderer.pillsSection(copy.matchingKeywords, copy.keywordEyebrow, analysis.matchingKeywords, pdfColors.green, copy.noKeywords);
  renderer.listSection(copy.improvements, copy.improvementsEyebrow, analysis.suggestedCvImprovements, pdfColors.blue, copy.improvementLabel, copy.noItems);
  renderer.optimizedProfileSection(analysis, copy, language);
  renderer.matchTableSection(buildRequirementRows(analysis, copy, language), copy);
  renderer.actionPlanSection(buildSevenDayPlan(analysis, language), copy);
  renderer.checklistSection(buildAtsChecklist(analysis, copy, language), copy);
  renderer.sectionTitle(copy.shortEmail, copy.shortEmailEyebrow);
  renderer.callout(buildShortApplicationEmail(analysis, language), pdfColors.blue);
  renderer.sectionTitle(copy.recruiterSimulation, copy.recruiterSimulationEyebrow);
  renderer.callout(buildRecruiterSimulation(analysis, language), pdfColors.purple);
  renderer.sectionTitle(copy.rewrittenSummary, copy.rewrittenEyebrow);
  renderer.callout(analysis.rewrittenProfessionalSummary, pdfColors.blue);
  renderer.pillsSection(copy.recommendedSkills, copy.keywordEyebrow, analysis.recommendedSkillsToAdd, pdfColors.purple, copy.noKeywords);
  renderer.sectionTitle(copy.finalRecommendation, copy.finalEyebrow);
  renderer.callout(analysis.finalRecommendation, pdfColors.cyan);
  renderer.sectionTitle(copy.coverLetter, copy.coverLetterEyebrow);
  renderer.callout(buildCoverLetterDraft(analysis, language), pdfColors.purple);
  renderer.footer(copy);

  return renderer.toPdf();
}

function createPdfRenderer() {
  const pages: PdfPage[] = [[]];
  let page = pages[0];
  let y = 742;
  const pageLeft = 58;
  const pageRight = 554;
  const pageWidth = pageRight - pageLeft;
  const pageBottom = 64;

  function ensureSpace(required: number, startNewPage = false) {
    if (startNewPage || y - required < pageBottom) {
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
    const blocks = splitPdfParagraphs(value);
    const lineGroups = blocks.map((block) => wrapPdfText(block, maxLength, 14));
    const required = lineGroups.reduce((total, lines) => total + lines.length * 15 + 8, 10);
    ensureSpace(required);
    lineGroups.forEach((lines) => {
      lines.forEach((lineText) => {
        text(lineText, x, y, size, color);
        y -= 15;
      });
      y -= 6;
    });
    y -= 4;
  }

  function sectionTitle(title: string, eyebrow?: string) {
    ensureSpace(92);
    y -= 8;
    if (eyebrow) {
      text(eyebrow.toUpperCase(), 58, y, 8, pdfColors.blue, "bold");
      y -= 15;
    }
    text(title, 58, y, 17, pdfColors.ink, "bold");
    y -= 13;
    line(pageLeft, y, pageRight, y, pdfColors.line);
    y -= 18;
  }

  function header(analysis: CvAnalysisResult, copy: ReportCopy, language: LanguageCode, scoreColor: PdfColor, riskColor: PdfColor) {
    drawPageChrome();
    rect(34, 650, 544, 108, [239, 246, 255], true);
    text("CV Match Analyzer", 58, 724, 22, pdfColors.ink, "bold");
    text(copy.premiumLabel, 58, 704, 10.5, pdfColors.muted);
    text(`${copy.generatedOn} ${formatReportDate(language)}`, 58, 686, 9, pdfColors.muted);
    text(copy.atsMatchScore.toUpperCase(), 408, 724, 8, pdfColors.muted, "bold");
    text(`${analysis.overallMatchScore}/100`, 408, 696, 30, scoreColor, "bold");
    pillBlock(`${copy.riskLevel}: ${analysis.atsRiskLevel}`, 408, 668, riskColor, 140);
    y = 620;
  }

  function pill(label: string, x: number, pillY: number, color: PdfColor, width?: number) {
    const availableWidth = Math.max(42, pageRight - x);
    const requestedWidth = width ?? Math.max(62, sanitizePdfText(label).length * 5.2 + 18);
    const pillWidth = Math.min(requestedWidth, availableWidth);
    rect(x, pillY - 5, pillWidth, 18, [248, 250, 252], true, color);
    text(fitPdfText(label, Math.max(4, Math.floor((pillWidth - 18) / 4.7))), x + 9, pillY, 8.5, color, "bold");
    return pillWidth;
  }

  function pillBlock(label: string, x: number, topY: number, color: PdfColor, maxWidth: number) {
    const width = Math.min(maxWidth, pageRight - x);
    const lines = boundedLines(label, width - 18, 8.5, 2);
    const height = Math.max(20, lines.length * 11 + 10);
    rect(x, topY - height, width, height, [248, 250, 252], true, color);
    lines.forEach((lineText, index) => text(lineText, x + 9, topY - 12 - index * 11, 8.5, color, "bold"));
    return height;
  }

  function scoreSection(analysis: CvAnalysisResult, copy: ReportCopy, scoreColor: PdfColor, riskColor: PdfColor) {
    sectionTitle(copy.scoreBreakdown, copy.atsMatchScore);
    ensureSpace(112);
    text(copy.overallMatch, 58, y, 11, pdfColors.ink, "bold");
    text(`${analysis.overallMatchScore}%`, 500, y, 13, scoreColor, "bold");
    y -= 20;
    rect(pageLeft, y, pageWidth, 12, [226, 232, 240], true);
    rect(pageLeft, y, Math.max(8, pageWidth * (analysis.overallMatchScore / 100)), 12, scoreColor, true);
    y -= 28;
    text(copy.riskLevel, 58, y, 11, pdfColors.ink, "bold");
    pillBlock(analysis.atsRiskLevel, 150, y + 6, riskColor, 92);
    y -= 22;
    paragraph(copy.scoreExplanation, 9.2, pdfColors.muted, 58, 92);
  }

  function twoColumnLists(
    title: string,
    eyebrow: string,
    leftTitle: string,
    leftItems: string[],
    leftColor: PdfColor,
    leftLabel: string,
    rightTitle: string,
    rightItems: string[],
    rightColor: PdfColor,
    rightLabel: string
  ) {
    sectionTitle(title, eyebrow);
    const startY = y;
    listBlock(leftTitle, leftItems, leftColor, leftLabel, 58, 238, false);
    const leftEndY = y;
    y = startY;
    listBlock(rightTitle, rightItems, rightColor, rightLabel, 316, 238, false);
    y = Math.min(leftEndY, y) - 4;
  }

  function listBlock(title: string, items: string[], color: PdfColor, label: string, x: number, maxWidth: number, reserveSpace = true) {
    if (reserveSpace) {
      ensureSpace(60 + items.length * 28);
    }
    rect(x, y - 8, maxWidth, 24, [248, 250, 252], true, pdfColors.line);
    text(title, x + 12, y, 11, color, "bold");
    y -= 30;
    const safeItems = items.length ? items : ["No items returned"];
    safeItems.forEach((item) => {
      const lines = boundedLines(item, maxWidth - 76, 9.2, 8);
      ensureSpace(lines.length * 13 + 10);
      text(label, x + 2, y, 7.5, color, "bold");
      lines.forEach((lineText, lineIndex) => {
        text(lineText, x + 68, y - lineIndex * 13, 9.2, pdfColors.muted);
      });
      y -= Math.max(20, lines.length * 13 + 6);
    });
  }

  function listSection(title: string, eyebrow: string, items: string[], color: PdfColor, label: string, emptyLabel: string) {
    sectionTitle(title, eyebrow);
    const safeItems = items.length ? items : [emptyLabel];
    safeItems.forEach((item) => {
      const lines = boundedLines(item, 402, 9.4, 10);
      const boxHeight = lines.length * 13 + 22;
      ensureSpace(boxHeight + 8);
      rect(pageLeft, y - lines.length * 13 - 10, pageWidth, boxHeight, [248, 250, 252], true, pdfColors.line);
      text(label, 72, y, 8, color, "bold");
      lines.forEach((lineText, index) => text(lineText, 130, y - index * 13, 9.4, pdfColors.muted));
      y -= lines.length * 13 + 28;
    });
  }

  function pillsSection(title: string, eyebrow: string, items: string[], color: PdfColor, emptyLabel: string) {
    sectionTitle(title, eyebrow);
    const safeItems = items.length ? items : [emptyLabel];
    let x = 58;
    safeItems.forEach((item) => {
      const label = sanitizePdfText(item);
      const width = Math.min(168, Math.max(64, label.length * 5.1 + 18));
      const lines = boundedLines(label, width - 18, 8.5, 3);
      const height = Math.max(20, lines.length * 11 + 10);
      if (x + width > 554) {
        x = 58;
        y -= height + 8;
      }
      ensureSpace(height + 14);
      pillBlock(label, x, y + 5, color, width);
      x += width + 8;
    });
    y -= 36;
  }

  function optimizedProfileSection(analysis: CvAnalysisResult, copy: ReportCopy, language: LanguageCode) {
    sectionTitle(copy.optimizedCv, copy.optimizedCvEyebrow);
    labeledCallout(copy.suggestedHeadline, buildSuggestedHeadline(analysis, language), pdfColors.purple);
    labeledCallout(copy.rewrittenSummary, analysis.rewrittenProfessionalSummary, pdfColors.blue);
    pillsInline(copy.recommendedSkills, analysis.recommendedSkillsToAdd, pdfColors.purple, copy.noKeywords);
    listSection(copy.improvedExperiencePhrases, copy.optimizedCvEyebrow, buildImprovedExperiencePhrases(analysis, language), pdfColors.cyan, copy.improvementLabel, copy.noItems);
  }

  function matchTableSection(
    rows: Array<{ requirement: string; status: string; color: PdfColor; suggestion: string }>,
    copy: ReportCopy
  ) {
    sectionTitle(copy.matchTable, copy.matchTableEyebrow);
    ensureSpace(70);
    rect(pageLeft, y - 12, pageWidth, 26, [239, 246, 255], true, pdfColors.line);
    text(copy.requiredRequirement, 70, y, 8, pdfColors.blue, "bold");
    text(copy.cvStatus, 225, y, 8, pdfColors.blue, "bold");
    text(copy.alignmentSuggestion, 310, y, 8, pdfColors.blue, "bold");
    y -= 30;

    rows.forEach((row) => {
      const requirementLines = boundedLines(row.requirement, 130, 9, 5);
      const statusLines = boundedLines(row.status, 70, 8.5, 2);
      const suggestionLines = boundedLines(row.suggestion, 230, 8.8, 6);
      const rowHeight = Math.max(requirementLines.length, statusLines.length, suggestionLines.length) * 13 + 22;
      ensureSpace(rowHeight + 8);
      rect(pageLeft, y - rowHeight + 8, pageWidth, rowHeight, [248, 250, 252], true, pdfColors.line);
      requirementLines.forEach((lineText, index) => text(lineText, 70, y - index * 13, 9, pdfColors.ink));
      pillBlock(row.status, 220, y + 5, row.color, 72);
      suggestionLines.forEach((lineText, index) => text(lineText, 310, y - index * 13, 8.8, pdfColors.muted));
      y -= rowHeight + 6;
    });
  }

  function actionPlanSection(items: string[], copy: ReportCopy) {
    listSection(copy.actionPlan, copy.actionPlanEyebrow, items, pdfColors.blue, copy.dayLabel, copy.noItems);
  }

  function checklistSection(
    items: Array<{ item: string; state: string; color: PdfColor; note: string }>,
    copy: ReportCopy
  ) {
    sectionTitle(copy.atsChecklist, copy.atsChecklistEyebrow);
    items.forEach((item) => {
      const itemLines = boundedLines(item.item, 128, 9.5, 3);
      const stateLines = boundedLines(item.state, 78, 8.5, 2);
      const noteLines = boundedLines(item.note, 230, 8.8, 5);
      const rowHeight = Math.max(itemLines.length, stateLines.length, noteLines.length) * 13 + 22;
      ensureSpace(rowHeight + 8);
      rect(pageLeft, y - rowHeight + 8, pageWidth, rowHeight, [248, 250, 252], true, pdfColors.line);
      itemLines.forEach((lineText, index) => text(lineText, 70, y - index * 13, 9.5, pdfColors.ink, "bold"));
      pillBlock(item.state, 212, y + 5, item.color, 82);
      noteLines.forEach((lineText, index) => text(lineText, 312, y - index * 13, 8.8, pdfColors.muted));
      y -= rowHeight + 6;
    });
  }

  function labeledCallout(label: string, value: string, color: PdfColor) {
    ensureSpace(88);
    text(label.toUpperCase(), 58, y, 8, color, "bold");
    y -= 14;
    callout(value, color);
  }

  function pillsInline(title: string, items: string[], color: PdfColor, emptyLabel: string) {
    ensureSpace(70);
    text(title, 58, y, 11, pdfColors.ink, "bold");
    y -= 22;
    const safeItems = items.length ? items : [emptyLabel];
    let x = 58;
    safeItems.slice(0, 8).forEach((item) => {
      const label = sanitizePdfText(item);
      const width = Math.min(168, Math.max(58, label.length * 5 + 18));
      const lines = boundedLines(label, width - 18, 8.5, 3);
      const height = Math.max(20, lines.length * 11 + 10);
      if (x + width > 554) {
        x = 58;
        y -= height + 8;
      }
      ensureSpace(height + 12);
      pillBlock(label, x, y + 5, color, width);
      x += width + 8;
    });
    y -= 36;
  }

  function callout(value: string, color: PdfColor) {
    const groups = splitPdfParagraphs(value).map((block) => boundedLines(block, 464, 10, 18));
    const required = groups.reduce((total, lines) => total + lines.length * 15 + 8, 34);
    ensureSpace(Math.min(required, 280));
    groups.forEach((lines) => {
      const blockHeight = lines.length * 15 + 20;
      ensureSpace(blockHeight + 8);
      rect(pageLeft, y - lines.length * 15 - 12, pageWidth, lines.length * 15 + 28, [248, 250, 252], true, pdfColors.line);
      rect(pageLeft, y - lines.length * 15 - 12, 4, lines.length * 15 + 28, color, true);
      lines.forEach((lineText, index) => text(lineText, 76, y - index * 15, 10, pdfColors.muted));
      y -= lines.length * 15 + 28;
    });
    y -= 4;
  }

  function footer(copy: ReportCopy) {
    pages.forEach((pdfPage, index) => {
      pdfPage.push(`BT ${rgb(pdfColors.muted)} rg /F1 8 Tf 58 24 Td (${escapePdfText(`${copy.footer} - ${copy.page} ${index + 1}/${pages.length}`)}) Tj ET`);
    });
  }

  function toPdf() {
    return serializePdf(pages);
  }

  return {
    callout,
    footer,
    header,
    actionPlanSection,
    checklistSection,
    matchTableSection,
    listSection,
    optimizedProfileSection,
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

function boundedLines(text: string, maxWidth: number, fontSize: number, maxLines = 12) {
  return wrapPdfText(text, Math.max(8, Math.floor(maxWidth / (fontSize * 0.52))), maxLines);
}

function wrapPdfText(text: string, maxLength: number, maxLines = Number.POSITIVE_INFINITY) {
  const sanitized = sanitizePdfText(text);
  if (!sanitized) {
    return [""];
  }

  const words = sanitized.split(/\s+/).flatMap((word) => splitLongPdfWord(word, maxLength));
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

  if (lines.length <= maxLines) {
    return lines;
  }

  const bounded = lines.slice(0, maxLines);
  bounded[bounded.length - 1] = fitPdfText(`${bounded[bounded.length - 1]}...`, maxLength);
  return bounded;
}

function splitLongPdfWord(word: string, maxLength: number) {
  if (word.length <= maxLength) {
    return [word];
  }

  const chunks: string[] = [];
  for (let index = 0; index < word.length; index += Math.max(4, maxLength - 1)) {
    const chunk = word.slice(index, index + Math.max(4, maxLength - 1));
    chunks.push(index + Math.max(4, maxLength - 1) < word.length ? `${chunk}-` : chunk);
  }

  return chunks;
}

function fitPdfText(text: string, maxLength: number) {
  const sanitized = sanitizePdfText(text);
  if (sanitized.length <= maxLength) {
    return sanitized;
  }

  return `${sanitized.slice(0, Math.max(1, maxLength - 3)).trim()}...`;
}

function splitPdfParagraphs(text: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => sanitizePdfText(paragraph))
    .filter(Boolean);

  return paragraphs.length ? paragraphs : [sanitizePdfText(text)];
}

function formatReportDate(language: LanguageCode) {
  return new Intl.DateTimeFormat(language === "it" ? "it-IT" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date());
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
