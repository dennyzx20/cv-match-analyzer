"use client";

import { DragEvent, FormEvent, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, FileText, Loader2, ScanSearch, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const maxFileSize = 5 * 1024 * 1024;
const minimumJobDescriptionLength = 80;

type AnalyzerFormProps = {
  onAnalyze: (file: File, jobDescription: string) => Promise<void>;
  error: string;
  isLoading: boolean;
};

export function AnalyzerForm({ onAnalyze, error, isLoading }: AnalyzerFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [clientError, setClientError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const characterCount = jobDescription.trim().length;
  const canAnalyze = Boolean(file) && characterCount >= minimumJobDescriptionLength && !isLoading;
  const visibleError = clientError || error;

  const fileLabel = useMemo(() => {
    if (!file) {
      return "Drop your CV here";
    }

    return `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  }, [file]);

  function onFileChange(selectedFile: File | undefined) {
    setClientError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFile(null);
      setClientError("This file format is not supported. Upload a PDF version of your CV.");
      return;
    }

    if (selectedFile.size > maxFileSize) {
      setFile(null);
      setClientError("This PDF is too large. Upload a file that is 5MB or smaller.");
      return;
    }

    setFile(selectedFile);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    onFileChange(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError("");

    if (!file) {
      setClientError("Upload your CV as a PDF file before starting the analysis.");
      return;
    }

    if (characterCount < minimumJobDescriptionLength) {
      setClientError("Paste a more detailed job description so the match score can be accurate.");
      return;
    }

    await onAnalyze(file, jobDescription.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {visibleError ? <Toast message={visibleError} /> : null}
      {isLoading ? <LoadingOverlay /> : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="glass-card rounded-2xl p-5 transition duration-300 hover:scale-[1.01] md:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Step 1</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Upload CV</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">PDF only, maximum 5MB. Drag and drop or browse.</p>
          </div>

          <label
            htmlFor="cv-upload"
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "focus-ring group relative flex min-h-[420px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed p-8 text-center transition duration-300",
              "bg-white/[0.035] hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-white/[0.06] hover:shadow-[0_0_60px_rgba(99,102,241,0.25)]",
              isDragging ? "scale-[1.01] border-cyan-300 shadow-[0_0_70px_rgba(34,211,238,0.26)]" : "border-white/15",
              file ? "border-indigo-400/70 bg-indigo-500/10" : ""
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18),transparent_55%)] opacity-0 transition group-hover:opacity-100" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-cyan-200 shadow-[0_0_45px_rgba(99,102,241,0.35)] transition group-hover:scale-110">
              {file ? <FileText size={36} aria-hidden="true" /> : <UploadCloud size={38} className="animate-[soft-float_3s_ease-in-out_infinite]" aria-hidden="true" />}
            </div>
            <p className="relative mt-6 max-w-sm break-words text-xl font-bold text-white">{fileLabel}</p>
            <p className="relative mt-2 max-w-sm text-sm leading-6 text-slate-400">
              {file ? "File attached and ready for AI analysis." : "Upload a clean PDF CV for the most accurate ATS score."}
            </p>
            <span className="relative mt-6 rounded-full border border-white/10 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition group-hover:bg-white/15">
              Choose PDF
            </span>
            <input
              id="cv-upload"
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(event) => onFileChange(event.target.files?.[0])}
              disabled={isLoading}
            />
          </label>
        </section>

        <section className="glass-card rounded-2xl p-5 transition duration-300 hover:scale-[1.01] md:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Step 2</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Paste job description</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Use the exact role text you want to target.</p>
          </div>

          <textarea
            id="job-description"
            className="focus-ring min-h-[420px] w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-sm leading-7 text-white shadow-inner placeholder:text-slate-500"
            placeholder="Example: Retail sales assistant for a supermarket. Responsibilities include customer service, cash desk support, shelf restocking, inventory checks, teamwork, and availability for shifts..."
            value={jobDescription}
            onChange={(event) => {
              setClientError("");
              setJobDescription(event.target.value);
            }}
            disabled={isLoading}
          />

          <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className={characterCount >= minimumJobDescriptionLength ? "text-emerald-300" : "text-slate-400"}>
              {characterCount}/{minimumJobDescriptionLength} characters minimum
            </span>
            <span className="text-slate-500">Better input, sharper recommendations.</span>
          </div>
        </section>
      </div>

      <div className="glass-card mt-5 rounded-2xl p-4 md:flex md:items-center md:justify-between md:gap-5">
        <div>
          <p className="font-semibold text-white">Ready to optimize?</p>
          <p className="mt-1 text-sm text-slate-400">Get instant ATS optimization report</p>
        </div>
        <Button
          type="submit"
          disabled={!canAnalyze}
          className="animate-gradient mt-4 h-14 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-500 to-violet-500 px-8 text-base shadow-[0_0_36px_rgba(99,102,241,0.35)] transition duration-300 hover:scale-[1.02] hover:shadow-[0_0_56px_rgba(139,92,246,0.45)] disabled:shadow-none md:mt-0 md:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 size={19} className="animate-spin" aria-hidden="true" />
              Analyzing CV
            </>
          ) : (
            <>
              Analyze CV with AI
              <ArrowRight size={19} aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed right-5 top-20 z-40 max-w-md rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100 shadow-[0_20px_70px_rgba(239,68,68,0.2)] backdrop-blur-xl">
      <div className="flex items-start gap-2">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-300" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-[#0B0F1A]/80 px-5 backdrop-blur-md">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-cyan-200 shadow-[0_0_44px_rgba(99,102,241,0.32)]">
          <ScanSearch size={26} aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">Analyzing CV with AI...</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Extracting PDF text, detecting language, and preparing your ATS optimization report.
        </p>
        <div className="mt-6 space-y-3">
          <div className="shimmer h-3 rounded-full bg-white/10" />
          <div className="shimmer mx-auto h-3 w-4/5 rounded-full bg-white/10" />
          <div className="shimmer mx-auto h-3 w-2/3 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}
