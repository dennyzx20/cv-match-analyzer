import { FAQ } from "@/components/marketing/faq";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Pricing } from "@/components/marketing/pricing";
import { SiteHeader } from "@/components/marketing/site-header";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface">
      <SiteHeader />
      <Hero />
      <HowItWorks />
      <Pricing />
      <FAQ />
    </main>
  );
}
