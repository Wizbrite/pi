import { NextResponse } from "next/server";
import { mistral } from "@/lib/mistral";
import { getUserId } from "@/lib/auth/get-user";

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { questionText, correctAnswer, studentAnswer } = body;

    if (!questionText || !studentAnswer) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = `You are a strict but fair GCE Examiner. 
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

    const messages = [
      { role: "system", content: systemPrompt },
    ];

    // Assuming we use Mistral for the evaluation, non-streaming.
    const result = await mistral.chat(messages as any);
    const content = result.choices?.[0]?.message?.content || "";
    
    // Parse the JSON block out of the response (sometimes models wrap in ```json)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return valid JSON");
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, evaluation });
  } catch (error: any) {
    console.error("[POST /api/ai/evaluate] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
