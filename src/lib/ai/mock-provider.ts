import { AIProvider } from "./provider";
import { AIPlanResponse, UserScheduleContext, ExtractedTask } from "./types";

export class MockAIProvider implements AIProvider {
  name = "Mock AI Assistant (Offline Demo Mode)";

  async generatePlan(
    userPrompt: string,
    context: UserScheduleContext
  ): Promise<AIPlanResponse> {
    const trimmed = userPrompt.trim();
    const lower = trimmed.toLowerCase();

    // 1. Identity, Purpose & "What are you doing" conversational inquiries
    const isIdentityOrRoleQuestion =
      lower.includes("what are you doing") ||
      lower.includes("what r u doing") ||
      lower.includes("who are you") ||
      lower.includes("what can you do") ||
      lower.includes("what do you do") ||
      lower.includes("how does this work") ||
      lower.includes("what is this") ||
      lower.includes("tell me about yourself") ||
      lower.includes("help me understand");

    if (isIdentityOrRoleQuestion) {
      return {
        intent: "general_query",
        explanation:
          `I am Kronos AI, your intelligent personal planning and time-management assistant.\n\n` +
          `I analyze your fixed commitments (lectures, labs, meetings), daily biological rhythms, energy curves, and habits to create realistic, collision-free schedules.\n\n` +
          `Here is what you can ask me:\n` +
          `• Tell me your daily intentions: "Today I have two assignments to complete, need to study economics, hit the gym and learn Blender."\n` +
          `• Handle interruptions: "I have an urgent meeting at 4 PM, please adjust my schedule."\n` +
          `• Adapt dynamically: "I couldn't finish my morning study session, please reschedule."\n` +
          `• Check your agenda: "What's on my schedule today?"`,
        extractedTasks: [],
        requiresClarification: false,
      };
    }

    // 2. Greetings and polite small talk
    const isGreeting =
      lower === "hi" ||
      lower === "hello" ||
      lower === "hey" ||
      lower.startsWith("hi ") ||
      lower.startsWith("hello ") ||
      lower.startsWith("hey ") ||
      lower.includes("good morning") ||
      lower.includes("good afternoon") ||
      lower.includes("good evening") ||
      lower.includes("how are you") ||
      lower.includes("what's up") ||
      lower.includes("whats up");

    if (isGreeting) {
      const activeTaskCount = context.existingTasks.filter((t) => t.status !== "completed").length;
      return {
        intent: "general_query",
        explanation:
          `Hello ${context.profile.name.split(" ")[0]}! I'm ready to organize your day.\n\n` +
          `You currently have ${context.fixedCommitments.length} fixed commitment(s) and ${activeTaskCount} active task(s) on your agenda. What would you like to achieve today?`,
        extractedTasks: [],
        requiresClarification: false,
      };
    }

    // 3. Agenda Status & Schedule Overview Inquiries
    const isScheduleInquiry =
      lower.includes("what is on my schedule") ||
      lower.includes("what's on my schedule") ||
      lower.includes("show my schedule") ||
      lower.includes("show me my schedule") ||
      lower.includes("what do i have today") ||
      lower.includes("what do i have next") ||
      lower.includes("what's next") ||
      lower.includes("whats next") ||
      lower.includes("my agenda") ||
      lower.includes("my tasks today") ||
      lower.includes("list my tasks");

    if (isScheduleInquiry) {
      const fixedList =
        context.fixedCommitments.length > 0
          ? context.fixedCommitments.map((c) => `• ${c.title} (${c.startTime}–${c.endTime}) [Fixed]`).join("\n")
          : "• No fixed commitments today.";

      const activeTasks = context.existingTasks.filter((t) => t.status !== "completed");
      const taskList =
        activeTasks.length > 0
          ? activeTasks.map((t) => `• ${t.title} (${t.estimatedDuration}m, ${t.priority} priority)`).join("\n")
          : "• No open tasks on today's agenda.";

      return {
        intent: "general_query",
        explanation:
          `Here is your day at a glance for ${context.currentDate}:\n\n` +
          `**Fixed Timetable Commitments:**\n${fixedList}\n\n` +
          `**Pending Tasks:**\n${taskList}\n\n` +
          `Your target bedtime is ${context.profile.sleepTime}. Tell me if you'd like to add new focus blocks or reschedule anything!`,
        extractedTasks: [],
        requiresClarification: false,
      };
    }

    // 4. Master Prompt Scenario (Assignments + Economics + Gym + Blender)
    if (
      lower.includes("two assignments") ||
      (lower.includes("economics") && (lower.includes("gym") || lower.includes("blender")))
    ) {
      const extracted: ExtractedTask[] = [
        {
          title: "Complete Economics Problem Set #3",
          description: "Draft mathematical proofs for questions 4 through 8.",
          category: "study",
          priority: "urgent",
          estimatedDuration: 60,
          startTime: "14:00",
          endTime: "15:00",
          deadline: `${context.currentDate} 21:00`,
          isFixed: false,
          tag: "ECON 201",
          energyLevel: "high",
        },
        {
          title: "Conditioning & Gym Session",
          description: "Strength workout followed by mobility stretch.",
          category: "personal",
          priority: "medium",
          estimatedDuration: 50,
          startTime: "16:00",
          endTime: "16:50",
          isFixed: false,
          tag: "Wellness",
          energyLevel: "medium",
        },
        {
          title: "Blender 3D Modeling Practice",
          description: "Geometry nodes and procedural shader fundamentals.",
          category: "personal",
          priority: "low",
          estimatedDuration: 45,
          startTime: "18:00",
          endTime: "18:45",
          isFixed: false,
          tag: "Creative",
          energyLevel: "medium",
        },
      ];

      return {
        intent: "create_daily_schedule",
        explanation: `I've mapped out your request around your fixed commitments (${context.fixedCommitments.length} fixed classes/syncs). Economics is placed at 14:00 during your peak focus window, followed by gym conditioning at 16:00 and Blender learning at 18:00. Your ${context.profile.sleepTime} sleep boundary is fully protected.`,
        extractedTasks: extracted,
        detectedPreferences: {
          preferred_study_duration: 60,
          preferred_break_duration: 15,
        },
        requiresClarification: false,
      };
    }

    // 5. Urgent meeting interruption scenario
    if (lower.includes("urgent") || lower.includes("meeting") || lower.includes("4 pm") || lower.includes("4pm")) {
      const urgentTask: ExtractedTask = {
        title: "Urgent Meeting / Stakeholder Sync",
        description: "Registered interruption requiring schedule adjustment.",
        category: "work",
        priority: "urgent",
        estimatedDuration: 45,
        startTime: "16:00",
        endTime: "16:45",
        isFixed: true,
        tag: "Urgent",
        energyLevel: "high",
      };

      return {
        intent: "urgent_interruption",
        explanation: `I have registered an urgent 4:00 PM commitment. To accommodate this without compromising your sleep target (${context.profile.sleepTime}), I've shifted flexible personal activities into the post-dinner 19:30 slot.`,
        extractedTasks: [urgentTask],
        requiresClarification: false,
      };
    }

    // 6. Rescheduling missed session
    if (lower.includes("reschedule") || lower.includes("couldn't") || lower.includes("missed") || lower.includes("didn't finish")) {
      const rescheduledTask: ExtractedTask = {
        title: "Rescheduled Focus Block",
        description: "Unfinished morning material re-allocated to evening buffer.",
        category: context.profile.role === "student" ? "study" : "work",
        priority: "high",
        estimatedDuration: context.profile.preferredFocusDuration,
        startTime: "19:30",
        endTime: "20:30",
        isFixed: false,
        tag: "Rescheduled",
        energyLevel: "medium",
      };

      return {
        intent: "reschedule_missed",
        explanation: `Life happens—no problem at all! I've preserved your fixed afternoon commitments and shifted the remaining ${context.profile.preferredFocusDuration}-minute focus block to 19:30 after dinner. This keeps your wind-down time intact.`,
        extractedTasks: [rescheduledTask],
        requiresClarification: false,
      };
    }

    // 7. Goal roadmap query
    if (lower.includes("blender in 30 days") || lower.includes("goal") || lower.includes("roadmap")) {
      const roadmapTasks: ExtractedTask[] = [
        {
          title: "Blender Phase 1: Mesh Primitives & Modifiers",
          category: "personal",
          priority: "medium",
          estimatedDuration: 45,
          tag: "Goal Milestone",
          isFixed: false,
        },
        {
          title: "Blender Phase 2: Lighting & Procedural Shaders",
          category: "personal",
          priority: "medium",
          estimatedDuration: 45,
          tag: "Goal Milestone",
          isFixed: false,
        },
      ];

      return {
        intent: "goal_decomposition",
        explanation:
          "To complete Blender in 30 days realistically, I recommend 45-minute sessions 4 times a week. I've broken the outcome into two initial milestone sprints.",
        extractedTasks: roadmapTasks,
        requiresClarification: false,
      };
    }

    // 8. Check for genuine task action keywords before treating as a task
    const taskActionKeywords = [
      "study",
      "work",
      "assignment",
      "homework",
      "read",
      "write",
      "practice",
      "code",
      "program",
      "develop",
      "build",
      "design",
      "prepare",
      "review",
      "gym",
      "workout",
      "exercise",
      "run",
      "meeting",
      "call",
      "sync",
      "finish",
      "complete",
      "solve",
      "clean",
      "buy",
      "errand",
      "project",
      "exam",
      "quiz",
      "test",
      "lecture",
      "lab",
      "blender",
      "paper",
      "thesis",
      "sprint",
      "presentation",
      "slides",
      "draft",
      "schedule",
    ];

    const hasActionKeyword = taskActionKeywords.some((kw) => lower.includes(kw));

    // If NO task action keyword is found (e.g. general question, remarks, or random text),
    // DO NOT hallucinate a schedule slot! Respond as an assistant.
    if (!hasActionKeyword) {
      return {
        intent: "general_query",
        explanation:
          `I'm your Kronos AI planning assistant. I didn't detect any specific tasks or scheduling requests in: "${trimmed}".\n\n` +
          `If you'd like to plan your day, tell me what you'd like to accomplish (for example: "Study economics for 1 hour" or "Hit the gym at 4 PM").`,
        extractedTasks: [],
        requiresClarification: false,
      };
    }

    // 9. Cleanly extract user task
    let cleanTitle = trimmed
      .replace(/^(i need to|i want to|please schedule|can you schedule|i have to|plan|add|schedule)\s+/i, "")
      .trim();

    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    if (cleanTitle.length > 50) {
      cleanTitle = cleanTitle.slice(0, 47) + "...";
    }

    const duration =
      lower.includes("1 hour") || lower.includes("60 min")
        ? 60
        : lower.includes("30 min") || lower.includes("half an hour")
        ? 30
        : lower.includes("90 min") || lower.includes("1.5 hour")
        ? 90
        : context.profile.preferredFocusDuration || 45;

    const genericTask: ExtractedTask = {
      title: cleanTitle,
      description: "Extracted from natural language input",
      category:
        lower.includes("gym") || lower.includes("run") || lower.includes("workout")
          ? "personal"
          : context.profile.role === "student"
          ? "study"
          : "work",
      priority: lower.includes("urgent") || lower.includes("asap") ? "urgent" : "medium",
      estimatedDuration: duration,
      isFixed: false,
      tag: "Focus Block",
      energyLevel: duration >= 60 ? "high" : "medium",
    };

    return {
      intent: "add_task",
      explanation: `I've analyzed your request: "${cleanTitle}". I've scheduled this as a ${genericTask.estimatedDuration}-minute focus block aligned with your open windows and energy rhythm.`,
      extractedTasks: [genericTask],
      requiresClarification: false,
    };
  }
}
