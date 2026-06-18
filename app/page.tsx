import { FAQ } from "@/components/marketing/faq";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Pricing } from "@/components/marketing/pricing";
import { SiteHeader } from "@/components/marketing/site-header";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8FAFC] text-slate-950">
      <SiteHeader variant="light" />
      <div className="relative">
        <div className="pointer-events-none absolute left-[-12rem] top-10 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-[-10rem] top-44 h-96 w-96 rounded-full bg-violet-200/45 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-[38rem] h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl" />
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
      </div>
    </main>
  );
}
