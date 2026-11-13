import { AIProvider } from "./provider";
import { AIPlanResponse, UserScheduleContext } from "./types";

export class GeminiProvider implements AIProvider {
  name = "Google Gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-3.5-flash") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generatePlan(
    userPrompt: string,
    context: UserScheduleContext
  ): Promise<AIPlanResponse> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const systemInstruction = `
You are Kronos AI, an expert personal productivity and time-management assistant.
Your goal is to parse user intentions, extract tasks with realistic durations, and assign sensible priorities.
You MUST consider the user's profile:
- Role: ${context.profile.role}
- Waking target: ${context.profile.wakeTime}
- Sleep boundary: ${context.profile.sleepTime}
- Peak focus period: ${context.profile.mostProductivePeriod}
- Preferred focus length: ${context.profile.preferredFocusDuration} min
- Fixed commitments: ${JSON.stringify(context.fixedCommitments)}

CRITICAL CONSTRAINTS:
1. Never hallucinate overlapping slots over fixed commitments.
2. Return strictly valid JSON adhering to the specified schema.
3. CONVERSATIONAL & GENERAL QUERIES: If the user message is a conversational query, greeting, or question (e.g. "what are you doing", "who are you", "what can you do", "hello", "how are you", "what is on my schedule today"), you MUST set intent to "general_query", provide a helpful, natural conversational reply in "explanation", and return an EMPTY ARRAY [] for "extractedTasks". NEVER create a task from a casual question!
4. Only extract tasks if the user explicitly mentions tasks, study blocks, meetings, or activities they want to do or reschedule.
5. Be calm, practical, and supportive.
`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        intent: {
          type: "STRING",
          enum: [
            "create_daily_schedule",
            "add_task",
            "reschedule_task",
            "reschedule_missed",
            "urgent_interruption",
            "change_priority",
            "create_habit",
            "goal_decomposition",
            "general_query",
            "clarification_needed",
          ],
        },
        explanation: { type: "STRING" },
        extractedTasks: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              description: { type: "STRING" },
              category: {
                type: "STRING",
                enum: ["study", "work", "personal", "habit", "errand", "sustainability"],
              },
              priority: {
                type: "STRING",
                enum: ["urgent", "high", "medium", "low"],
              },
              estimatedDuration: { type: "INTEGER" },
              startTime: { type: "STRING" },
              endTime: { type: "STRING" },
              deadline: { type: "STRING" },
              isFixed: { type: "BOOLEAN" },
              tag: { type: "STRING" },
              energyLevel: {
                type: "STRING",
                enum: ["high", "medium", "low"],
              },
            },
            required: ["title", "category", "priority", "estimatedDuration", "isFixed"],
          },
        },
        extractedHabit: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            cue: { type: "STRING" },
            category: {
              type: "STRING",
              enum: ["focus", "learning", "health", "mindfulness", "eco"],
            },
            frequency: {
              type: "STRING",
              enum: ["daily", "weekdays", "3x_week", "weekly"],
            },
            minimumVersion: { type: "STRING" },
            targetDurationMinutes: { type: "INTEGER" },
          },
          required: ["title", "cue", "category", "frequency"],
        },
        extractedGoal: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            category: {
              type: "STRING",
              enum: ["academic", "career", "skills", "personal"],
            },
            priority: {
              type: "STRING",
              enum: ["urgent", "high", "medium", "low"],
            },
            targetTimeline: { type: "STRING" },
            milestones: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  dueDate: { type: "STRING" },
                },
                required: ["title"],
              },
            },
          },
          required: ["title", "category", "priority", "targetTimeline", "milestones"],
        },
        detectedPreferences: {
          type: "OBJECT",
          properties: {
            preferred_study_duration: { type: "INTEGER" },
            preferred_break_duration: { type: "INTEGER" },
            preferred_exercise_time: { type: "STRING" },
          },
        },
        requiresClarification: { type: "BOOLEAN" },
        clarificationQuestion: { type: "STRING" },
      },
      required: ["intent", "explanation", "extractedTasks", "requiresClarification"],
    };

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidate) {
      throw new Error("No structured response content received from Gemini.");
    }

    // Strip markdown formatting if returned
    const cleanJson = candidate.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleanJson) as AIPlanResponse;

    // Normalize habit & goal suggestions for backwards compatibility with UI
    if (parsed.extractedHabit && !(parsed as any).suggestedHabit) {
      (parsed as any).suggestedHabit = parsed.extractedHabit;
    }
    if (parsed.extractedGoal && !(parsed as any).suggestedGoal) {
      (parsed as any).suggestedGoal = parsed.extractedGoal;
    }

    return parsed;
  }
}
