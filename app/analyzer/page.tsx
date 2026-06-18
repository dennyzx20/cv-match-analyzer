import { AnalyzerShell } from "@/components/analyzer/analyzer-shell";
import { SiteHeader } from "@/components/marketing/site-header";

export default function AnalyzerPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0B0F1A] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.28),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.16),transparent_30%),linear-gradient(180deg,#0B0F1A_0%,#101525_52%,#0B0F1A_100%)]" />
      <div className="relative">
      <SiteHeader />
      <AnalyzerShell />
      </div>
    </main>
  );
}
