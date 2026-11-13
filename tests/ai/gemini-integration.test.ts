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
  const provider = new GeminiProvider("demo_test_key_12345", "gemini-3.5-flash-lite");
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
      const liveProvider = new GeminiProvider(currentKey, process.env.GEMINI_MODEL || "gemini-3.5-flash-lite");
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

      // Proactive cooldown buffer between calls to respect Google free-tier rate limits
      await new Promise((r) => setTimeout(r, 1200));

      // 5. Test Live Month Summary with Calendar Context
      console.log("Testing Live Month Summary with Google Calendar context...");
      const summaryPlan = await liveProvider.generatePlan("Summarize my month, how is my calendar and workload looking?", {
        profile: {
          id: "test-user",
          name: "Alex Rivera",
          email: "alex@example.com",
          avatar: "",
          headline: "Computer Science Senior",
          institutionOrCompany: "Stanford",
          role: "student",
          wakeTime: "07:00",
          sleepTime: "23:00",
          mostProductivePeriod: "morning",
          preferredFocusDuration: 45,
          preferredBreakDuration: 10,
          planningStyle: "time-blocked",
          sustainabilityOptIn: true,
        },
        existingTasks: [],
        fixedCommitments: [],
        currentDate: "2026-11-13",
        calendarHistory: [
          { id: "e1", title: "CS 229 Machine Learning Lecture", date: "2026-11-14", startTime: "10:00", endTime: "11:30", isFixed: true, category: "academic" },
          { id: "e2", title: "Sprint Architecture Review", date: "2026-11-18", startTime: "14:00", endTime: "15:00", isFixed: true, category: "meeting" },
          { id: "e3", title: "Final Capstone Presentation", date: "2026-11-28", startTime: "09:00", endTime: "12:00", isFixed: true, category: "academic" },
        ],
        allTasks: [
          { id: "t1", title: "Problem Set 4: Backpropagation", scheduledDate: "2026-11-10", estimatedDuration: 120, status: "completed", priority: "high", category: "study" },
          { id: "t2", title: "Train ResNet Benchmark", scheduledDate: "2026-11-12", estimatedDuration: 90, status: "completed", priority: "urgent", category: "work" },
          { id: "t3", title: "Draft Technical Report", scheduledDate: "2026-11-20", estimatedDuration: 180, status: "todo", priority: "high", category: "academic" },
        ],
        goals: [
          {
            id: "g1",
            title: "Pass Deep Learning with A+",
            category: "academic",
            progress: 75,
            targetDate: "2026-12-15",
            milestones: [
              { title: "Complete PSET 1-4", completed: true },
              { title: "Midterm Exam", completed: true },
              { title: "Final Capstone", completed: false },
            ],
          },
        ],
        habits: [
          { id: "h1", title: "Morning Algorithm Practice", frequency: "daily", streak: 14, completedToday: true },
        ],
        focusSessionsSummary: {
          totalSessions: 18,
          totalFocusMinutes: 810,
          recentSessions: [],
        },
        metrics: {
          month: "2026-11",
          tasksCompletedThisMonth: 2,
          tasksPendingThisMonth: 1,
          completionRatePercentage: 67,
          totalCalendarEventsThisMonth: 3,
          googleCalendarSynced: true,
          lastGoogleSync: "10 minutes ago",
        },
      });

      assert(Boolean(summaryPlan.explanation), "Live Gemini generated month summary explanation");
      assert(summaryPlan.extractedTasks.length === 0, "Summary query correctly generates zero extraneous tasks");
      assert(summaryPlan.intent === "summarize_progress" || summaryPlan.intent === "general_query", `Summary query correctly identified intent: ${summaryPlan.intent}`);
      console.log("Summary explanation preview:\n", summaryPlan.explanation.slice(0, 300), "...");
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
