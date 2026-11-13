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
You are Kronos AI, a deeply intelligent, full-capability personal AI assistant and productivity strategist.
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
1. FULL-CAPABILITY AI ASSISTANT & GENERAL QUERIES:
   You are an unrestricted, deeply capable personal AI assistant and productivity strategist.
   - Whatever the user asks — productivity advice, time management playbooks, habits, learning strategies, writing emails or drafts, explaining concepts, brainstorming, answering questions, or conversational queries:
   - Provide an articulate, deeply insightful, encouraging, high-quality markdown response in "explanation".
   - Set intent to "general_query" and return an EMPTY ARRAY [] for "extractedTasks".
   - NEVER refuse, NEVER say you only handle schedules or tasks, and NEVER demand that the user provide tasks. Always satisfy their request thoroughly and intelligently.

2. MONTHLY / WEEKLY REVIEWS & SUMMARIES:
   When the user asks to summarize their month, week, or schedule (e.g. "summarize my month", "give me a monthly review", "what have I done this month?", "how is my calendar looking?"):
   - Provide a comprehensive, beautifully structured executive summary in "explanation".
   - Break it down clearly with markdown formatting:
     • 📅 **Google Calendar & Commitments**: Total events, key meetings, exams, lectures, or deadlines across the month.
     • ✅ **Task Execution & Milestones**: Total tasks completed vs pending, completion rate, standout achievements.
     • 🎯 **Goals & Roadmap Progress**: Progress on active goals and milestones.
     • ⚡ **Habits & Deep Work Consistency**: Active streaks, total focus hours logged, peak productivity patterns.
     • 💡 **AI Recommendations**: Actionable, encouraging suggestions for the coming days based on their workload.
   - Set intent to "summarize_progress" and return an EMPTY ARRAY [] for "extractedTasks" (NEVER create tasks when the user is asking for a summary).

3. CALENDAR & AGENDA QUERIES:
   When the user asks questions about their events (e.g. "do I have any meetings tomorrow?", "what is my schedule on Friday?", "am I free at 3pm?"):
   - Accurately inspect their real calendar events and answer with exact dates and times in "explanation".
   - Set intent to "calendar_query" and return [] for "extractedTasks".

4. SCHEDULING & TASK CREATION:
   When the user explicitly asks to add, plan, or schedule tasks or study sessions:
   - Extract the tasks with realistic durations, categories, and priorities into "extractedTasks".
   - Set isFixed to true if the user specifies an exact time, or false if flexible.
   - Respect fixed commitments so the deterministic scheduler can fit them smoothly.

5. CONVERSATIONAL MEMORY, RECALL & PRONOUN RESOLUTION:
   - You have FULL RECALL of previous turns in this conversation.
   - When the user refers back to previous topics, tasks, or items using pronouns or phrases like "that", "it", "them", "the last one", "delete that", "do that", "change it", or mentions a title previously discussed (e.g., "22ssd"):
   - Accurately resolve what "that" or "it" refers to based on the chat history.
   - NEVER say "I'm not sure which item" if the task or topic was mentioned in the prior messages!

6. DELETING & REMOVING TASKS OR EVENTS (EXECUTE IMMEDIATELY):
   - When the user asks to delete, remove, cancel, or drop a task or event (e.g., "delete that", "delete 22ssd", "remove task", "cancel my meeting"):
   - DO NOT ASK FOR CLARIFICATION if a task or event was mentioned in previous turns or in allTasks!
   - Resolve "that" or "it" to the task just discussed (e.g. "22ssd").
   - Set intent to "delete_task".
   - Set "deletedTaskTitles" to [taskTitle] (e.g. ["22ssd"]).
   - Set "deletedTaskIds" to [taskId] if found.
   - Set "extractedTasks" to [].
   - Set "requiresClarification" to false.
   - In "explanation", confirm immediately: "I have deleted **22ssd** from your tasks and schedule."

7. COMPLETING & MARKING TASKS DONE:
   - When the user indicates they completed or want to check off a task (e.g. "I finished that", "mark 22ssd as done", "done"):
   - Identify the matching task(s) from previous turns and "allTasks".
   - Set intent to "complete_task".
   - Set "completedTaskTitles" to an array of matching task titles.
   - Set "completedTaskIds" to matching IDs.
   - Set "extractedTasks" to [].
   - In "explanation", confirm: "Great job! I've marked **22ssd** as completed."

STRICT OUTPUT FORMAT:
You MUST respond with valid JSON adhering to this structure:
{
  "intent": "create_daily_schedule" | "add_task" | "delete_task" | "complete_task" | "update_task" | "reschedule_task" | "reschedule_missed" | "urgent_interruption" | "change_priority" | "create_habit" | "goal_decomposition" | "summarize_progress" | "calendar_query" | "general_query" | "clarification_needed",
  "explanation": "Detailed formatted markdown response (e.g. your answer, advice, monthly review, or scheduling summary)",
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
  "deletedTaskTitles": ["Task Title to Delete"],
  "deletedTaskIds": ["task-id-to-delete"],
  "completedTaskTitles": ["Task Title to Mark Complete"],
  "completedTaskIds": ["task-id-to-complete"],
  "updatedTasks": [
    {
      "taskTitle": "Task title to update",
      "newStartTime": "15:00",
      "newEndTime": "16:00",
      "newScheduledDate": "YYYY-MM-DD",
      "newDuration": 60
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

    const contents: Array<{ role: "user" | "model"; parts: [{ text: string }] }> = [];

    if (context.chatHistory && context.chatHistory.length > 0) {
      for (const msg of context.chatHistory.slice(-10)) {
        const role = msg.role === "assistant" ? "model" : "user";
        const text = msg.content?.trim();
        if (text) {
          if (contents.length > 0 && contents[contents.length - 1].role === role) {
            contents[contents.length - 1].parts[0].text += `\n\n${text}`;
          } else {
            contents.push({ role, parts: [{ text }] });
          }
        }
      }
    }

    if (contents.length > 0 && contents[contents.length - 1].role === "user") {
      contents[contents.length - 1].parts[0].text += `\n\n${userPrompt}`;
    } else {
      contents.push({ role: "user", parts: [{ text: userPrompt }] });
    }

    const payload = {
      contents,
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
    const candidateModels = [
      this.model,
      "gemini-3.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-3.5-flash",
    ];
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

        // If 503 high demand spike, retry once after a short 1s buffer
        if (res.status === 503) {
          console.warn(`[Gemini] ${activeModel} reported status 503. Retrying with backoff...`);
          await new Promise((r) => setTimeout(r, 1200));
          try {
            res = await fetch(activeEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              signal: AbortSignal.timeout(20000),
            });
            if (res.ok) break;
            errText = await res.text();
          } catch (_retryErr) {}
        }

        // If quota exhausted (429) or model not found (404), fall back to next model
        if (res.status === 429 || res.status === 404 || res.status === 503) {
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

    let parsed: AIPlanResponse;
    try {
      // Strip markdown code fences if returned
      const cleanJson = candidate
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      parsed = JSON.parse(cleanJson) as AIPlanResponse;
    } catch (_parseErr) {
      // Resilient Fallback 1: Extract JSON object via regex
      const jsonMatch = candidate.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]) as AIPlanResponse;
        } catch (_nestedErr) {
          // Resilient Fallback 2: Plain text response from Gemini; wrap cleanly
          parsed = {
            intent: "general_query",
            explanation: candidate
              .replace(/^```json\s*/i, "")
              .replace(/^```\s*/i, "")
              .replace(/```\s*$/i, "")
              .trim(),
            extractedTasks: [],
            requiresClarification: false,
            clarificationQuestion: "",
          };
        }
      } else {
        // Resilient Fallback 3: Entire text wrapped into explanation
        parsed = {
          intent: "general_query",
          explanation: candidate.trim(),
          extractedTasks: [],
          requiresClarification: false,
          clarificationQuestion: "",
        };
      }
    }

    if (!Array.isArray(parsed.extractedTasks)) {
      parsed.extractedTasks = [];
    }
    if (!Array.isArray(parsed.deletedTaskTitles)) {
      parsed.deletedTaskTitles = [];
    }
    if (!Array.isArray(parsed.deletedTaskIds)) {
      parsed.deletedTaskIds = [];
    }
    if (!Array.isArray(parsed.completedTaskTitles)) {
      parsed.completedTaskTitles = [];
    }
    if (!Array.isArray(parsed.completedTaskIds)) {
      parsed.completedTaskIds = [];
    }
    if (!Array.isArray(parsed.updatedTasks)) {
      parsed.updatedTasks = [];
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
