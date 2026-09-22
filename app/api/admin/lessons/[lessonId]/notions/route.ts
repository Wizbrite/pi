import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import Lesson from "@/modules/course/models/lesson.model";
import { getUserRole } from "@/lib/auth/get-user";

/**
 * GET /api/admin/lessons/[lessonId]/notions
 * Returns all notions across all parts for a given lesson.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const roleHeader = request.headers.get("x-user-role") || (await getUserRole());
    if (roleHeader !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    await connectToDatabase();
    const { lessonId } = await params;
    const lesson = await Lesson.findById(lessonId).lean();
    if (!lesson) {
      return NextResponse.json({ success: false, message: "Lesson not found" }, { status: 404 });
    }
    // Return notions grouped by partNumber
    const notionsByPart = (lesson.parts || []).map((p: any) => ({
      partNumber: p.partNumber,
      partTitle: p.title,
      notions: p.notions || [],
    }));
    return NextResponse.json({ success: true, data: notionsByPart });
  } catch (error: any) {
    console.error("[GET /api/admin/lessons/[lessonId]/notions]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/lessons/[lessonId]/notions
 * Body: { partNumber: number, notions: INotion[] }
 * Replaces the notions array for a specific part.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const roleHeader = request.headers.get("x-user-role") || (await getUserRole());
    if (roleHeader !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    await connectToDatabase();
    const { lessonId } = await params;
    const body = await request.json();
    const { partNumber, notions } = body as { partNumber: number; notions: any[] };

    if (typeof partNumber !== "number") {
      return NextResponse.json({ success: false, message: "partNumber is required" }, { status: 400 });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ success: false, message: "Lesson not found" }, { status: 404 });
    }

    // Find the part and update its notions
    const part = lesson.parts.find((p: any) => p.partNumber === partNumber);
    if (!part) {
      return NextResponse.json({ success: false, message: `Part ${partNumber} not found` }, { status: 404 });
    }

    // Sort notions by startTime before saving
    const sorted = [...(notions || [])].sort((a, b) => a.startTime - b.startTime);
    part.notions = sorted;

    await lesson.save();
    return NextResponse.json({ success: true, data: sorted });
  } catch (error: any) {
    console.error("[PATCH /api/admin/lessons/[lessonId]/notions]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
