import { AnalyzerShell } from "@/components/analyzer/analyzer-shell";
import { SiteHeader } from "@/components/marketing/site-header";

export default function AnalyzerPage() {
  const adminBypassEnabled = process.env.ADMIN_BYPASS_PAYMENT === "true";

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(139,92,246,0.12),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_45%,#f8fafc_100%)]" />
      <div className="relative">
        <SiteHeader variant="light" />
        <AnalyzerShell adminBypassEnabled={adminBypassEnabled} />
      </div>
    </main>
  );
}
