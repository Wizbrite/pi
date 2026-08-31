import { NextResponse } from "next/server";
import { z } from "zod";
import connectToDatabase from "@/lib/db/mongodb";
import ExamAttempt from "@/modules/progress/models/exam-attempt.model";
import { getUserId } from "@/lib/auth/get-user";
import { logDailyActivity } from "@/lib/progress/log-activity";
import mongoose from "mongoose";

// Validation schema for exam submission
const examQuestionSchema = z.object({
  questionId: z.union([z.string(), z.number()]),
  questionNumber: z.number(),
  text: z.string(),
  topic: z.string(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  options: z.array(z.string()),
  isCorrect: z.boolean(),
  marksObtained: z.number(),
  totalMarks: z.number(),
  markingSchemeNotes: z.string().default(""),
  aiExplanation: z.string().default(""),
});

const submitExamSchema = z.object({
  paperId: z.string().min(1),
  paperTitle: z.string().min(1),
  totalMarks: z.number().min(1),
  timeSpentSeconds: z.number().min(0),
  questions: z.array(examQuestionSchema).min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ "subject-id": string }> }
) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const subjectId = resolvedParams["subject-id"];

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Request body is required" },
        { status: 400 }
      );
    }

    const validationResult = submitExamSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { paperId, paperTitle, totalMarks, timeSpentSeconds, questions } =
      validationResult.data;

    await connectToDatabase();

    // Calculate stats
    const score = questions.reduce((sum, q) => sum + q.marksObtained, 0);
    const percentage = Math.round((score / totalMarks) * 100);
    const correctCount = questions.filter((q) => q.isCorrect).length;
    const incorrectCount = questions.length - correctCount;

    // XP calculation: 40 XP per correct answer + 20 bonus for passing (50%+)
    const xpEarned = correctCount * 40 + (percentage >= 50 ? 20 : 0);

    // Create exam attempt document
    const attempt = await ExamAttempt.create({
      userId: new mongoose.Types.ObjectId(userId),
      subjectId,
      paperId,
      paperTitle,
      score,
      totalMarks,
      timeSpentSeconds,
      questions: questions.map((q) => ({
        ...q,
        questionId: String(q.questionId),
      })),
      xpEarned,
      completedAt: new Date(),
    });

    // Log daily activity (non-blocking)
    logDailyActivity(userId, {
      examsTaken: 1,
      timeSpentMinutes: Math.round(timeSpentSeconds / 60),
      xpEarned,
      questionsAttempted: questions.length,
      questionsCorrect: correctCount,
    }).catch((err) => {
      console.error("Failed to log daily activity:", err);
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          attemptId: attempt._id.toString(),
          score,
          totalMarks,
          percentage,
          correctCount,
          incorrectCount,
          xpEarned,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/exams/[subject-id]/attempts] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save exam attempt" },
      { status: 500 }
    );
  }
}