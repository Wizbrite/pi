import { NextRequest, NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai/provider";

export interface NotionQuestion {
  questionText: string;
  options: string[];        // exactly 4 options
  correctAnswer: string;    // must match one of the options exactly
  explanation: string;
}

export interface NotionQuizResponse {
  questions: NotionQuestion[];
  passingScore: number;     // threshold determined by AI (minimum 80)
}

/**
 * POST /api/ai/notion-quiz
 * Generates 20+ MCQ questions for a video notion segment.
 *
 * Body: {
 *   notionLabel: string;
 *   description?: string;
 *   lessonTitle?: string;
 *   partTitle?: string;
 *   count?: number;         // default 20
 *   passingScore?: number;  // override, default 80
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      notionLabel,
      description = "",
      lessonTitle = "",
      partTitle = "",
      count = 20,
      passingScore = 80,
    } = body as {
      notionLabel: string;
      description?: string;
      lessonTitle?: string;
      partTitle?: string;
      count?: number;
      passingScore?: number;
    };

    if (!notionLabel) {
      return NextResponse.json(
        { success: false, message: "notionLabel is required" },
        { status: 400 }
      );
    }

    const numQuestions = Math.max(count, 20); // enforce minimum of 20
    const threshold = Math.max(passingScore, 80); // enforce minimum of 80%

    const contextBlock = [
      lessonTitle && `Lesson: "${lessonTitle}"`,
      partTitle && `Lesson Part: "${partTitle}"`,
      `Notion/Segment: "${notionLabel}"`,
      description && `Segment Description: ${description}`,
    ]
      .filter(Boolean)
      .join("\n");

    const systemPrompt = `You are an expert GCE A-Level educational assessment creator. You generate rigorous, high-quality multiple-choice questions (MCQs) based on educational video segments called "notions".

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON with no extra text, markdown fences, or commentary.
2. Generate exactly ${numQuestions} MCQs.
3. Each question MUST have exactly 4 options (A, B, C, D style, but written as full text strings).
4. The "correctAnswer" field MUST be the exact string that appears in the "options" array.
5. Questions must be directly relevant to the notion/segment context provided.
6. Vary difficulty: ~30% easy, ~50% medium, ~20% hard.
7. Include conceptual, application, and analytical questions.
8. Explanations must be educational and clear.

Return this exact JSON structure:
{
  "questions": [
    {
      "questionText": "...",
      "options": ["option A text", "option B text", "option C text", "option D text"],
      "correctAnswer": "option A text",
      "explanation": "..."
    }
  ],
  "passingScore": ${threshold}
}`;

    const userPrompt = `Generate ${numQuestions} MCQ questions for the following video notion segment:

${contextBlock}

Return the JSON structure as specified.`;

    const provider = getAiProvider();
    const res = await provider.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        maxTokens: 6000,
        temperature: 0.7,
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

    let parsed: NotionQuizResponse;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return NextResponse.json(
        { success: false, message: "AI returned invalid JSON. Please retry." },
        { status: 500 }
      );
    }

    // Validate and sanitize
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json(
        { success: false, message: "AI did not return valid questions. Please retry." },
        { status: 500 }
      );
    }

    // Ensure correctAnswer is always one of the options
    const sanitized = parsed.questions.map((q: NotionQuestion) => {
      const opts = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
      let correct = q.correctAnswer;
      if (!opts.includes(correct)) {
        correct = opts[0] ?? "";
      }
      return { questionText: q.questionText, options: opts, correctAnswer: correct, explanation: q.explanation ?? "" };
    });

    return NextResponse.json({
      success: true,
      data: {
        questions: sanitized,
        passingScore: typeof parsed.passingScore === "number" ? Math.max(parsed.passingScore, 80) : threshold,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/ai/notion-quiz]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
