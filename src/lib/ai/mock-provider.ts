import { AIProvider } from "./provider";
import { AIPlanResponse, UserScheduleContext, ExtractedTask, ExtractedHabit, ExtractedGoal } from "./types";

export class MockAIProvider implements AIProvider {
  name = "Kronos Deterministic Mock AI Assistant (Zero-Cost Offline Mode)";

  async generatePlan(
    userPrompt: string,
    context: UserScheduleContext
  ): Promise<AIPlanResponse> {
    const trimmed = userPrompt.trim();
    const lower = trimmed.toLowerCase();

    // 1. Identity, Purpose, Capability & Casual Chit-Chat
    const isIdentityOrRoleQuestion =
      lower.includes("what are you doing") ||
      lower.includes("what r u doing") ||
      lower.includes("who are you") ||
      lower.includes("what can you do") ||
      lower.includes("what do you do") ||
      lower.includes("how does this work") ||
      lower.includes("what is this") ||
      lower.includes("tell me about yourself") ||
      lower.includes("help me understand") ||
      lower.includes("who made you");

    if (isIdentityOrRoleQuestion) {
      return {
        intent: "general_query",
        explanation:
          `I am Kronos AI, your intelligent personal planning assistant running in zero-cost offline demonstration mode.\n\n` +
          `I analyze your fixed commitments (lectures, labs, meetings), daily biological rhythms (${context.profile.wakeTime} wake to ${context.profile.sleepTime} sleep), energy curves (${context.profile.mostProductivePeriod} peak), and habits to build realistic, collision-free schedules.\n\n` +
          `Here is what you can ask me:\n` +
          `• Daily Planning: "Plan my day. I need to study economics for two hours and finish my assignment."\n` +
          `• Reschedule Tasks: "Move my economics assignment to 4 PM" or "I missed my morning study, reschedule my afternoon."\n` +
          `• Priority Updates: "Mark economics problem set as urgent priority."\n` +
          `• Habit Formation: "I want to build a habit of reading research papers for 20 minutes every morning after coffee."\n` +
          `• Strategic Goals: "I want to prepare for Google summer internship in 3 months."\n` +
          `• Overview: "What's on my schedule today?"`,
        extractedTasks: [],
        requiresClarification: false,
      };
    }

    // 2. Greetings and Friendly Conversation
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
          `Hello ${context.profile.name.split(" ")[0]}! I'm here to support your daily flow.\n\n` +
          `You currently have ${context.fixedCommitments.length} fixed commitment(s) and ${activeTaskCount} active task(s) for ${context.currentDate}.\n\n` +
          `What would you like to achieve today? You can dictate your study targets, adjust existing blocks, or build new habits.`,
        extractedTasks: [],
        requiresClarification: false,
      };
    }

    // 3. Agenda Status & Day Inquiries
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
          `**Active Flexible Tasks:**\n${taskList}\n\n` +
          `Target sleep boundary: ${context.profile.sleepTime}. Tell me if you'd like to plan additional tasks or shift anything.`,
        extractedTasks: [],
        requiresClarification: false,
      };
    }

    // 4. Ambiguous Reschedule Commands Requiring Clarification
    // e.g. "move my assignment to tomorrow" without specifying which assignment when multiple exist
    if (
      (lower.includes("move my assignment") || lower.includes("reschedule my task") || lower === "move it" || lower === "reschedule it") &&
      !lower.includes("economics") &&
      !lower.includes("problem set") &&
      !lower.includes("cs") &&
      !lower.includes("lab")
    ) {
      const existingAssignments = context.existingTasks.filter((t) =>
        t.title.toLowerCase().includes("assignment") ||
        t.title.toLowerCase().includes("problem set") ||
        t.title.toLowerCase().includes("lab") ||
        t.category === "study"
      );

      if (existingAssignments.length > 1) {
        const optionsList = existingAssignments.map((a) => `"${a.title}"`).join(" or ");
        return {
          intent: "clarification_needed",
          explanation: `You have multiple active study tasks (${optionsList}). Which specific assignment would you like me to move, and what time window do you prefer?`,
          extractedTasks: [],
          requiresClarification: true,
          clarificationQuestion: `Which assignment would you like to move (${optionsList})?`,
        };
      }
    }

    // 5. Priority Changes ("mark economics as urgent", "make CS lab high priority")
    if (
      (lower.includes("priority") || lower.includes("urgent") || lower.includes("mark as")) &&
      (lower.includes("change") || lower.includes("mark") || lower.includes("make") || lower.includes("set"))
    ) {
      let targetTask = context.existingTasks.find((t) =>
        lower.includes(t.title.toLowerCase()) ||
        (lower.includes("economics") && t.title.toLowerCase().includes("economics")) ||
        (lower.includes("cs") && t.title.toLowerCase().includes("cs")) ||
        (lower.includes("lab") && t.title.toLowerCase().includes("lab"))
      );

      const targetPriority = lower.includes("urgent")
        ? "urgent"
        : lower.includes("high")
        ? "high"
        : lower.includes("low")
        ? "low"
        : "medium";

      if (targetTask) {
        const updatedTask: ExtractedTask = {
          title: targetTask.title,
          description: targetTask.description,
          category: targetTask.category,
          priority: targetPriority,
          estimatedDuration: targetTask.estimatedDuration,
          startTime: targetTask.startTime,
          endTime: targetTask.endTime,
          isFixed: targetTask.isFixed,
          tag: targetTask.tag,
          energyLevel: targetPriority === "urgent" ? "high" : targetTask.energyLevel,
        };

        return {
          intent: "change_priority",
          explanation: `I've prepared a priority update for "${targetTask.title}" to **${targetPriority.toUpperCase()}** priority. This will prioritize it in your upcoming focus queue. Review below and tap Apply to confirm.`,
          extractedTasks: [updatedTask],
          requiresClarification: false,
        };
      }
    }

    // 6. Habit Creation ("I want to build a habit of...", "Create a habit...")
    if (
      lower.includes("habit") ||
      lower.includes("daily routine") ||
      lower.includes("every morning after") ||
      lower.includes("every day after")
    ) {
      let habitTitle = "Daily Deep Reading";
      let cue = "After morning pour-over coffee";
      let minVersion = "Read 1 page or research abstract";
      let category: ExtractedHabit["category"] = "learning";

      if (lower.includes("reading") || lower.includes("paper")) {
        habitTitle = "Research Paper Reading";
        cue = "After morning coffee";
        minVersion = "Read paper abstract & methodology";
        category = "learning";
      } else if (lower.includes("meditation") || lower.includes("mindful")) {
        habitTitle = "Mindful Breathwork";
        cue = "Immediately upon waking up";
        minVersion = "2 minutes of deep box breathing";
        category = "mindfulness";
      } else if (lower.includes("workout") || lower.includes("gym") || lower.includes("stretch")) {
        habitTitle = "Mobility & Core Activation";
        cue = "After closing study laptop at 5 PM";
        minVersion = "1 set of planks and hamstring stretch";
        category = "health";
      }

      const extractedHabit: ExtractedHabit = {
        title: habitTitle,
        cue,
        category,
        frequency: "daily",
        minimumVersion: minVersion,
        targetDurationMinutes: 20,
      };

      const companionTask: ExtractedTask = {
        title: `Habit Anchor: ${habitTitle}`,
        description: `Anchored to: "${cue}". 2-Minute Version: "${minVersion}".`,
        category: "personal",
        priority: "medium",
        estimatedDuration: 20,
        isFixed: false,
        tag: "Habit Anchor",
        energyLevel: "medium",
      };

      return {
        intent: "create_habit",
        explanation:
          `I've formatted your habit proposal following BJ Fogg's Tiny Habits and James Clear's Atomic Habits framework:\n\n` +
          `• **Habit Behavior**: ${habitTitle}\n` +
          `• **Anchor Cue**: "${cue}"\n` +
          `• **2-Minute Minimum Version**: "${minVersion}"\n` +
          `• **Automaticity Target**: Daily 20-minute interval\n\n` +
          `Review the proposed habit below and tap Apply to install it into your Growth workspace!`,
        extractedTasks: [companionTask],
        extractedHabit,
        requiresClarification: false,
      };
    }

    // 7. Strategic Goals & Roadmap Decomposition ("I want to learn Blender in 30 days", "prepare for internship in 3 months")
    if (
      lower.includes("in 30 days") ||
      lower.includes("in 3 months") ||
      lower.includes("internship") ||
      lower.includes("roadmap") ||
      (lower.includes("goal") && (lower.includes("create") || lower.includes("set") || lower.includes("new")))
    ) {
      const isInternship = lower.includes("internship") || lower.includes("job") || lower.includes("interview");
      const goalTitle = isInternship
        ? "Software Engineering Internship Readiness"
        : "Master 3D Modeling with Blender";

      const extractedGoal: ExtractedGoal = {
        title: goalTitle,
        category: isInternship ? "career" : "skills",
        priority: "high",
        targetTimeline: isInternship ? "3 months" : "30 days",
        milestones: isInternship
          ? [
              { title: "Core Data Structures & Algorithms Mastery", dueDate: "2026-11-20" },
              { title: "Full-Stack Portfolio Project Demonstration", dueDate: "2026-12-15" },
              { title: "Mock Technical Architecture & Behavioral Prep", dueDate: "2027-01-10" },
            ]
          : [
              { title: "Foundations: Viewport Navigation & Mesh Primitives", dueDate: "2026-11-10" },
              { title: "Intermediate: Geometry Nodes & Procedural Modifiers", dueDate: "2026-11-20" },
              { title: "Capstone: Cinematic Lighting & Photorealistic Shaders", dueDate: "2026-11-30" },
            ],
      };

      const actionableTasks: ExtractedTask[] = extractedGoal.milestones.map((m, idx) => ({
        title: `Phase ${idx + 1}: ${m.title}`,
        description: `Actionable milestone for goal: ${goalTitle}`,
        category: isInternship ? "work" : "personal",
        priority: idx === 0 ? "urgent" : "medium",
        estimatedDuration: 60,
        deadline: m.dueDate,
        isFixed: false,
        tag: "Goal Milestone",
        energyLevel: "high",
      }));

      return {
        intent: "goal_decomposition",
        explanation:
          `I've decomposed your strategic goal ("${goalTitle}") into 3 chronological milestone phases with actionable focus blocks.\n\n` +
          `Phase 1 is set to start during your next available high-energy focus window. Tap Apply to save this roadmap to your schedule.`,
        extractedTasks: actionableTasks,
        extractedGoal,
        requiresClarification: false,
      };
    }

    // 8. Specific Task Rescheduling ("Move my economics assignment to 4 PM", "Reschedule assignment to 14:00")
    if (
      lower.includes("move") ||
      lower.includes("reschedule") ||
      lower.includes("delay") ||
      lower.includes("shift") ||
      lower.includes("push") ||
      lower.includes("postpone")
    ) {
      // Find matching task in context
      const matched = context.existingTasks.find((t) =>
        lower.includes("economics") || lower.includes("assignment") || lower.includes("study")
      ) || context.existingTasks[0];

      const newStart = lower.includes("4 pm") || lower.includes("4pm") || lower.includes("16:00")
        ? "16:00"
        : lower.includes("5 pm") || lower.includes("5pm") || lower.includes("17:00")
        ? "17:00"
        : lower.includes("tomorrow")
        ? "10:00"
        : "15:00";

      const duration = matched ? matched.estimatedDuration : 60;
      const [h, m] = newStart.split(":").map(Number);
      const endMins = h * 60 + m + duration;
      const endH = Math.floor(endMins / 60);
      const endM = endMins % 60;
      const newEnd = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

      const rescheduledTask: ExtractedTask = {
        title: matched ? matched.title : "Economics Assignment Study Block",
        description: "Rescheduled upon user natural language request.",
        category: matched ? matched.category : "study",
        priority: matched ? matched.priority : "high",
        estimatedDuration: duration,
        startTime: newStart,
        endTime: newEnd,
        isFixed: false,
        tag: "Rescheduled",
        energyLevel: "high",
      };

      return {
        intent: "reschedule_task",
        explanation:
          `I have re-allocated "${rescheduledTask.title}" to start at ${newStart} (${duration} minutes). Fixed class commitments remain strictly protected. Tap Apply to commit this change to your schedule.`,
        extractedTasks: [rescheduledTask],
        requiresClarification: false,
      };
    }

    // 9. Master Multi-Task Scenario: Economics + Gym + Blender / Assignments
    if (
      lower.includes("two assignments") ||
      (lower.includes("economics") && (lower.includes("gym") || lower.includes("blender") || lower.includes("assignment")))
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
        explanation:
          `I've analyzed your daily intentions and mapped them around your ${context.fixedCommitments.length} fixed timetable commitment(s).\n\n` +
          `• 14:00–15:00: Economics Problem Set during your peak afternoon window\n` +
          `• 16:00–16:50: Conditioning & Gym session\n` +
          `• 18:00–18:45: Blender 3D Modeling Practice\n\n` +
          `Your target bedtime (${context.profile.sleepTime}) is fully protected with a 60-minute wind-down buffer. Review the proposed timeblocks below and tap Apply to schedule!`,
        extractedTasks: extracted,
        detectedPreferences: {
          preferred_study_duration: 60,
          preferred_break_duration: 15,
        },
        requiresClarification: false,
      };
    }

    // 10. Urgent Interruption Handling ("Urgent meeting at 4 PM")
    if (lower.includes("urgent meeting") || lower.includes("emergency") || lower.includes("unexpected meeting")) {
      const urgentMeeting: ExtractedTask = {
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
        explanation:
          `I have registered your urgent commitment at 16:00–16:45. Flexible focus tasks have been shifted safely without violating your ${context.profile.sleepTime} sleep boundary. Review below to apply.`,
        extractedTasks: [urgentMeeting],
        requiresClarification: false,
      };
    }

    // 11. Rescheduling Missed Morning Sessions ("I missed my morning study", "Could not finish")
    if (lower.includes("missed") || lower.includes("couldn't finish") || lower.includes("didn't finish") || lower.includes("behind schedule")) {
      const rescheduledTask: ExtractedTask = {
        title: "Rescheduled Focus Block",
        description: "Unfinished morning material re-allocated to open buffer.",
        category: context.profile.role === "student" ? "study" : "work",
        priority: "high",
        estimatedDuration: context.profile.preferredFocusDuration || 45,
        startTime: "19:30",
        endTime: "20:15",
        isFixed: false,
        tag: "Rescheduled",
        energyLevel: "medium",
      };

      return {
        intent: "reschedule_missed",
        explanation:
          `Life happens—no problem at all! I have preserved your fixed afternoon commitments and shifted the remaining ${rescheduledTask.estimatedDuration}-minute focus block to 19:30 after dinner. Review and tap Apply to update your day.`,
        extractedTasks: [rescheduledTask],
        requiresClarification: false,
      };
    }

    // 12. Task Action Keyword Check
    const taskActionKeywords = [
      "study", "work", "assignment", "homework", "read", "write", "practice", "code",
      "program", "develop", "build", "design", "prepare", "review", "gym", "workout",
      "exercise", "run", "meeting", "call", "sync", "finish", "complete", "solve",
      "clean", "buy", "errand", "project", "exam", "quiz", "test", "lecture", "lab",
      "blender", "paper", "thesis", "sprint", "presentation", "slides", "draft", "schedule",
      "plan", "task", "todo", "essay",
    ];

    const hasActionKeyword = taskActionKeywords.some((kw) => lower.includes(kw));

    if (!hasActionKeyword) {
      return {
        intent: "general_query",
        explanation:
          `I didn't detect any specific scheduling actions in your message: "${trimmed}".\n\n` +
          `If you would like to plan tasks, tell me your goals (e.g. "Plan 90 minutes of thesis writing" or "Add gym at 5 PM").`,
        extractedTasks: [],
        requiresClarification: false,
      };
    }

    // 13. Dynamic Task Extraction for generic natural-language requests
    let cleanTitle = trimmed
      .replace(/^(i need to|i want to|please schedule|can you schedule|i have to|plan|add|schedule|remind me to)\s+/i, "")
      .trim();

    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    if (cleanTitle.length > 55) {
      cleanTitle = cleanTitle.slice(0, 52) + "...";
    }

    const duration =
      lower.includes("2 hours") || lower.includes("2h") || lower.includes("120 min")
        ? 120
        : lower.includes("1.5 hour") || lower.includes("90 min")
        ? 90
        : lower.includes("1 hour") || lower.includes("1h") || lower.includes("60 min")
        ? 60
        : lower.includes("30 min") || lower.includes("half an hour")
        ? 30
        : context.profile.preferredFocusDuration || 45;

    // Detect deadline if present
    let deadline: string | undefined = undefined;
    if (lower.includes("due tomorrow")) {
      deadline = "Tomorrow 17:00";
    } else if (lower.includes("due friday")) {
      deadline = "Friday 17:00";
    } else if (lower.includes("due 5") || lower.includes("due 5pm") || lower.includes("due at 5")) {
      deadline = `${context.currentDate} 17:00`;
    } else if (lower.includes("due 9") || lower.includes("due 9pm") || lower.includes("due at 9")) {
      deadline = `${context.currentDate} 21:00`;
    }

    const genericTask: ExtractedTask = {
      title: cleanTitle,
      description: "Extracted from natural language input",
      category:
        lower.includes("gym") || lower.includes("run") || lower.includes("workout")
          ? "personal"
          : context.profile.role === "student"
          ? "study"
          : "work",
      priority: lower.includes("urgent") || lower.includes("asap") ? "urgent" : lower.includes("high") ? "high" : "medium",
      estimatedDuration: duration,
      deadline,
      isFixed: false,
      tag: deadline ? "Deadline" : "Focus Block",
      energyLevel: duration >= 60 ? "high" : "medium",
    };

    return {
      intent: "add_task",
      explanation:
        `I've parsed your request into a proposed ${genericTask.estimatedDuration}-minute focus block: "${cleanTitle}"${
          deadline ? ` with deadline ${deadline}` : ""
        }. Review the details below and tap Apply to confirm.`,
      extractedTasks: [genericTask],
      requiresClarification: false,
    };
  }
}
