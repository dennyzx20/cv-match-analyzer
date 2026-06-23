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
        <section className="glass-card rounded-2xl p-5 transition duration-200 hover:-translate-y-0.5 md:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Step 1</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Upload CV</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">PDF only, maximum 5MB. Drag and drop or browse.</p>
          </div>

          <label
            htmlFor="cv-upload"
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "focus-ring group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed p-8 text-center transition duration-200",
              "bg-slate-50 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-white hover:shadow-lg hover:shadow-blue-100/70",
              isDragging ? "scale-[1.01] border-blue-500 bg-blue-50" : "border-slate-300",
              file ? "border-blue-500 bg-blue-50" : ""
            )}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-sm transition group-hover:scale-105">
              {file ? <FileText size={32} aria-hidden="true" /> : <UploadCloud size={34} aria-hidden="true" />}
            </div>
            <p className="relative mt-6 max-w-sm break-words text-xl font-bold text-slate-950">{fileLabel}</p>
            <p className="relative mt-2 max-w-sm text-sm leading-6 text-slate-600">
              {file ? "File attached and ready for AI analysis." : "Upload a clean PDF CV for the most accurate ATS score."}
            </p>
            <span className="relative mt-6 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-blue-700 shadow-sm transition group-hover:bg-blue-50">
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

        <section className="glass-card rounded-2xl p-5 transition duration-200 hover:-translate-y-0.5 md:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Step 2</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Paste job description</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use the exact role text you want to target.</p>
          </div>

          <textarea
            id="job-description"
            className="focus-ring min-h-[320px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm leading-7 text-slate-900 shadow-inner shadow-slate-100 placeholder:text-slate-400"
            placeholder="Example: Retail sales assistant for a supermarket. Responsibilities include customer service, cash desk support, shelf restocking, inventory checks, teamwork, and availability for shifts..."
            value={jobDescription}
            onChange={(event) => {
              setClientError("");
              setJobDescription(event.target.value);
            }}
            disabled={isLoading}
          />

          <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className={characterCount >= minimumJobDescriptionLength ? "text-emerald-600" : "text-slate-500"}>
              {characterCount}/{minimumJobDescriptionLength} characters minimum
            </span>
            <span className="text-slate-500">Better input, sharper recommendations.</span>
          </div>
        </section>
      </div>

      <div className="glass-card mt-5 rounded-2xl p-4 md:flex md:items-center md:justify-between md:gap-5">
        <div>
          <p className="font-semibold text-slate-950">Ready to optimize?</p>
          <p className="mt-1 text-sm text-slate-600">Get instant ATS optimization report</p>
        </div>
        <Button
          type="submit"
          disabled={!canAnalyze}
          className="mt-4 h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 text-base shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/25 disabled:shadow-none md:mt-0 md:w-auto"
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
    <div className="fixed right-5 top-20 z-40 max-w-md rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm leading-6 text-red-700 shadow-xl shadow-red-100">
      <div className="flex items-start gap-2">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-300" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-white/90 px-5">
      <div className="glass-card w-full max-w-md rounded-2xl p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm">
          <ScanSearch size={26} aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-950">Analyzing CV with AI...</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Extracting PDF text, detecting language, and preparing your ATS optimization report.
        </p>
        <div className="mt-6 space-y-3">
          <div className="shimmer h-3 rounded-full bg-slate-100" />
          <div className="shimmer mx-auto h-3 w-4/5 rounded-full bg-slate-100" />
          <div className="shimmer mx-auto h-3 w-2/3 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
