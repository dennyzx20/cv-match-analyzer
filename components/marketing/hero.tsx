import { ArrowRight, CheckCircle2, FileText, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const proofPoints = ["Free ATS preview", "Language-aware AI report", "Stripe-secured full report"];

export function Hero() {
  return (
    <section className="relative pt-20 md:pt-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 md:grid-cols-[1.02fr_0.98fr] md:pb-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            <Sparkles size={16} aria-hidden="true" />
            AI resume optimization for real jobs
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.04] tracking-tight text-slate-950 md:text-7xl">
            Turn your CV into a job-winning profile
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
            AI analyzes your CV against real job descriptions and shows exactly what to improve.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              href="/analyzer"
              className="h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-6 text-base shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-400 hover:to-violet-400 hover:shadow-xl"
            >
              Analyze your CV
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <Button
              href="/analyzer"
              variant="secondary"
              className="h-12 rounded-xl border-slate-200 bg-white px-6 text-base text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Try free demo
            </Button>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            {proofPoints.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-500" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-200/60 via-violet-200/50 to-cyan-200/60 blur-2xl" />
          <div className="relative rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-200/50">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/25">
                    <FileText size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-950">CV Match Report</p>
                    <p className="text-sm text-slate-500">Marketing Manager role</p>
                  </div>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">Low risk</div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[0.72fr_1fr]">
                <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[conic-gradient(#3B82F6_0_82%,#E5E7EB_82%)]">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
                      <span className="text-3xl font-bold text-slate-950">82</span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-bold uppercase tracking-wide text-slate-500">ATS Score</p>
                </div>

                <div className="space-y-3">
                  {[
                    ["Missing keywords", "Lifecycle, campaign analytics"],
                    ["Strength", "Strong growth and CRM experience"],
                    ["AI recommendation", "Quantify campaign impact in summary"]
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5">
                      <div className="flex items-start gap-3">
                        <Target size={17} className="mt-1 text-blue-500" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-bold text-slate-950">{title}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
