import pdfParse from "pdf-parse";

const maxPdfSize = 5 * 1024 * 1024;

export function validatePdfFile(file: File) {
  const isPdfMime = file.type === "application/pdf";
  const isPdfName = file.name.toLowerCase().endsWith(".pdf");

  if (!isPdfMime && !isPdfName) {
    return "Only PDF files are supported.";
  }

  if (file.size > maxPdfSize) {
    return "The PDF must be 5MB or smaller.";
  }

  return null;
}

export async function extractPdfText(buffer: Buffer) {
  const parsed = await pdfParse(buffer);
  return parsed.text.replace(/\s+/g, " ").trim();
}
