import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ExamSubject, ExamPaper, ExamQuestion } from "@/modules/course/models/exam.model";

/**
 * GET /api/exams/[subjectId]
 *
 * Returns a single exam subject's details + all its papers.
 * `subjectId` is the slug, e.g. "ict-a".
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    await connectToDatabase();
    const { subjectId } = await params;

    const subject = await ExamSubject.findOne({ slug: subjectId }).lean();
    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Exam subject not found" },
        { status: 404 }
      );
    }

    const papers = await ExamPaper.find({ examSubjectId: subject._id })
      .sort({ year: -1, paperNumber: 1 })
      .lean();

    // Enrich papers with question counts
    const enrichedPapers = await Promise.all(
      papers.map(async (paper) => {
        const questionCount = await ExamQuestion.countDocuments({
          examPaperId: paper._id,
        });
        return {
          ...paper,
          id: paper.slug,
          questionCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        ...subject,
        id: subject.slug,
        papers: enrichedPapers,
      },
    });
  } catch (error: any) {
    console.error("[GET /api/exams/[subjectId]] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exam subject" },
      { status: 500 }
    );
  }
}
