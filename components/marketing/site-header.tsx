import Link from "next/link";
import { FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-white">
            <FileSearch size={18} aria-hidden="true" />
          </span>
          CV Match Analyzer
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          <a href="/#how-it-works" className="hover:text-ink">
            How it works
          </a>
          <a href="/#pricing" className="hover:text-ink">
            Pricing
          </a>
          <a href="/#faq" className="hover:text-ink">
            FAQ
          </a>
        </nav>
        <Button href="/analyzer" className="h-10 px-4">
          Analyze my CV
        </Button>
      </div>
    </header>
  );
}
