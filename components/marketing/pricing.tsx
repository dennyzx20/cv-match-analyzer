import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const included = [
  "Full ATS score breakdown",
  "All missing keywords",
  "AI rewritten professional summary",
  "Personalized CV improvement strategy"
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Start free, unlock the full strategy when you are ready
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            The preview is free. The complete report is a single payment with no subscription.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-[1.6rem] bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 p-[1px] shadow-2xl shadow-blue-200/60">
          <div className="rounded-[1.55rem] bg-white p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                  <Sparkles size={15} aria-hidden="true" />
                  Full Report
                </div>
                <h3 className="mt-5 text-3xl font-bold text-slate-950">One-time payment – €19</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Unlock the complete AI report with ATS breakdown, keyword gaps and a practical CV optimization plan.
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <ShieldCheck size={17} className="text-emerald-500" aria-hidden="true" />
                  Secure checkout via Stripe
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Includes</p>
                <div className="mt-4 space-y-3">
                  {included.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                      <Check size={17} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  href="/analyzer"
                  className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-base shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-400 hover:to-violet-400"
                >
                  Start now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
