import { AnalyzerShell } from "@/components/analyzer/analyzer-shell";
import { SiteHeader } from "@/components/marketing/site-header";

export default function AnalyzerPage() {
  return (
    <main className="min-h-screen bg-surface">
      <SiteHeader />
      <AnalyzerShell />
    </main>
  );
}
