/**
 * AI Provider Abstraction Layer
 *
 * Currently backed by Mistral AI.
 * Future swap: replace provider with Ollama by setting AI_PROVIDER=ollama
 * and pointing OLLAMA_BASE_URL to your local Ollama server.
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
}

export interface AiProvider {
  chat(messages: AiMessage[], options?: AiChatOptions): Promise<Response>;
}

// ─── Mistral Provider ──────────────────────────────────────────────────────────

class MistralProvider implements AiProvider {
  private baseUrl = "https://api.mistral.ai/v1";

  constructor(private apiKey: string) {}

  async chat(messages: AiMessage[], options: AiChatOptions = {}): Promise<Response> {
    const { model = "mistral-large-latest", temperature = 0.7, maxTokens = 1024, stream = false } = options;

    return fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      }),
    });
  }
}

// ─── Ollama Provider (ready for future use) ────────────────────────────────────

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
