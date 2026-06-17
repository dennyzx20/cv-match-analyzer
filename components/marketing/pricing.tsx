import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free Preview",
    price: "€0",
    description: "See your ATS score, risk level, summary, and a limited keyword preview.",
    features: ["ATS-style score", "Risk level", "Top 3 missing keywords", "Top 3 strengths"],
    cta: "Analyze my CV",
    href: "/analyzer",
    featured: false
  },
  {
    name: "Full Report",
    price: "€19",
    description: "Unlock the complete ATS report and concrete CV improvement guidance.",
    features: ["All keyword gaps", "Weaknesses and improvements", "Rewritten summary", "Final recommendation"],
    cta: "Start with free preview",
    href: "/analyzer",
    featured: true
  },
  {
    name: "Premium CV Rewrite",
    price: "Coming soon",
    description: "A deeper rewrite workflow for candidates who want a polished role-specific CV.",
    features: ["Full CV rewrite", "Role positioning", "Recruiter-style editing", "Export-ready structure"],
    cta: "Coming soon",
    href: undefined,
    featured: false
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-line bg-white py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold text-ink">Start free, unlock the full report when it matters</h2>
          <p className="mt-4 leading-7 text-muted">
            The paywall is mocked for this MVP. Stripe can be added later without changing the analysis flow.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border p-6 ${
                plan.featured ? "border-brand-100 bg-brand-50 shadow-soft" : "border-line bg-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
                  <p className="mt-2 min-h-14 text-sm leading-6 text-muted">{plan.description}</p>
                </div>
                {plan.price === "Coming soon" ? <Clock size={20} className="text-brand-600" aria-hidden="true" /> : null}
              </div>
              <p className="mt-6 text-3xl font-bold text-ink">{plan.price}</p>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm text-muted">
                    <Check size={17} className="mt-0.5 text-signal-green" aria-hidden="true" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {plan.href ? (
                <Button href={plan.href} className="mt-6 w-full" variant={plan.featured ? "primary" : "secondary"}>
                  {plan.cta}
                </Button>
              ) : (
                <Button type="button" disabled className="mt-6 w-full" variant="secondary">
                  {plan.cta}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
