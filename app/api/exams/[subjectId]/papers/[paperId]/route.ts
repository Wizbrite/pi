import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ExamPaper, ExamQuestion } from "@/modules/course/models/exam.model";

/**
 * GET /api/exams/[subjectId]/papers/[paperId]
 *
 * Returns a single exam paper's details + all its questions.
 * `paperId` is the paper slug, e.g. "ict801-2024-p1".
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subjectId: string; paperId: string }> }
) {
  try {
    await connectToDatabase();
    const { paperId } = await params;

    const paper = await ExamPaper.findOne({ slug: paperId }).lean();
    if (!paper) {
      return NextResponse.json(
        { success: false, message: "Exam paper not found" },
        { status: 404 }
      );
    }

    const questions = await ExamQuestion.find({ examPaperId: paper._id })
      .sort({ questionNumber: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        ...paper,
        id: paper.slug,
        questions: questions.map((q) => ({
          id: q.questionNumber,
          questionNumber: q.questionNumber,
          text: q.text,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          correctAnswerText: q.correctAnswerText,
          marks: q.marks,
          topic: q.topic,
          type: q.options.length > 0 ? "MCQ" : "Structured",
          markingSchemeNotes: q.markingSchemeNotes,
          aiExplanation: q.aiExplanation,
        })),
      },
    });
  } catch (error: any) {
    console.error("[GET /api/exams/[subjectId]/papers/[paperId]] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch exam paper" },
      { status: 500 }
    );
  }
}
