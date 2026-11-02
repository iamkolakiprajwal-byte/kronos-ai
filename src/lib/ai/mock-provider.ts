import { AIProvider } from "./provider";
import { AIPlanResponse, UserScheduleContext, ExtractedTask } from "./types";

export class MockAIProvider implements AIProvider {
  name = "Mock AI Assistant (Offline Demo Mode)";

  async generatePlan(
    userPrompt: string,
    context: UserScheduleContext
  ): Promise<AIPlanResponse> {
    const lower = userPrompt.toLowerCase();

    // 1. Master prompt scenario
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

    // 2. Urgent meeting interruption scenario
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

    // 3. Rescheduling missed session
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
        explanation: `Life happens—no problem at all! I've preserved your fixed afternoon lectures and shifted the remaining ${context.profile.preferredFocusDuration}-minute focus block to 19:30 after dinner. This keeps your wind-down time intact.`,
        extractedTasks: [rescheduledTask],
        requiresClarification: false,
      };
    }

    // 4. Goal roadmap query
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

    // 5. Default single/multi-task extraction
    const genericTask: ExtractedTask = {
      title: userPrompt.length > 40 ? userPrompt.slice(0, 38) + "..." : userPrompt,
      description: "Extracted from natural language input",
      category: context.profile.role === "student" ? "study" : "work",
      priority: "medium",
      estimatedDuration: context.profile.preferredFocusDuration || 45,
      isFixed: false,
      tag: "Focus Task",
      energyLevel: "high",
    };

    return {
      intent: "add_task",
      explanation: `I've analyzed: "${userPrompt}". I've framed this as a ${genericTask.estimatedDuration}-minute focus block aligned with your ${context.profile.mostProductivePeriod} energy rhythm.`,
      extractedTasks: [genericTask],
      requiresClarification: false,
    };
  }
}
