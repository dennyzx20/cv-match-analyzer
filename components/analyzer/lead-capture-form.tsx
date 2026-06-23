"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LeadCapture } from "@/lib/types";

type LeadCaptureFormProps = {
  onContinue: (values: LeadCapture) => void;
  onBack: () => void;
};

export function LeadCaptureForm({ onContinue, onBack }: LeadCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [sendReportByEmail, setSendReportByEmail] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address or leave the field empty.");
      return;
    }

    if (sendReportByEmail && !email) {
      setError("Add your email address to receive the report by email.");
      return;
    }

    onContinue({
      email: email.trim(),
      sendReportByEmail
    });
  }

  return (
    <div className="glass-card mx-auto max-w-2xl rounded-2xl p-5 md:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
          <Mail size={21} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Your analysis is ready</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Where should we send your report?</h2>
          <p className="mt-2 leading-7 text-slate-600">
            Email is optional for this MVP. Your choice is kept only in this browser session.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-900" htmlFor="lead-email">
            Email address
          </label>
          <input
            id="lead-email"
            type="email"
            className="focus-ring mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <input
            type="checkbox"
            className="focus-ring mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
            checked={sendReportByEmail}
            onChange={(event) => setSendReportByEmail(event.target.checked)}
          />
          <span>
            <span className="font-semibold text-slate-950">Send me my report by email</span>
            <span className="block pt-1">Email delivery will be connected later. For now this only captures intent.</span>
          </span>
        </label>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20">
            Show free preview
            <ArrowRight size={17} aria-hidden="true" />
          </Button>
          <Button type="button" variant="secondary" className="rounded-xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-50" onClick={onBack}>
            Analyze another CV
          </Button>
        </div>
      </form>
    </div>
  );
}
