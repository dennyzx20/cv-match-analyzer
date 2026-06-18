import { ClipboardPaste, FileUp, Sparkles } from "lucide-react";

const steps = [
  {
    icon: FileUp,
    title: "Upload CV",
    description: "Add your PDF CV. The app extracts the text securely for the current analysis.",
    accent: "bg-blue-50 text-blue-600 border-blue-100"
  },
  {
    icon: ClipboardPaste,
    title: "Paste job description",
    description: "Use the exact role you want so the AI can compare your profile against real requirements.",
    accent: "bg-violet-50 text-violet-600 border-violet-100"
  },
  {
    icon: Sparkles,
    title: "Get AI report",
    description: "Review your score, keyword gaps, strengths and CV optimization suggestions.",
    accent: "bg-cyan-50 text-cyan-600 border-cyan-100"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">How it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            From CV upload to targeted improvements
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            A simple three-step flow designed to help you understand why a CV is or is not matching a role.
          </p>
        </div>

        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-blue-200 via-violet-200 to-cyan-200 md:block" />
          {steps.map((step, index) => (
            <div key={step.title} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/60">
              <div className="flex items-center gap-4">
                <div className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border ${step.accent}`}>
                  <step.icon size={24} aria-hidden="true" />
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                  {index + 1}
                </div>
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-950">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
