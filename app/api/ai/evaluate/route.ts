import { NextResponse } from "next/server";
import { getAiProvider, type AiMessage } from "@/lib/ai/provider";
import { getUserId } from "@/lib/auth/get-user";

type Evaluation = {
  isCorrect: boolean;
  explanation: string;
};

function getProviderError(status: number, payload: unknown) {
  if (payload && typeof payload === "object") {
    const message = (payload as { message?: unknown; error?: { message?: unknown } }).error?.message
      ?? (payload as { message?: unknown }).message;

    if (typeof message === "string" && message.trim()) return message;
  }

  return `The AI provider returned an error (${status}).`;
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionText, correctAnswer, studentAnswer } = body;

    if (typeof questionText !== "string" || typeof studentAnswer !== "string" || !questionText.trim() || !studentAnswer.trim()) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = `You are a strict but fair Cameroon GCE Examiner. 
You are evaluating a student's answer to a structural question.
Question: ${questionText}
Official Correct Answer / Rubric: ${correctAnswer || "Use your expert knowledge to determine if it is correct."}
Student's Answer: ${studentAnswer}

Evaluate if the student's answer is correct or conceptually accurate enough to be awarded the mark.
Respond strictly in JSON format with exactly two fields:
{
  "isCorrect": boolean,
  "explanation": "A short, encouraging explanation of why they are right or wrong."
}`;

    const messages: AiMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    // Use the same provider as the chatbot. This prevents the two endpoints from
    // disagreeing about credentials, model selection, or future provider changes.
    const result = await getAiProvider().chat(messages, {
      stream: false,
      temperature: 0,
      maxTokens: 250,
      responseFormat: "json_object",
    });

    const payload = await result.json().catch(() => null);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: getProviderError(result.status, payload) },
        { status: result.status }
      );
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("The AI provider returned an empty evaluation.");
    }

    const evaluation = JSON.parse(content) as Partial<Evaluation>;
    if (typeof evaluation.isCorrect !== "boolean" || typeof evaluation.explanation !== "string") {
      throw new Error("The AI provider returned an invalid evaluation format.");
    }

    return NextResponse.json({ success: true, evaluation });
  } catch (error: any) {
    console.error("[POST /api/ai/evaluate] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to evaluate answer",
      },
      { status: 500 }
    );
  }
}
