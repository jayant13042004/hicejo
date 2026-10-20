import { NextResponse } from "next/server";
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import mammoth from "mammoth";
import { getAIClient } from "@/lib/ai";

const require = createRequire(import.meta.url);

async function extractImagesFromPdf(buffer: Buffer, maxPages = 4): Promise<Buffer[]> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const sharp = require("sharp");

    const doc = await pdfjs.getDocument({
      data: new Uint8Array(buffer),
      disableFontFace: true,
      verbosity: 0
    }).promise;

    const pageCount = Math.min(doc.numPages, maxPages);
    const jpegBuffers: Buffer[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await doc.getPage(pageNum);
      const ops = await page.getOperatorList();
      let bestImg: { width: number; height: number; kind: number; data: Uint8ClampedArray | Uint8Array } | null = null;
      let maxArea = 0;

      for (let j = 0; j < ops.fnArray.length; j++) {
        if (ops.fnArray[j] === pdfjs.OPS.paintImageXObject) {
          const imgName = ops.argsArray[j][0];
          const imgObj = await new Promise<any>((resolve) => {
            page.objs.get(imgName, (obj: any) => resolve(obj));
          });

          if (imgObj && imgObj.width && imgObj.height && imgObj.data) {
            const area = imgObj.width * imgObj.height;
            if (area > maxArea && imgObj.width >= 200 && imgObj.height >= 200) {
              maxArea = area;
              bestImg = imgObj;
            }
          }
        }
      }

      if (bestImg) {
        try {
          const channels = bestImg.kind === 2 ? 3 : (bestImg.kind === 3 ? 4 : 1);
          const rawBuffer = Buffer.from(bestImg.data);
          const jpeg = await sharp(rawBuffer, {
            raw: {
              width: bestImg.width,
              height: bestImg.height,
              channels
            }
          })
          .resize({ width: 1400, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

          jpegBuffers.push(jpeg);
        } catch (convErr) {
          console.warn(`Sharp image conversion failed for page ${pageNum}:`, convErr);
        }
      }
    }

    return jpegBuffers;
  } catch (err) {
    console.warn("PDF image extraction encountered an error:", err);
    return [];
  }
}

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

  // Strategy 2: Direct pdfjs-dist fallback if pdf-parse returned insufficient text
  if (!text || text.trim().length < 30) {
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
        if (strings.length > 0) {
          pagesText.push(strings.join(" "));
        }
      }
      if (pagesText.length > 0) {
        text = pagesText.join("\n\n");
      }
    } catch (fallbackErr: unknown) {
      const message = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      console.warn("pdfjs-dist text extraction encountered an issue:", message);
    }
  }

  // Strategy 3: AI Vision OCR for image-based/scanned PDFs (e.g. Canva exports, legacy Hicejo downloads, scans)
  if (!text || text.trim().length < 30) {
    try {
      const imageBuffers = await extractImagesFromPdf(buffer);
      if (imageBuffers.length > 0) {
        const { openai, modelMini, isConfigured } = getAIClient();
        if (isConfigured && openai) {
          const ocrPages: string[] = [];
          for (const imgBuf of imageBuffers) {
            try {
              const base64 = imgBuf.toString("base64");
              const res = await openai.chat.completions.create({
                model: modelMini,
                messages: [
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: "You are an expert resume parser and OCR system. Extract and return ALL textual content visible on this document page verbatim. Preserve all names, contact details, job titles, companies, dates, metrics, skills, education, and bullet points. Output ONLY the clean extracted text with natural line breaks. Do NOT add commentary, explanations, or markdown code blocks."
                      },
                      {
                        type: "image_url",
                        image_url: { url: `data:image/jpeg;base64,${base64}` }
                      }
                    ]
                  }
                ],
                temperature: 0.1
              });

              const pageText = res.choices[0]?.message?.content?.trim();
              if (pageText) {
                ocrPages.push(pageText);
              }
            } catch (pageOcrErr) {
              console.warn("Page OCR request error:", pageOcrErr);
            }
          }

          if (ocrPages.length > 0) {
            text = ocrPages.join("\n\n");
          }
        }
      }
    } catch (ocrStrategyErr) {
      console.warn("AI OCR strategy encountered an issue:", ocrStrategyErr);
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
          error: "Could not read this PDF. Please ensure the file is not corrupted or password-protected, or paste the text directly."
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
