import { NextResponse } from "next/server";
import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);

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
        const pdfModule = require("pdf-parse");
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Handle class or function export in pdf-parse
        if (pdfModule.PDFParse) {
          const parser = new pdfModule.PDFParse(uint8Array);
          const data = await parser.getText();
          text = data.text || "";
        } else if (typeof pdfModule === "function") {
          const data = await pdfModule(buffer);
          text = data.text || "";
        } else if (pdfModule.default?.PDFParse) {
          const parser = new pdfModule.default.PDFParse(uint8Array);
          const data = await parser.getText();
          text = data.text || "";
        }
      } catch (pdfError: any) {
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
      } catch (docxErr: any) {
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

    // Clean up empty lines
    text = text.replace(/\r\n/g, "\n").trim();

    if (!text || text.length < 10) {
      return NextResponse.json({
        success: false,
        error: "No readable text was found in the uploaded file. Please paste the resume text directly."
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    console.error("File parse route failure:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to parse file" }, { status: 500 });
  }
}
