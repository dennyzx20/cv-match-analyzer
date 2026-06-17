import { ClipboardPaste, FileUp, Sparkles } from "lucide-react";

const steps = [
  {
    icon: FileUp,
    title: "Upload your CV",
    description: "Add a text-based PDF CV up to 5MB. The app extracts the text on the server."
  },
  {
    icon: ClipboardPaste,
    title: "Paste the role",
    description: "Use the job description you want to target so the analysis stays specific."
  },
  {
    icon: Sparkles,
    title: "Get the report",
    description: "Review your score, missing keywords, risks, strengths, and concrete edits."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-line bg-surface py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">How it works</p>
          <h2 className="mt-3 text-3xl font-bold text-ink">From upload to actionable CV edits in one flow</h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-lg border border-line bg-white p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                <step.icon size={21} aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 leading-7 text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
