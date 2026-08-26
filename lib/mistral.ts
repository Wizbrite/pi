import { env } from "./config/env";

export class MistralClient {
  private apiKey: string;
  private baseUrl = "https://api.mistral.ai/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(messages: { role: "user" | "assistant" | "system"; content: string }[], model = "mistral-large-latest") {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Mistral API Error: ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  async chatStream(messages: { role: "user" | "assistant" | "system"; content: string }[], model = "mistral-large-latest") {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Mistral API Error: ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    return response; // Return the raw Response object which contains the readable stream
  }
}

export const mistral = new MistralClient(env.MISTRAL_API_KEY);
export default mistral;
