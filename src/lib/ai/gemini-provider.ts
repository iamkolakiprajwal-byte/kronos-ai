import { AIProvider } from "./provider";
import { AIPlanResponse, UserScheduleContext } from "./types";

export class GeminiProvider implements AIProvider {
  name = "Google Gemini";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-3.5-flash-lite") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generatePlan(
    userPrompt: string,
    context: UserScheduleContext
  ): Promise<AIPlanResponse> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    // Format user data assets for comprehensive context awareness
    const calendarEventsText =
      context.calendarHistory && context.calendarHistory.length > 0
        ? JSON.stringify(
            context.calendarHistory.map((e) => ({
              title: e.title,
              date: e.date,
              time: `${e.startTime} - ${e.endTime}`,
              isFixed: e.isFixed,
              category: e.category,
            })),
            null,
            2
          )
        : JSON.stringify(context.fixedCommitments, null, 2);

    const allTasksText =
      context.allTasks && context.allTasks.length > 0
        ? JSON.stringify(
            context.allTasks.map((t) => ({
              title: t.title,
              scheduledDate: t.scheduledDate,
              status: t.status,
              priority: t.priority,
              category: t.category,
              durationMin: t.estimatedDuration,
            })),
            null,
            2
          )
        : JSON.stringify(context.existingTasks, null, 2);

    const goalsText =
      context.goals && context.goals.length > 0
        ? JSON.stringify(
            context.goals.map((g) => ({
              title: g.title,
              progress: `${g.progress}%`,
              targetDate: g.targetDate,
              category: g.category,
              milestones: g.milestones?.map(
                (m) => `${m.title} (${m.completed ? "COMPLETED" : "PENDING"})`
              ),
            })),
            null,
            2
          )
        : "No active goals registered";

    const habitsText =
      context.habits && context.habits.length > 0
        ? JSON.stringify(
            context.habits.map((h) => ({
              title: h.title,
              frequency: h.frequency,
              cue: h.cue,
              streak: h.streak || 0,
              completedToday: h.completedToday || false,
            })),
            null,
            2
          )
        : "No habits registered";

    const focusText = context.focusSessionsSummary
      ? JSON.stringify(context.focusSessionsSummary, null, 2)
      : "No focus sessions logged yet";

    const metricsText = context.metrics
      ? JSON.stringify(context.metrics, null, 2)
      : "N/A";

    const systemInstruction = `
You are Kronos AI, an expert, deeply intelligent personal productivity, scheduling, and calendar assistant.
You have FULL ACCESS to the user's complete schedule, Google Calendar events, tasks, goals, habits, focus logs, and monthly productivity metrics.

CURRENT WORKSPACE CONTEXT:
- Today's Reference Date: ${context.currentDate}
- User Profile: ${context.profile.name} (${context.profile.role}), wakes at ${context.profile.wakeTime}, sleeps at ${context.profile.sleepTime}, peak focus: ${context.profile.mostProductivePeriod}, focus block: ${context.profile.preferredFocusDuration} min.
- Google Calendar Sync Status: ${context.metrics?.googleCalendarSynced ? "LIVE SYNCED with Google Calendar" : "Local Agenda"} (Last Synced: ${context.metrics?.lastGoogleSync || "Recent"}).

USER DATA ASSETS:
1. COMPLETE GOOGLE CALENDAR & SCHEDULE EVENTS:
${calendarEventsText}

2. ALL USER TASKS (Past, Present & Future):
${allTasksText}

3. GOALS & MILESTONES:
${goalsText}

4. ACTIVE HABITS:
${habitsText}

5. FOCUS / DEEP WORK SESSIONS:
${focusText}

6. MONTHLY PRODUCTIVITY METRICS:
${metricsText}

YOUR CAPABILITIES & RULES:
1. MONTHLY / WEEKLY REVIEWS & SUMMARIES:
   When the user asks to summarize their month, week, or schedule (e.g. "summarize my month", "give me a monthly review", "what have I done this month?", "how is my calendar looking?"):
   - Provide a comprehensive, beautifully structured executive summary in "explanation".
   - Break it down clearly with markdown formatting:
     • 📅 **Google Calendar & Commitments**: Total events, key meetings, exams, lectures, or deadlines across the month.
     • ✅ **Task Execution & Milestones**: Total tasks completed vs pending, completion rate, standout achievements.
     • 🎯 **Goals & Roadmap Progress**: Progress on active goals and milestones.
     • ⚡ **Habits & Deep Work Consistency**: Active streaks, total focus hours logged, peak productivity patterns.
     • 💡 **AI Recommendations**: Actionable, encouraging suggestions for the coming days based on their workload.
   - Set intent to "summarize_progress" and return an EMPTY ARRAY [] for "extractedTasks" (NEVER create tasks when the user is asking for a summary).

2. CALENDAR & AGENDA QUERIES:
   When the user asks questions about their events (e.g. "do I have any meetings tomorrow?", "what is my schedule on Friday?", "am I free at 3pm?"):
   - Accurately inspect their real calendar events and answer with exact dates and times in "explanation".
   - Set intent to "calendar_query" and return [] for "extractedTasks".

3. SCHEDULING & TASK CREATION:
   When the user explicitly asks to add, plan, or schedule tasks or study sessions:
   - Extract the tasks with realistic durations, categories, and priorities into "extractedTasks".
   - Set isFixed to true if the user specifies an exact time, or false if flexible.
   - Respect fixed commitments so the deterministic scheduler can fit them smoothly.

4. CONVERSATIONAL & GENERAL QUERIES:
   If the user asks casual questions or greetings ("hello", "who are you", "what can you do"), set intent to "general_query", provide a helpful, natural reply in "explanation", and return an EMPTY ARRAY [] for "extractedTasks".

STRICT OUTPUT FORMAT:
You MUST respond with 100% valid JSON adhering to this structure:
{
  "intent": "create_daily_schedule" | "add_task" | "reschedule_task" | "reschedule_missed" | "urgent_interruption" | "change_priority" | "create_habit" | "goal_decomposition" | "summarize_progress" | "calendar_query" | "general_query" | "clarification_needed",
  "explanation": "Detailed formatted markdown response (e.g. your monthly review or query answer)",
  "extractedTasks": [
    {
      "title": "Task title",
      "category": "study" | "work" | "personal" | "habit" | "errand" | "sustainability",
      "priority": "urgent" | "high" | "medium" | "low",
      "estimatedDuration": 45,
      "startTime": "14:00",
      "endTime": "14:45",
      "isFixed": true,
      "tag": "optional"
    }
  ],
  "extractedHabit": {
    "title": "Habit title",
    "cue": "Habit cue",
    "category": "focus" | "learning" | "health" | "mindfulness" | "eco",
    "frequency": "daily" | "weekdays" | "3x_week" | "weekly",
    "minimumVersion": "2-min rule version",
    "targetDurationMinutes": 15
  },
  "extractedGoal": {
    "title": "Goal title",
    "category": "academic" | "career" | "skills" | "personal",
    "priority": "urgent" | "high" | "medium" | "low",
    "targetTimeline": "Next 60 Days",
    "milestones": [{ "title": "Milestone 1", "dueDate": "YYYY-MM-DD" }]
  },
  "detectedPreferences": {
    "preferred_study_duration": 45
  },
  "requiresClarification": false,
  "clarificationQuestion": ""
}
`;

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
        temperature: 0.2,
      },
    };

    let res: Response | null = null;
    let errText = "";
    const candidateModels = [this.model, "gemini-3.5-flash-lite", "gemini-3.5-flash"];
    const uniqueModels = Array.from(new Set(candidateModels));

    for (const activeModel of uniqueModels) {
      const activeEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${this.apiKey}`;
      try {
        res = await fetch(activeEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(20000),
        });

        if (res.ok) break;

        errText = await res.text();
        // If quota exhausted (429) or model not found (404), fall back to next model
        if (res.status === 429 || res.status === 404) {
          console.warn(`[Gemini] ${activeModel} reported status ${res.status}. Falling back to next candidate...`);
          continue;
        }
        break;
      } catch (fetchErr: any) {
        errText = fetchErr.message;
        console.warn(`[Gemini] ${activeModel} fetch failed: ${fetchErr.message}. Trying next candidate...`);
      }
    }

    if (!res || !res.ok) {
      throw new Error(`Gemini API Error (${res?.status || "network"}): ${errText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidate) {
      throw new Error("No structured response content received from Gemini.");
    }

    // Strip markdown formatting if returned
    const cleanJson = candidate.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleanJson) as AIPlanResponse;

    if (!Array.isArray(parsed.extractedTasks)) {
      parsed.extractedTasks = [];
    }

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
