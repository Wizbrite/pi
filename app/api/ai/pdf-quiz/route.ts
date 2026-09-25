import { NextRequest, NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai/provider";

export interface PdfQuizQuestion {
  questionText: string;
  options: string[];          // exactly 4 options
  correctAnswer: string;      // must match one of options exactly
  explanation: string;
  isReviewQuestion?: boolean; // true if this is a review question from an earlier part
  partNumber?: number;        // which part this question tests
}

export interface PdfQuizResponse {
  partNumber: number;
  partTitle: string;
  startPage: number;
  endPage: number;
  passingScore: number;
  questions: PdfQuizQuestion[];
}

/**
 * POST /api/ai/pdf-quiz
 *
 * Generates an AI MCQ checkpoint quiz for a PDF lesson part, including
 * cumulative review questions from previous parts when partNumber > 1.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lessonTitle = "",
      currentPart,
      previousParts = [],
      questionCount = 10,
      passingScore = 80,
    } = body as {
      lessonTitle?: string;
      currentPart: {
        partNumber: number;
        title: string;
        startPage: number;
        endPage: number;
        partContext?: string;
        content?: string;
      };
      previousParts?: {
        partNumber: number;
        title: string;
        startPage: number;
        endPage: number;
        partContext?: string;
        content?: string;
      }[];
      questionCount?: number;
      passingScore?: number;
    };

    if (!currentPart || !currentPart.title) {
      return NextResponse.json(
        { success: false, message: "Valid currentPart information is required" },
        { status: 400 }
      );
    }

    const isCumulative = previousParts.length > 0 && currentPart.partNumber > 1;
    const currentPartQuestionCount = isCumulative ? Math.ceil(questionCount * 0.65) : questionCount;
    const reviewQuestionCount = isCumulative ? questionCount - currentPartQuestionCount : 0;

    const previousPartsSummary = previousParts
      .map(
        (p) =>
          `  - Part ${p.partNumber}: "${p.title}" (Pages ${p.startPage}–${p.endPage})\n    Summary/Context: ${
            p.partContext || p.content || "General concepts from this section"
          }`
      )
      .join("\n\n");

    const systemPrompt = `You are an expert GCE educational assessment generator creating an interactive checkpoint quiz for a student reading a PDF lesson document.

CRITICAL FORMAT RULES:
1. Return ONLY valid JSON. No markdown formatting, no comments, no extra text.
2. Generate exactly ${questionCount} multiple-choice questions (MCQs).
3. Each question MUST have exactly 4 distinct options.
4. "correctAnswer" MUST be an exact character-for-character match to one of the 4 items in "options".
5. Provide a helpful, concise "explanation" for why the correct answer is right.
6. For each question, set "partNumber" to the integer part number it tests.
7. Set "isReviewQuestion" to true for review questions from previous parts, and false for current part questions.

${
  isCumulative
    ? `CUMULATIVE REVIEW DISTRIBUTION:
- Generate ${currentPartQuestionCount} questions specifically on the CURRENT PART: Part ${currentPart.partNumber} ("${currentPart.title}", Pages ${currentPart.startPage}–${currentPart.endPage}).
- Generate ${reviewQuestionCount} CUMULATIVE REVIEW questions testing knowledge from PREVIOUS PARTS (Parts 1 to ${currentPart.partNumber - 1}). Mark these review questions with "isReviewQuestion": true.`
    : `- All ${questionCount} questions must test the content of Part ${currentPart.partNumber}: "${currentPart.title}" (Pages ${currentPart.startPage}–${currentPart.endPage}). Set "isReviewQuestion": false.`
}

Return JSON with this exact structure:
{
  "questions": [
    {
      "questionText": "Question text here...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Detailed explanation...",
      "isReviewQuestion": false,
      "partNumber": ${currentPart.partNumber}
    }
  ]
}`;

    const userPrompt = `Generate ${questionCount} MCQ questions for Lesson: "${lessonTitle}".

CURRENT PART DETAILS:
- Part ${currentPart.partNumber}: "${currentPart.title}" (Pages ${currentPart.startPage}–${currentPart.endPage})
- Part Context & Summary:
${currentPart.partContext || currentPart.content || "Use the part title and page range as key context."}

${
  isCumulative
    ? `PREVIOUS PARTS FOR CUMULATIVE REVIEW (Generate ${reviewQuestionCount} review questions from these):
${previousPartsSummary}`
    : ""
}

Return the completed JSON object.`;

    const provider = getAiProvider();
    const res = await provider.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        maxTokens: 8000,
        temperature: 0.65,
        stream: false,
        responseFormat: "json_object",
      }
    );

    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      const errMsg = errBody?.error?.message || `AI provider error (${res.status})`;
      return NextResponse.json({ success: false, message: errMsg }, { status: 503 });
    }

    const data = await res.json();
    const rawContent: string = data?.choices?.[0]?.message?.content ?? "{}";

    let parsed: { questions: PdfQuizQuestion[] };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return NextResponse.json(
        { success: false, message: "AI returned invalid JSON. Please retry." },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json(
        { success: false, message: "AI did not return valid questions. Please retry." },
        { status: 500 }
      );
    }

    // Sanitize options and correctAnswer
    const questions: PdfQuizQuestion[] = parsed.questions.map((q) => {
      const opts = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
      let correct = q.correctAnswer;
      if (!opts.includes(correct)) correct = opts[0] ?? "";
      return {
        questionText: q.questionText ?? "",
        options: opts,
        correctAnswer: correct,
        explanation: q.explanation ?? "",
        isReviewQuestion: !!q.isReviewQuestion,
        partNumber: typeof q.partNumber === "number" ? q.partNumber : currentPart.partNumber,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        partNumber: currentPart.partNumber,
        partTitle: currentPart.title,
        startPage: currentPart.startPage,
        endPage: currentPart.endPage,
        passingScore,
        questions,
      } as PdfQuizResponse,
    });
  } catch (error: any) {
    console.error("[POST /api/ai/pdf-quiz]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
