import { NextRequest, NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai/provider";

export interface NotionQuestion {
  questionText: string;
  options: string[];       // exactly 4 options
  correctAnswer: string;   // must match one of options exactly
  explanation: string;
  notionIndex?: number;    // which notion this question was generated for (0-based)
}

export interface NotionAllocation {
  notionId: string;
  notionLabel: string;
  questions: NotionQuestion[];
  passingScore: number;
}

export interface VideoQuizResponse {
  allQuestions: NotionQuestion[];
  allocations: NotionAllocation[];  // questions split per notion
  questionsPerNotion: number;
}

/**
 * POST /api/ai/notion-quiz
 *
 * Generates the FULL question pool for an entire video (all notions together),
 * then splits them across notions sequentially.
 *
 * Body: {
 *   lessonTitle: string;
 *   partTitle: string;
 *   videoContext: string;      // transcript / description of the full video
 *   notions: {
 *     id: string;
 *     label: string;
 *     description?: string;
 *     passingScore: number;
 *   }[];
 *   totalQuestions: number;    // total to generate for the whole video
 *   questionsPerNotion: number;// how many each notion receives
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lessonTitle = "",
      partTitle = "",
      videoContext = "",
      notions = [],
      totalQuestions = 20,
      questionsPerNotion = 10,
    } = body as {
      lessonTitle?: string;
      partTitle?: string;
      videoContext?: string;
      notions: { id: string; label: string; description?: string; passingScore: number }[];
      totalQuestions?: number;
      questionsPerNotion?: number;
    };

    if (!notions || notions.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one notion is required" },
        { status: 400 }
      );
    }

    // Ensure we generate enough questions to cover all notions
    const needed = notions.length * questionsPerNotion;
    const count = Math.max(totalQuestions, needed);

    // Build the notion breakdown for the AI prompt
    const notionList = notions
      .map((n, i) => `  ${i + 1}. "${n.label}"${n.description ? ` — ${n.description}` : ""}`)
      .join("\n");

    const systemPrompt = `You are an expert GCE A-Level educational assessment creator. You create rigorous MCQ questions based on a video lesson.

CRITICAL RULES:
1. Return ONLY valid JSON. No markdown fences, no commentary, no extra text.
2. Generate exactly ${count} MCQ questions.
3. Each question MUST have exactly 4 options (full text strings, NOT labelled A/B/C/D).
4. "correctAnswer" MUST be the exact string that appears in "options".
5. Distribute questions across the notions: for ${count} questions over ${notions.length} notions, generate approximately ${Math.ceil(count / notions.length)} questions per notion.
6. Set "notionIndex" to the 0-based index of the notion the question belongs to.
7. Mix easy (30%), medium (50%), hard (20%) questions.
8. Questions must test understanding, application, and analysis — not just recall.

Return this exact JSON structure:
{
  "questions": [
    {
      "questionText": "...",
      "options": ["option 1", "option 2", "option 3", "option 4"],
      "correctAnswer": "option 1",
      "explanation": "...",
      "notionIndex": 0
    }
  ]
}`;

    const userPrompt = `Generate ${count} MCQ questions for this video lesson.

Lesson: "${lessonTitle}"
Video Part: "${partTitle}"

Video notions (segments):
${notionList}

Video context / content summary:
${videoContext || "Use the lesson title, part title, and notion labels as your context for generating relevant questions."}

Distribute the questions so each notion gets approximately ${questionsPerNotion} questions.
Return the JSON structure.`;

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

    let parsed: { questions: NotionQuestion[] };
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

    // Sanitize: ensure correctAnswer is always one of the options
    const allQuestions: NotionQuestion[] = parsed.questions.map((q) => {
      const opts = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
      let correct = q.correctAnswer;
      if (!opts.includes(correct)) correct = opts[0] ?? "";
      return {
        questionText: q.questionText ?? "",
        options: opts,
        correctAnswer: correct,
        explanation: q.explanation ?? "",
        notionIndex: typeof q.notionIndex === "number" ? q.notionIndex : 0,
      };
    });

    // ── Split questions across notions ──────────────────────────────────────
    // Primary: group by notionIndex the AI returned
    // Fallback: sequential block allocation
    const buckets: NotionQuestion[][] = notions.map(() => []);

    // First pass: put AI-assigned questions in their buckets
    for (const q of allQuestions) {
      const idx = Math.min(q.notionIndex ?? 0, notions.length - 1);
      buckets[idx].push(q);
    }

    // Second pass: if any bucket is short, pull from the pool of unassigned / overflow
    const overflow: NotionQuestion[] = [];
    buckets.forEach((bucket, i) => {
      if (bucket.length > questionsPerNotion) {
        // Trim and put excess in overflow
        overflow.push(...bucket.splice(questionsPerNotion));
      }
    });

    // Fill short buckets from overflow
    buckets.forEach((bucket) => {
      while (bucket.length < questionsPerNotion && overflow.length > 0) {
        bucket.push(overflow.shift()!);
      }
    });

    // Build allocations
    const allocations: NotionAllocation[] = notions.map((n, i) => ({
      notionId: n.id,
      notionLabel: n.label,
      passingScore: n.passingScore ?? 80,
      questions: buckets[i] ?? [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        allQuestions,
        allocations,
        questionsPerNotion,
      } as VideoQuizResponse,
    });
  } catch (error: any) {
    console.error("[POST /api/ai/notion-quiz]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
