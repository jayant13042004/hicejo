import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { getAIClient } from "@/lib/ai";

/**
 * Extract text directly from a PDF buffer using Gemini Multimodal AI.
 * This runs natively on Vercel serverless without requiring native C++ canvas or sharp binaries.
 */
async function extractTextFromPdfWithGemini(buffer: Buffer): Promise<string> {
  const { openai, modelMini, isConfigured } = getAIClient();
  if (!isConfigured || !openai) return "";

  try {
    const base64 = buffer.toString("base64");
    const response = await openai.chat.completions.create({
      model: modelMini,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are an elite, highly accurate document text extractor. Extract and return ALL textual content visible in this document verbatim. Preserve all names, email, phone, links, section headings, job titles, companies, dates, metrics, skills, education, and bullet points. Output ONLY the clean extracted text with natural line breaks. Do NOT add preamble, commentary, explanations, or code blocks."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:application/pdf;base64,${base64}`
              }
            }
          ]
        }
      ],
      temperature: 0.1
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.warn("Direct Gemini PDF extraction encountered an error:", err);
    return "";
  }
}

/**
 * Secondary fallback: Local pdf-parse text extraction
 */
async function extractWithLocalPdfParse(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid module load crashes on edge/serverless
    const pdfModule = await import("pdf-parse");
    if (typeof (pdfModule as any).PDFParse === "function") {
      const parser = new (pdfModule as any).PDFParse({ data: buffer });
      const data = await parser.getText();
      const text = (data as { text?: string })?.text || "";
      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }
      return text;
    } else if (typeof (pdfModule as any).default === "function") {
      const data = await (pdfModule as any).default(buffer);
      return (data as { text?: string })?.text || "";
    }
  } catch (err) {
    console.warn("Local pdf-parse fallback error:", err);
  }
  return "";
}

/**
 * Secondary fallback: Direct pdfjs-dist text extraction
 */
async function extractWithPdfJs(buffer: Buffer): Promise<string> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await pdfjs.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      disableFontFace: true,
      verbosity: 0
    }).promise;

    const pagesText: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      let pageStr = "";
      for (const item of content.items) {
        if ("str" in item && typeof item.str === "string") {
          pageStr += item.str + (item.hasEOL ? "\n" : " ");
        }
      }
      if (pageStr.trim().length > 0) {
        pagesText.push(pageStr.trim());
      }
    }
    return pagesText.join("\n\n").trim();
  } catch (err) {
    console.warn("pdfjs-dist text extraction fallback error:", err);
  }
  return "";
}

/**
 * Vision OCR for direct image uploads (PNG, JPG, WEBP)
 */
async function extractTextFromImage(buffer: Buffer, mimeType: string): Promise<string> {
  const { openai, modelMini, isConfigured } = getAIClient();
  if (!isConfigured || !openai) return "";

  try {
    const base64 = buffer.toString("base64");
    const response = await openai.chat.completions.create({
      model: modelMini,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are an expert document OCR engine. Extract all text from this resume image verbatim. Output ONLY the extracted text with natural line breaks. Do not add commentary."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`
              }
            }
          ]
        }
      ],
      temperature: 0.1
    });

    return response.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.warn("Image OCR error:", err);
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".pdf")) {
      // 1. Try Gemini Multimodal PDF extraction (most resilient for Vercel serverless)
      text = await extractTextFromPdfWithGemini(buffer);

      // 2. If Gemini returned insufficient text or is offline, try local pdf-parse
      if (!text || text.trim().length < 50) {
        const localText = await extractWithLocalPdfParse(buffer);
        if (localText && localText.trim().length > text.trim().length) {
          text = localText;
        }
      }

      // 3. If still insufficient, try direct pdfjs-dist
      if (!text || text.trim().length < 50) {
        const pdfjsText = await extractWithPdfJs(buffer);
        if (pdfjsText && pdfjsText.trim().length > text.trim().length) {
          text = pdfjsText;
        }
      }
    } else if (fileName.endsWith(".docx")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value || "";
      } catch {
        return NextResponse.json({
          success: false,
          error: "Could not read Word (.docx) document. Please paste the text directly."
        }, { status: 422 });
      }
    } else if (fileName.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else if (
      fileName.endsWith(".png") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".webp")
    ) {
      const mimeType = fileName.endsWith(".png")
        ? "image/png"
        : fileName.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
      text = await extractTextFromImage(buffer, mimeType);
    } else {
      return NextResponse.json({
        success: false,
        error: "Unsupported file format. Please upload a PDF, DOCX, TXT, or Image file (.png, .jpg)."
      }, { status: 400 });
    }

    // Clean up null bytes, empty lines, and PDF artifacts
    text = text
      .replace(/\0/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text || text.length < 5) {
      return NextResponse.json({
        success: false,
        error: "No readable text could be extracted from this file. If this is a heavily stylized or image-only document, please copy and paste the text directly."
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to parse file";
    console.error("File parse route failure:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
