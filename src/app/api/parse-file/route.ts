import { NextResponse } from "next/server";
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);

async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  let text = "";

  // Resolve standard fonts and cmaps for pdfjs / pdf-parse if present locally
  let fontUrl: string | undefined;
  let cMapUrl: string | undefined;
  try {
    const fontPath = path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts");
    const cmapPath = path.join(process.cwd(), "node_modules", "pdfjs-dist", "cmaps");
    if (fs.existsSync(fontPath)) {
      fontUrl = pathToFileURL(fontPath).href + "/";
    }
    if (fs.existsSync(cmapPath)) {
      cMapUrl = pathToFileURL(cmapPath).href + "/";
    }
  } catch {
    // ignore if local paths cannot be resolved
  }

  // Strategy 1: pdf-parse v2 class or v1 function
  try {
    const pdfModule = require("pdf-parse");
    const options: Record<string, unknown> = {
      data: buffer,
      ...(fontUrl ? { standardFontDataUrl: fontUrl } : {}),
      ...(cMapUrl ? { cMapUrl, cMapPacked: true } : {})
    };

    if (typeof pdfModule.PDFParse === "function") {
      const parser = new pdfModule.PDFParse(options);
      const data = await parser.getText();
      text = (data as { text?: string })?.text || "";
      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }
    } else if (typeof pdfModule.default?.PDFParse === "function") {
      const parser = new pdfModule.default.PDFParse(options);
      const data = await parser.getText();
      text = (data as { text?: string })?.text || "";
      if (typeof parser.destroy === "function") {
        await parser.destroy();
      }
    } else if (typeof pdfModule === "function") {
      const data = await pdfModule(buffer);
      text = (data as { text?: string })?.text || "";
    } else if (typeof pdfModule.default === "function") {
      const data = await pdfModule.default(buffer);
      text = (data as { text?: string })?.text || "";
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("Primary pdf-parse extraction encountered an issue, attempting pdfjs fallback:", message);
  }

  // Strategy 2: Direct pdfjs-dist fallback if pdf-parse failed or returned empty text
  if (!text || text.trim().length === 0) {
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        ...(fontUrl ? { standardFontDataUrl: fontUrl } : {}),
        ...(cMapUrl ? { cMapUrl, cMapPacked: true } : {}),
        useSystemFonts: true,
        disableFontFace: true
      });
      const doc = await loadingTask.promise;
      const pagesText: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const strings: string[] = [];
        for (const item of content.items) {
          if ("str" in item && typeof item.str === "string") {
            strings.push(item.str);
          }
        }
        pagesText.push(strings.join(" "));
      }
      text = pagesText.join("\n\n");
    } catch (fallbackErr: unknown) {
      const message = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      console.error("pdfjs-dist fallback extraction failed:", message);
    }
  }

  return text;
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
      try {
        text = await parsePdfBuffer(buffer);
      } catch (pdfError: unknown) {
        console.error("PDF Extraction error:", pdfError);
        return NextResponse.json({
          success: false,
          error: "Could not extract text from this PDF. Please ensure it contains selectable text, or paste the text directly."
        }, { status: 422 });
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
    } else {
      return NextResponse.json({
        success: false,
        error: "Unsupported file format. Please upload a PDF, DOCX, or TXT file."
      }, { status: 400 });
    }

    // Clean up null bytes, empty lines, and PDF page artifacts like "-- 1 of 1 --"
    text = text
      .replace(/\0/g, "")
      .replace(/\r\n/g, "\n")
      .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text || text.length < 5) {
      return NextResponse.json({
        success: false,
        error: "No readable text was found in the uploaded file. If it is an image/scanned PDF, please paste the resume text directly."
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to parse file";
    console.error("File parse route failure:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
