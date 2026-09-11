"use client";

import { useState, useCallback, useRef } from "react";
import { AiMessage } from "@/lib/ai/provider";

interface UseAiTutorOptions {
  /** Initial system prompt to prepend to every conversation. */
  systemPrompt: string;
  /** Whether to use streaming (SSE) responses. Default: true */
  stream?: boolean;
}

interface UseAiTutorReturn {
  response: string;
  isLoading: boolean;
  error: string | null;
  ask: (userMessage: string) => Promise<void>;
  reset: () => void;
}

const RATE_LIMIT_MESSAGE =
  "Pi is temporarily busy — the AI service is under high demand. " +
  "Please wait a moment and try again.";

/**
 * useAiTutor
 *
 * A lightweight React hook that wraps the /api/ai/chat endpoint.
 * Supports both streaming (SSE, default) and non-streaming responses.
 * Maintains a conversation history for follow-up questions.
 *
 * Rate-limit resilience:
 * - The server-side provider already retries with exponential back-off and model fallbacks.
 * - If the server still returns 503 (all retries exhausted), this hook shows a clear,
 *   friendly message so the user knows to wait before trying again.
 */
export function useAiTutor({ systemPrompt, stream = true }: UseAiTutorOptions): UseAiTutorReturn {
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<AiMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const ask = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      setError(null);
      setResponse("");

      const messages: AiMessage[] = [
        { role: "system", content: systemPrompt },
        ...historyRef.current,
        { role: "user", content: userMessage },
      ];

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, stream }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          // Show rate-limit or provider error in a user-friendly way
          const isRateLimit = res.status === 503 || res.status === 429;
          const msg = isRateLimit
            ? RATE_LIMIT_MESSAGE
            : json.message || `Request failed (${res.status})`;
          throw new Error(msg);
        }

        if (stream) {
          // ── SSE streaming ────────────────────────────────────────────────
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let fullText = "";

          if (!reader) throw new Error("No response body");

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            // SSE lines look like: "data: {...}\n\n"
            const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

            for (const line of lines) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") break;
              try {
                const parsed = JSON.parse(jsonStr);
                const delta = parsed?.choices?.[0]?.delta?.content ?? "";
                if (delta) {
                  fullText += delta;
                  setResponse(fullText);
                }
              } catch {
                // ignore malformed chunks
              }
            }
          }

          // Persist to history for follow-up questions
          historyRef.current = [
            ...historyRef.current,
            { role: "user", content: userMessage },
            { role: "assistant", content: fullText },
          ];
        } else {
          // ── Non-streaming ────────────────────────────────────────────────
          const json = await res.json();
          const text = json.content ?? "";
          setResponse(text);

          historyRef.current = [
            ...historyRef.current,
            { role: "user", content: userMessage },
            { role: "assistant", content: text },
          ];
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err.message || "Failed to get AI response");
      } finally {
        setIsLoading(false);
      }
    },
    [systemPrompt, stream]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    historyRef.current = [];
    setResponse("");
    setError(null);
    setIsLoading(false);
  }, []);

  return { response, isLoading, error, ask, reset };
}
