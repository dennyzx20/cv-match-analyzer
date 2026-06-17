const faqs = [
  {
    question: "Does this replace a recruiter?",
    answer: "No. It helps you spot relevance gaps before a recruiter or ATS screens your CV."
  },
  {
    question: "Do you store my CV?",
    answer: "No database is included in this MVP. The file is processed for the current analysis request only."
  },
  {
    question: "Can it analyze scanned PDFs?",
    answer: "Not in this version. Upload a text-based PDF so the server can extract the CV text."
  },
  {
    question: "Can I add login and payments later?",
    answer: "Yes. The app is structured so auth, Stripe, and analysis history can be added later."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="bg-surface py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold text-ink">Common questions</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-lg border border-line bg-white p-6">
              <h3 className="font-semibold text-ink">{faq.question}</h3>
              <p className="mt-2 leading-7 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
