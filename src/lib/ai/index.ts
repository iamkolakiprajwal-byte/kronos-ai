import { AIProvider } from "./provider";
import { GeminiProvider } from "./gemini-provider";
import { MockAIProvider } from "./mock-provider";

export function getAIProvider(): AIProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  if (apiKey && apiKey !== "your_gemini_api_key_here" && !apiKey.startsWith("demo_")) {
    return new GeminiProvider(apiKey, model);
  }

  // Isolate mock provider strictly to test suites
  if (process.env.NODE_ENV === "test" || process.env.KRONOS_TEST_SUITE === "true") {
    return new MockAIProvider();
  }

  // In production/runtime, do not silently masquerade as mock. Explicitly report configuration requirement.
  throw new Error("GEMINI_API_KEY is not configured. Real AI features require a valid Gemini API key in .env.local.");
}

export function isAIConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey !== "your_gemini_api_key_here" && !apiKey.startsWith("demo_"));
}

export * from "./types";
export * from "./provider";
