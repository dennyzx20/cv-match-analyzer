import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader({ variant = "dark" }: { variant?: "light" | "dark" }) {
  const isLight = variant === "light";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-xl",
        isLight ? "border-slate-200/80 bg-white/80" : "border-white/10 bg-[#0B0F1A]/70"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className={cn("flex items-center gap-2 text-sm font-bold", isLight ? "text-slate-950" : "text-white")}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/20">
            <FileSearch size={18} aria-hidden="true" />
          </span>
          CV Match Analyzer
        </Link>
        <nav className={cn("hidden items-center gap-7 text-sm font-medium md:flex", isLight ? "text-slate-600" : "text-slate-400")}>
          <a href="/#how-it-works" className={isLight ? "hover:text-slate-950" : "hover:text-white"}>
            How it works
          </a>
          <a href="/#pricing" className={isLight ? "hover:text-slate-950" : "hover:text-white"}>
            Pricing
          </a>
          <a href="/#faq" className={isLight ? "hover:text-slate-950" : "hover:text-white"}>
            FAQ
          </a>
        </nav>
        <Button href="/analyzer" className="h-10 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 px-4 shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-400 hover:to-violet-400">
          Analyze my CV
        </Button>
      </div>
    </header>
  );
}
