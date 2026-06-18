import { NextResponse } from "next/server";
import { analyzeCvMatch } from "@/lib/ai";
import { detectLanguage } from "@/lib/language";
import { extractPdfText, validatePdfFile } from "@/lib/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("cv");
    const jobDescription = formData.get("jobDescription");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Upload your CV as a PDF file before starting the analysis." }, { status: 400 });
    }

    if (typeof jobDescription !== "string" || jobDescription.trim().length < 80) {
      return NextResponse.json(
        { error: "Paste a more detailed job description so the match score can be accurate." },
        { status: 400 }
      );
    }

    const validationError = validatePdfFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const cvText = await extractPdfText(buffer);

    if (cvText.trim().length < 200) {
      return NextResponse.json(
        {
          error:
            "We could not read enough text from this PDF. Upload a text-based CV PDF instead of a scanned image."
        },
        { status: 422 }
      );
    }

    const analysisId = crypto.randomUUID();
    const detectedLanguage = detectLanguage(cvText);
    const analysis = await analyzeCvMatch({
      cvText,
      jobDescription: jobDescription.trim(),
      language: detectedLanguage
    });

    return NextResponse.json({ analysisId, analysis, detectedLanguage });
  } catch (error) {
    console.error("Analyze API error", error);

    const message =
      error instanceof Error && error.message.includes("OPENAI_API_KEY")
        ? "OpenAI is not configured. Add OPENAI_API_KEY to .env.local."
        : "We could not analyze this CV right now. Please try again in a moment.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
