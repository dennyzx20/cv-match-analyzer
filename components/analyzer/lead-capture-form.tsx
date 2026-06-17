"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <Card className="mx-auto max-w-2xl p-5 md:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
          <Mail size={21} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Your analysis is ready</p>
          <h2 className="mt-2 text-2xl font-bold text-ink">Where should we send your report?</h2>
          <p className="mt-2 leading-7 text-muted">
            Email is optional for this MVP. Your choice is kept only in this browser session.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="text-sm font-semibold text-ink" htmlFor="lead-email">
            Email address
          </label>
          <input
            id="lead-email"
            type="email"
            className="focus-ring mt-2 h-11 w-full rounded-md border border-line bg-white px-4 text-sm text-ink placeholder:text-muted"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <label className="flex items-start gap-3 rounded-md border border-line bg-surface p-4 text-sm text-muted">
          <input
            type="checkbox"
            className="focus-ring mt-1 h-4 w-4 rounded border-line text-brand-600"
            checked={sendReportByEmail}
            onChange={(event) => setSendReportByEmail(event.target.checked)}
          />
          <span>
            <span className="font-semibold text-ink">Send me my report by email</span>
            <span className="block pt-1">Email delivery will be connected later. For now this only captures intent.</span>
          </span>
        </label>

        {error ? <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-signal-red">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit">
            Show free preview
            <ArrowRight size={17} aria-hidden="true" />
          </Button>
          <Button type="button" variant="secondary" onClick={onBack}>
            Analyze another CV
          </Button>
        </div>
      </form>
    </Card>
  );
}
