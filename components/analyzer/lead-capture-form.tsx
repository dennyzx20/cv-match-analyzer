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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 to-violet-500/25 text-cyan-200 shadow-[0_0_40px_rgba(99,102,241,0.22)]">
          <Mail size={21} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Your analysis is ready</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Where should we send your report?</h2>
          <p className="mt-2 leading-7 text-slate-400">
            Email is optional for this MVP. Your choice is kept only in this browser session.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-semibold text-white" htmlFor="lead-email">
            Email address
          </label>
          <input
            id="lead-email"
            type="email"
            className="focus-ring mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-slate-500"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-400">
          <input
            type="checkbox"
            className="focus-ring mt-1 h-4 w-4 rounded border-white/20 bg-black/20 text-indigo-500"
            checked={sendReportByEmail}
            onChange={(event) => setSendReportByEmail(event.target.checked)}
          />
          <span>
            <span className="font-semibold text-white">Send me my report by email</span>
            <span className="block pt-1">Email delivery will be connected later. For now this only captures intent.</span>
          </span>
        </label>

        {error ? <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
            Show free preview
            <ArrowRight size={17} aria-hidden="true" />
          </Button>
          <Button type="button" variant="secondary" className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={onBack}>
            Analyze another CV
          </Button>
        </div>
      </form>
    </div>
  );
}
