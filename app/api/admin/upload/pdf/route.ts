import { NextResponse } from "next/server";
import { getUserRole } from "@/lib/auth/get-user";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const roleHeader = request.headers.get("x-user-role") || (await getUserRole());
    if (roleHeader !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No PDF file provided" }, { status: 400 });
    }

    // Ensure it's a PDF file
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Selected file must be a PDF document (.pdf)" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save PDF into public/uploads/pdf directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "pdf");
    await mkdir(uploadDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${uuidv4()}-${safeName}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const pdfUrl = `/uploads/pdf/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        pdfUrl,
        fileName: file.name,
        fileSize: file.size,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/admin/upload/pdf] Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
