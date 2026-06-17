import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const proofPoints = ["ATS-style score", "Keyword gap analysis", "Recruiter-grade recommendations"];

export function Hero() {
  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-600">
            AI resume screening assistant
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink md:text-6xl">
            Find out why your CV is not getting interviews
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Upload your CV, paste a job description, and get an ATS-style match score with practical suggestions in less
            than 60 seconds.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/analyzer">
              Analyze my CV
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
            <Button href="#how-it-works" variant="secondary">
              See how it works
            </Button>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-muted sm:grid-cols-3">
            {proofPoints.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-signal-green" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4 shadow-soft">
          <div className="rounded-md bg-white p-5">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="text-sm font-semibold text-ink">Match Report</p>
                <p className="text-xs text-muted">Product Manager role</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-brand-600">74</p>
                <p className="text-xs text-muted">ATS score</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {[
                ["Missing keywords", "Roadmapping, stakeholder management, SQL"],
                ["Strengths", "Clear product ownership and measurable delivery impact"],
                ["Top improvement", "Add target role keywords to the summary and skills section"]
              ].map(([title, text]) => (
                <div key={title} className="rounded-md border border-line p-4">
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
