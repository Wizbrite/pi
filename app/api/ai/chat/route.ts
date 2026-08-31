import { NextRequest, NextResponse } from "next/server";
import { getAiProvider, AiMessage } from "@/lib/ai/provider";

/**
 * POST /api/ai/chat
 *
 * Body:
 * {
 *   messages: AiMessage[];
 *   stream?: boolean;       // default: true (SSE streaming)
 *   model?: string;
 *   maxTokens?: number;
 * }
 *
 * Supports both streaming (SSE) and non-streaming responses.
 * This endpoint acts as a secure proxy — the AI API key never reaches the client.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      stream = true,
      model,
      maxTokens = 800,
    } = body as {
      messages: AiMessage[];
      stream?: boolean;
      model?: string;
      maxTokens?: number;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: "messages array is required" },
        { status: 400 }
      );
    }

    const provider = getAiProvider();

    // ── Streaming response ─────────────────────────────────────────────────────
    if (stream) {
      const upstream = await provider.chat(messages, { model, maxTokens, stream: true });

      if (!upstream.ok) {
        const err = await upstream.text();
        return NextResponse.json(
          { success: false, message: `AI provider error: ${err}` },
          { status: upstream.status }
        );
      }

      // Pipe the SSE stream from the AI provider directly to the client
      return new NextResponse(upstream.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ── Non-streaming response ─────────────────────────────────────────────────
    const res = await provider.chat(messages, { model, maxTokens, stream: false });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { success: false, message: `AI provider error: ${err}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    console.error("[POST /api/ai/chat] Error:", error);
    return NextResponse.json(
      { success: false, message: "Sorry, but Pi Failed to provide a response" },
      { status: 500 }
    );
  }
}
