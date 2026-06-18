import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-[#0B0F1A]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
            <FileSearch size={18} aria-hidden="true" />
          </span>
          CV Match Analyzer
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-400 md:flex">
          <a href="/#how-it-works" className="hover:text-white">
            How it works
          </a>
          <a href="/#pricing" className="hover:text-white">
            Pricing
          </a>
          <a href="/#faq" className="hover:text-white">
            FAQ
          </a>
        </nav>
        <Button href="/analyzer" className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 shadow-lg shadow-indigo-500/20 hover:from-indigo-400 hover:to-violet-400">
          Analyze my CV
        </Button>
      </div>
    </header>
  );
}
