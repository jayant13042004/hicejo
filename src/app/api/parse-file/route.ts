import { NextResponse } from "next/server";
import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import mammoth from "mammoth";
import { getAIClient } from "@/lib/ai";

const require = createRequire(import.meta.url);

/**
 * Perform high-precision Vision OCR on rendered document pages or image files
 */
async function performVisionOcr(imageBuffers: Buffer[]): Promise<string> {
  if (!imageBuffers || imageBuffers.length === 0) return "";
  const { openai, modelMini, isConfigured } = getAIClient();
  if (!isConfigured || !openai) return "";

  const pageTexts: string[] = [];
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
        pageTexts.push(pageText);
      }
    } catch (pageOcrErr) {
      console.warn("Vision OCR request error on page:", pageOcrErr);
    }
  }

  return pageTexts.join("\n\n");
}

/**
 * Render PDF pages directly to raster images using @napi-rs/canvas.
 * This guarantees capturing scanned PDFs, Canva designs, vector outlines, and heavily stylized resumes.
 */
async function renderPdfPagesToImages(buffer: Buffer, maxPages = 4): Promise<Buffer[]> {
  try {
    const { createCanvas } = require("@napi-rs/canvas");
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    const fontPath = path.join(process.cwd(), "node_modules", "pdfjs-dist", "standard_fonts");
    const cmapPath = path.join(process.cwd(), "node_modules", "pdfjs-dist", "cmaps");
    let standardFontDataUrl: string | undefined;
    let cMapUrl: string | undefined;
    if (fs.existsSync(fontPath)) {
      standardFontDataUrl = pathToFileURL(fontPath).href + "/";
    }
    if (fs.existsSync(cmapPath)) {
      cMapUrl = pathToFileURL(cmapPath).href + "/";
    }

    const doc = await pdfjs.getDocument({
      data: new Uint8Array(buffer),
      ...(standardFontDataUrl ? { standardFontDataUrl } : {}),
      ...(cMapUrl ? { cMapUrl, cMapPacked: true } : {}),
      disableFontFace: true,
      useSystemFonts: true,
      verbosity: 0
    }).promise;

    const pageCount = Math.min(doc.numPages, maxPages);
    const jpegBuffers: Buffer[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await doc.getPage(pageNum);
      // scale 1.5 provides high DPI clarity for OCR while keeping image size small (~40-80KB)
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext("2d");

      // Fill white background for transparent or default canvas pages
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, viewport.width, viewport.height);

      await (page.render as any)({
        canvasContext: ctx,
        canvas: canvas as any,
        viewport
      }).promise;

      const pageJpg = canvas.toBuffer("image/jpeg");
      if (pageJpg && pageJpg.length > 500) {
        jpegBuffers.push(pageJpg);
      }
    }

    return jpegBuffers;
  } catch (canvasErr) {
    console.warn("Direct canvas PDF render encountered an issue, trying raw image extraction:", canvasErr);
    return [];
  }
}

/**
 * Secondary fallback: Extract raw image XObjects from PDF if canvas rendering is unavailable
 */
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
            if (area > maxArea && imgObj.width >= 100 && imgObj.height >= 100) {
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
    console.warn("PDF raw image extraction encountered an error:", err);
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
  const initialWords = text.split(/\s+/).filter((w) => w.length > 1);
  if (!text || text.trim().length < 60 || initialWords.length < 12) {
    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        ...(fontUrl ? { standardFontDataUrl: fontUrl } : {}),
        ...(cMapUrl ? { cMapUrl, cMapPacked: true } : {}),
        useSystemFonts: true,
        disableFontFace: true,
        verbosity: 0
      });
      const doc = await loadingTask.promise;
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
      const combined = pagesText.join("\n\n").trim();
      if (combined.length > text.trim().length) {
        text = combined;
      }
    } catch (fallbackErr: unknown) {
      const message = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
      console.warn("pdfjs-dist text extraction encountered an issue:", message);
    }
  }

  // Strategy 3: AI Vision OCR for image-based/scanned/Canva PDFs with no direct text layer
  const extractedWords = text.split(/\s+/).filter((w) => w.length > 1);
  const isSufficientText = text.trim().length >= 60 && extractedWords.length >= 12;

  if (!isSufficientText) {
    try {
      // Step 3A: Render full page canvases directly (handles vector outlines, Canva elements, full scans)
      let imageBuffers = await renderPdfPagesToImages(buffer, 4);

      // Step 3B: If canvas render yielded no images, try raw XObject extraction
      if (imageBuffers.length === 0) {
        imageBuffers = await extractImagesFromPdf(buffer, 4);
      }

      // Step 3C: Run Gemini Vision OCR on the rendered pages
      if (imageBuffers.length > 0) {
        const ocrText = await performVisionOcr(imageBuffers);
        if (ocrText && ocrText.trim().length > text.trim().length) {
          text = ocrText;
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
    } else if (
      fileName.endsWith(".png") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".webp")
    ) {
      // Direct image file uploaded by user (e.g. screenshot or photo of resume)
      try {
        let preparedImg = buffer;
        try {
          const sharp = require("sharp");
          preparedImg = await sharp(buffer)
            .resize({ width: 1600, height: 2400, fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        } catch {
          // Sharp resize optional
        }
        text = await performVisionOcr([preparedImg]);
      } catch (imgOcrErr) {
        console.error("Image OCR error:", imgOcrErr);
        return NextResponse.json({
          success: false,
          error: "Could not perform OCR on this image. Please copy and paste the text directly."
        }, { status: 422 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: "Unsupported file format. Please upload a PDF, DOCX, TXT, or Image file (.png, .jpg)."
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
