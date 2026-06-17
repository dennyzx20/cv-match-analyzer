"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, FileText, Loader2, ScanSearch, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const maxFileSize = 5 * 1024 * 1024;

type AnalyzerFormProps = {
  onAnalyze: (file: File, jobDescription: string) => Promise<void>;
  error: string;
  isLoading: boolean;
};

export function AnalyzerForm({ onAnalyze, error, isLoading }: AnalyzerFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [clientError, setClientError] = useState("");

  const fileLabel = useMemo(() => {
    if (!file) {
      return "Choose a PDF CV";
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError("");

    if (!file) {
      setClientError("Upload your CV as a PDF file before starting the analysis.");
      return;
    }

    if (!jobDescription.trim()) {
      setClientError("Paste the job description so we can compare your CV against the role.");
      return;
    }

    await onAnalyze(file, jobDescription.trim());
  }

  const visibleError = clientError || error;

  return (
    <Card className="relative overflow-hidden p-5 md:p-7">
      {isLoading ? <ProfessionalLoading /> : null}
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <label className="text-sm font-semibold text-ink" htmlFor="cv-upload">
            CV PDF
          </label>
          <div className="mt-3 rounded-lg border border-dashed border-line bg-surface p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                {file ? <FileText size={22} aria-hidden="true" /> : <UploadCloud size={22} aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-ink">{fileLabel}</p>
                <p className="mt-1 text-sm leading-6 text-muted">PDF only, maximum size 5MB.</p>
                <input
                  id="cv-upload"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="focus-ring mt-4 block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-700"
                  onChange={(event) => onFileChange(event.target.files?.[0])}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink" htmlFor="job-description">
            Job description
          </label>
          <textarea
            id="job-description"
            className="focus-ring mt-3 min-h-[280px] w-full resize-y rounded-md border border-line bg-white px-4 py-3 text-sm leading-6 text-ink placeholder:text-muted"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="lg:col-span-2">
          {visibleError ? (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-signal-red">
              <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{visibleError}</span>
            </div>
          ) : null}

          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Analyzing CV
              </>
            ) : (
              "Analyze CV"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ProfessionalLoading() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/85 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-line bg-white p-5 text-center shadow-soft">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-brand-50 text-brand-600">
          <ScanSearch size={24} aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-ink">Analyzing your CV match</h3>
        <p className="mt-2 text-sm leading-6 text-muted">
          Extracting PDF text, comparing the job requirements, and preparing your ATS-style preview.
        </p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-brand-50">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-600" />
        </div>
      </div>
    </div>
  );
}
