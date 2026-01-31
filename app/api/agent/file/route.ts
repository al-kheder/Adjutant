import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filePath, content } = body;

    if (!filePath || content === undefined) {
      return NextResponse.json({ error: "Missing filePath or content" }, { status: 400 });
    }

    // Ensure directory exists (just in case)
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    // Write file
    await fs.writeFile(filePath, content, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
