import { AIProvider } from "./provider";
import { GeminiProvider } from "./gemini-provider";
import { MockAIProvider } from "./mock-provider";

export function getAIProvider(): AIProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    return new GeminiProvider(apiKey, model);
  }

  // Graceful fallback to rich offline mock provider for assignment mode
  return new MockAIProvider();
}

export * from "./types";
export * from "./provider";
