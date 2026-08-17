import { NextResponse } from "next/server";
import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

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
      const uint8Array = new Uint8Array(arrayBuffer);
      const parser = new pdf.PDFParse(uint8Array);
      const data = await parser.getText();
      text = data.text || "";
    } else if (fileName.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    } else if (fileName.endsWith(".txt")) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json({
        success: false,
        error: "Unsupported file format. Please upload PDF, DOCX, or TXT."
      }, { status: 400 });
    }

    if (!text || text.trim() === "") {
      return NextResponse.json({
        success: false,
        error: "The uploaded file contains no readable text."
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, text });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
