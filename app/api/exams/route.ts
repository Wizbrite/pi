import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ExamSubject, ExamPaper, ExamQuestion } from "@/modules/course/models/exam.model";

/**
 * GET /api/exams?level=A-Level
 *
 * Returns all exam subjects, optionally filtered by level.
 * Each subject includes aggregated paperCount and totalQuestions.
 */
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const query: Record<string, string> = {};
    const level = searchParams.get("level");
    if (level) query.level = level;

    const subjects = await ExamSubject.find(query).sort({ title: 1 }).lean();

    // Enrich each subject with aggregated counts
    const enriched = await Promise.all(
      subjects.map(async (subject) => {
        const papers = await ExamPaper.find({ examSubjectId: subject._id }).lean();
        const paperIds = papers.map((p) => p._id);
        const totalQuestions = await ExamQuestion.countDocuments({
          examPaperId: { $in: paperIds },
        });

        return {
          ...subject,
          id: subject.slug,
          paperCount: papers.length,
          totalQuestions,
          completedPapers: 0, // placeholder — future: query ExamAttempt collection
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    console.error("[GET /api/exams] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exam subjects" },
      { status: 500 }
    );
  }
}
