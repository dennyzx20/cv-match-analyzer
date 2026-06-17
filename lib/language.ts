import type { LanguageCode } from "@/lib/types";

export function detectLanguage(text: string): LanguageCode {
  const italianWords = ["il", "la", "di", "che", "per", "con", "sono", "una", "un"];
  const lower = text.toLowerCase();
  let score = 0;

  italianWords.forEach((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, "g");
    const matches = lower.match(pattern);
    score += matches?.length ?? 0;
  });

  return score > 3 ? "it" : "en";
}
