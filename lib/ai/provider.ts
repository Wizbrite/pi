/**
 * AI Provider Abstraction Layer
 *
 * Currently backed by Mistral AI.
 * Future swap: replace provider with Ollama by setting AI_PROVIDER=ollama
 * and pointing OLLAMA_BASE_URL to your local Ollama server.
 *
 * 429 Handling Strategy:
 * - Exponential back-off: 2s → 4s → 8s per attempt
 * - Model fallback hierarchy: mistral-small-latest → open-mistral-nemo → open-mistral-7b
 * - For streaming requests, 429s are retried by re-issuing the request (stream body is NOT consumed on 429)
 * - After all retries exhausted, returns a synthetic 503 JSON response with a user-friendly message
 */

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  /** Mistral structured-output mode. Unsupported providers may ignore it. */
  responseFormat?: "json_object";
}

export interface AiProvider {
  chat(messages: AiMessage[], options?: AiChatOptions): Promise<Response>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function makeRateLimitResponse(message = "The AI assistant is temporarily busy due to high demand. Please wait a moment and try again.") {
  return new Response(
    JSON.stringify({ error: { message } }),
    { status: 503, headers: { "Content-Type": "application/json" } }
  );
}

// ─── Mistral Provider with Exponential Backoff & Model Fallback ────────────────

class MistralProvider implements AiProvider {
  private baseUrl = "https://api.mistral.ai/v1";

  // Model fallback order — all are available on Mistral's free tier
  private readonly modelFallbacks = [
    "open-mistral-nemo",
    "open-mistral-7b",
    "mistral-small-latest",
  ];

  constructor(private apiKey: string) {}

  async chat(messages: AiMessage[], options: AiChatOptions = {}): Promise<Response> {
    const {
      temperature = 0.7,
      maxTokens = 1024,
      stream = false,
      responseFormat,
    } = options;

    // Build the ordered list of models to try
    const requestedModel = options.model || "open-mistral-nemo";
    const modelCandidates = Array.from(
      new Set([requestedModel, ...this.modelFallbacks])
    );

    const maxRetriesPerModel = 3;

    for (const modelCandidate of modelCandidates) {
      for (let attempt = 0; attempt < maxRetriesPerModel; attempt++) {
        let res: Response;

        try {
          res = await fetch(`${this.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
              model: modelCandidate,
              messages,
              temperature,
              max_tokens: maxTokens,
              stream,
              ...(responseFormat ? { response_format: { type: responseFormat } } : {}),
            }),
          });
        } catch (networkErr) {
          // Network-level error (DNS, timeout, etc.)
          console.error(
            `[AI Provider] Network error (model: ${modelCandidate}, attempt ${attempt + 1}):`,
            networkErr
          );
          if (attempt < maxRetriesPerModel - 1) {
            await sleep(2000 * Math.pow(2, attempt)); // 2s, 4s
          }
          continue;
        }

        // Non-rate-limit responses are returned immediately (success or other errors)
        if (res.status !== 429) {
          if (!res.ok) {
            console.warn(
              `[AI Provider] Non-retryable error: HTTP ${res.status} (model: ${modelCandidate})`
            );
          }
          return res;
        }

        // ── 429 Rate Limit ─────────────────────────────────────────────────────
        // Read Retry-After header if provided; otherwise use exponential back-off
        const retryAfterHeader = res.headers.get("retry-after");
        let waitMs = 2000 * Math.pow(2, attempt); // 2s, 4s, 8s

        if (retryAfterHeader) {
          const parsedSeconds = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
            waitMs = Math.min(parsedSeconds * 1000, 15_000); // cap at 15s
          }
        }

        console.warn(
          `⚠️ [AI Provider] 429 Rate Limit (model: ${modelCandidate}, attempt ${attempt + 1}/${maxRetriesPerModel}). ` +
            `Waiting ${waitMs}ms before retry...`
        );

        // For streaming requests the body is NOT consumed on 429 (Mistral returns
        // a small JSON error body, not a stream). We can safely discard it and retry.
        if (stream) {
          await res.body?.cancel().catch(() => {});
        }

        await sleep(waitMs);
        // Continue to next attempt or fall through to next model
      }

      console.warn(
        `⚠️ [AI Provider] All ${maxRetriesPerModel} attempts failed for model "${modelCandidate}". ` +
          `Trying next fallback model...`
      );
    }

    // All models and retries exhausted — return a friendly 503
    console.error("[AI Provider] All models and retries exhausted.");
    return makeRateLimitResponse();
  }
}

// ─── Ollama Provider (ready for local deployment) ──────────────────────────────

class OllamaProvider implements AiProvider {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async chat(messages: AiMessage[], options: AiChatOptions = {}): Promise<Response> {
    const { model = "llama3", stream = false } = options;

    return fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream }),
    });
  }
}

// ─── Factory ───────────────────────────────────────────────────────────────────

export function getAiProvider(): AiProvider {
  const providerName = process.env.AI_PROVIDER ?? "mistral";

  if (providerName === "ollama") {
    const ollamaUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
    return new OllamaProvider(ollamaUrl);
  }

  // Default: Mistral
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY is not set in environment variables.");
  return new MistralProvider(apiKey);
}
