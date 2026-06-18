import { Brain, Gauge, SearchCheck } from "lucide-react";

const features = [
  {
    icon: Gauge,
    title: "ATS Score Analysis",
    description: "Get a clear match score that shows how well your CV fits the role before you apply.",
    accent: "from-blue-50 to-blue-100 text-blue-600"
  },
  {
    icon: SearchCheck,
    title: "Keyword Gap Detection",
    description: "Spot missing role-specific keywords that recruiters and ATS tools are likely to scan for.",
    accent: "from-violet-50 to-violet-100 text-violet-600"
  },
  {
    icon: Brain,
    title: "AI CV Optimization",
    description: "Receive practical suggestions and a rewritten professional summary tailored to the job.",
    accent: "from-cyan-50 to-cyan-100 text-cyan-600"
  }
];

export function Features() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Why it works</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Everything you need to improve before applying
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            A fast, focused report that turns a job description into specific CV improvements.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/70"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent}`}>
                <feature.icon size={23} aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-950">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
