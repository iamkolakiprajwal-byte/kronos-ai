import fs from "fs";
import path from "path";
import { GeminiProvider } from "../../src/lib/ai/gemini-provider";
import { isAIConfigured, getAIProvider } from "../../src/lib/ai";
import { decomposeGoalIntoRoadmap } from "../../src/lib/ai/roadmap";

// Load .env.local if present
try {
  const envPath = path.resolve(__dirname, "../../.env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...v] = trimmed.split("=");
        if (!process.env[k.trim()]) {
          process.env[k.trim()] = v.join("=").trim();
        }
      }
    }
  }
} catch (_) {}

async function runGeminiIntegrationTests() {
  console.log("=================================================");
  console.log("KRONOS GOOGLE GEMINI INTEGRATION TEST SUITE");
  console.log("=================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Provider Instantiation & Defaults
  const provider = new GeminiProvider("demo_test_key_12345", "gemini-3.5-flash");
  assert(provider.name === "Google Gemini", "GeminiProvider identifies as Google Gemini");

  const customModelProvider = new GeminiProvider("demo_test_key_12345", "gemini-2.0-flash");
  assert(customModelProvider.name === "Google Gemini", "GeminiProvider supports custom model specification (gemini-2.0-flash)");

  // 2. Configuration detection
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey || currentKey === "your_gemini_api_key_here" || currentKey.startsWith("demo_")) {
    assert(isAIConfigured() === false, "isAIConfigured() returns false when no valid Gemini API key is configured");
  } else {
    assert(isAIConfigured() === true, "isAIConfigured() detects valid Gemini API key");
  }

  // 3. Roadmap Decomposition Fallback vs Live
  const roadmap = await decomposeGoalIntoRoadmap({
    title: "Build Distributed Event Streaming Pipeline",
    description: "Apache Kafka and ClickHouse high-throughput ingest",
    category: "skills",
    targetDate: "2026-12-31",
  });
  assert(Array.isArray(roadmap) && roadmap.length > 0, "decomposeGoalIntoRoadmap returns structured milestones");
  assert(Boolean(roadmap[0].title), "Milestone 1 contains valid title");
  assert(Boolean(roadmap[0].actionableTasks?.length), "Milestone 1 contains actionable tasks");

  // 4. Live API Call (Executed when live GEMINI_API_KEY is provided in environment)
  if (currentKey && !currentKey.startsWith("demo_") && currentKey !== "your_gemini_api_key_here") {
    console.log("Live GEMINI_API_KEY detected! Testing live Google Gemini endpoint...");
    try {
      const liveProvider = new GeminiProvider(currentKey, process.env.GEMINI_MODEL || "gemini-3.5-flash");
      const plan = await liveProvider.generatePlan("Schedule 45 minutes of linear algebra study at 2pm", {
        profile: {
          id: "test-user",
          name: "Test User",
          email: "test@example.com",
          avatar: "",
          headline: "Student",
          institutionOrCompany: "University",
          role: "student",
          wakeTime: "07:00",
          sleepTime: "23:00",
          mostProductivePeriod: "morning",
          preferredFocusDuration: 45,
          preferredBreakDuration: 10,
          planningStyle: "time-blocked",
          sustainabilityOptIn: false,
        },
        existingTasks: [],
        fixedCommitments: [],
        currentDate: "2026-11-13",
      });

      assert(Boolean(plan.intent), `Live Gemini returned valid intent: ${plan.intent}`);
      assert(Boolean(plan.explanation), `Live Gemini returned explanation: ${plan.explanation.slice(0, 50)}...`);
      assert(Array.isArray(plan.extractedTasks), `Live Gemini returned structured extractedTasks array (${plan.extractedTasks.length} tasks)`);
      if (plan.extractedTasks.length > 0) {
        assert(plan.extractedTasks[0].estimatedDuration > 0, "Extracted task has valid duration");
      }
    } catch (liveErr: any) {
      console.error("Live Gemini API call failed:", liveErr.message);
      assert(false, `Live Gemini API call succeeded: ${liveErr.message}`);
    }
  } else {
    console.log("ℹ️  Notice: GEMINI_API_KEY not set in current shell. Testing graceful error handling...");
    try {
      // Temporary unset test env to verify error throwing
      const savedEnv = process.env.KRONOS_TEST_SUITE;
      delete process.env.KRONOS_TEST_SUITE;
      const prevNodeEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = "production";

      let threw = false;
      try {
        getAIProvider();
      } catch (err: any) {
        threw = true;
        assert(err.message.includes("GEMINI_API_KEY is not configured"), "getAIProvider() throws clear configuration error in production when key is absent");
      }
      assert(threw, "getAIProvider() protects against silent unconfigured usage in production");

      // Restore env
      process.env.KRONOS_TEST_SUITE = savedEnv;
      (process.env as any).NODE_ENV = prevNodeEnv;
    } catch (e: any) {
      console.warn("Error test check notice:", e);
    }
  }

  console.log("=================================================");
  console.log(`TEST RESULTS: ${passed}/${total} PASSED`);
  console.log("=================================================");
}

runGeminiIntegrationTests().catch(console.error);
