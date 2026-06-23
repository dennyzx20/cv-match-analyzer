import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Base",
    price: "9,99\u20ac",
    description: "Essential CV-to-job match analysis with the key actions needed to improve your application.",
    features: [
      "CV and job post upload",
      "Compatibility analysis and match score",
      "3 strengths, 3 key weaknesses and concise improvement tips"
    ],
    cta: "Start Base"
  },
  {
    name: "Premium",
    price: "19,99\u20ac",
    description: "Everything in Base plus the complete premium report and deeper CV optimization assets.",
    features: [
      "Complete detailed report",
      "In-depth suggestions and rewritten CV sections",
      "Personalized cover letter draft and PDF download"
    ],
    cta: "Start Premium",
    featured: true
  }
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
            The preview is free. Choose Base or Premium when you are ready to unlock the full report.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl rounded-[1.6rem] bg-gradient-to-r from-blue-500 via-violet-500 to-cyan-500 p-[1px] shadow-2xl shadow-blue-200/60">
          <div className="rounded-[1.55rem] bg-white p-6 md:p-8">
            <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                  <Sparkles size={15} aria-hidden="true" />
                  Paid reports
                </div>
                <h3 className="mt-5 text-3xl font-bold text-slate-950">Base 9,99{"\u20ac"} or Premium 19,99{"\u20ac"}</h3>
                <p className="mt-3 leading-7 text-slate-600">
                  Unlock the complete AI report with ATS breakdown, keyword gaps and a practical CV optimization plan.
                </p>
                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <ShieldCheck size={17} className="text-emerald-500" aria-hidden="true" />
                  Secure checkout via Stripe
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {plans.map((plan) => (
                  <div key={plan.name} className={`rounded-2xl border p-5 ${plan.featured ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"}`}>
                    <p className="text-sm font-bold uppercase tracking-wide text-blue-700">{plan.name}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-950">{plan.price}</p>
                    <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">{plan.description}</p>
                    <div className="mt-4 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2 text-sm leading-6 text-slate-700">
                          <Check size={17} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      href="/analyzer"
                      className={`mt-6 h-12 w-full rounded-xl text-base transition hover:-translate-y-0.5 ${plan.featured ? "bg-gradient-to-r from-blue-500 to-violet-500 shadow-lg shadow-blue-500/20 hover:from-blue-400 hover:to-violet-400" : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"}`}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
