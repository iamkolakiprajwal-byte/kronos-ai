import { Milestone } from "@/types";

interface DecomposeGoalInput {
  title: string;
  description: string;
  category: string;
  targetDate: string;
  role?: string;
}

/**
 * Intelligent Goal Decomposition Engine
 * Generates progressive milestones and daily schedule-ready actionable tasks.
 * Uses Gemini API if configured, otherwise employs rich domain-specific cognitive scaffolding.
 */
export async function decomposeGoalIntoRoadmap(
  goal: DecomposeGoalInput
): Promise<Milestone[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are an expert personal productivity architect.
Decompose the following user goal into 3 chronological milestones.
For each milestone, provide:
- A milestone title
- A realistic target due date (before ${goal.targetDate})
- 2 actionable daily study/work tasks with title, durationMinutes (25 to 90), difficulty ("high" | "medium" | "low"), and suggestedPeriod ("morning" | "afternoon" | "evening").

Goal Title: "${goal.title}"
Description: "${goal.description}"
Category: "${goal.category}"
Target Completion: "${goal.targetDate}"
Role: "${goal.role || "student"}"

Output ONLY a JSON array adhering to this schema:
[
  {
    "id": "ms-1",
    "title": "string",
    "dueDate": "YYYY-MM-DD",
    "completed": false,
    "actionableTasks": [
      {
        "id": "task-1",
        "title": "string",
        "durationMinutes": 60,
        "difficulty": "high",
        "suggestedPeriod": "morning"
      }
    ]
  }
]`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText) as Milestone[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn("Gemini roadmap decomposition fallback to heuristic:", err);
    }
  }

  // Domain-specific heuristic decomposition
  return generateHeuristicRoadmap(goal);
}

function generateHeuristicRoadmap(goal: DecomposeGoalInput): Milestone[] {
  const cat = goal.category.toLowerCase();
  const title = goal.title;
  const targetDate = goal.targetDate || "2026-12-15";

  if (cat === "academic" || title.toLowerCase().includes("econ") || title.toLowerCase().includes("thesis") || title.toLowerCase().includes("exam")) {
    return [
      {
        id: `ms-heur-1-${Date.now()}`,
        title: "Phase 1: Foundational Syllabus & Core Problem Sets",
        dueDate: "Within 2 weeks",
        completed: true,
        actionableTasks: [
          {
            id: `at-1-${Date.now()}`,
            title: `Review core lecture slides and summarize ${title.split(" ")[0]} notes`,
            durationMinutes: 45,
            difficulty: "medium",
            suggestedPeriod: "morning",
          },
          {
            id: `at-2-${Date.now()}`,
            title: "Complete diagnostic problem set & isolate weakness areas",
            durationMinutes: 60,
            difficulty: "high",
            suggestedPeriod: "morning",
          },
        ],
      },
      {
        id: `ms-heur-2-${Date.now()}`,
        title: "Phase 2: Timed Practice & Synthesis Block",
        dueDate: "Midway checkpoint",
        completed: false,
        actionableTasks: [
          {
            id: `at-3-${Date.now()}`,
            title: "Simulate 90-minute timed past exam under exam conditions",
            durationMinutes: 90,
            difficulty: "high",
            suggestedPeriod: "morning",
          },
          {
            id: `at-4-${Date.now()}`,
            title: "Review missed problems with teaching assistant or peer group",
            durationMinutes: 45,
            difficulty: "low",
            suggestedPeriod: "afternoon",
          },
        ],
      },
      {
        id: `ms-heur-3-${Date.now()}`,
        title: "Phase 3: Final Consolidation & Benchmark Review",
        dueDate: targetDate,
        completed: false,
        actionableTasks: [
          {
            id: `at-5-${Date.now()}`,
            title: "One-page formula / concept sheet memorization session",
            durationMinutes: 30,
            difficulty: "low",
            suggestedPeriod: "evening",
          },
          {
            id: `at-6-${Date.now()}`,
            title: "Final review of high-probability test topics",
            durationMinutes: 60,
            difficulty: "medium",
            suggestedPeriod: "morning",
          },
        ],
      },
    ];
  }

  if (cat === "skills" || title.toLowerCase().includes("blender") || title.toLowerCase().includes("code") || title.toLowerCase().includes("python")) {
    return [
      {
        id: `ms-heur-1-${Date.now()}`,
        title: "Phase 1: Tool Mastery & Interface Navigation",
        dueDate: "Week 1",
        completed: true,
        actionableTasks: [
          {
            id: `at-1-${Date.now()}`,
            title: `Complete 45m hands-on introductory tutorial for ${title}`,
            durationMinutes: 45,
            difficulty: "medium",
            suggestedPeriod: "evening",
          },
          {
            id: `at-2-${Date.now()}`,
            title: "Configure keyboard shortcuts & project workspace template",
            durationMinutes: 30,
            difficulty: "low",
            suggestedPeriod: "evening",
          },
        ],
      },
      {
        id: `ms-heur-2-${Date.now()}`,
        title: "Phase 2: Independent Capstone Project Build",
        dueDate: "Week 3",
        completed: false,
        actionableTasks: [
          {
            id: `at-3-${Date.now()}`,
            title: `Build core interactive prototype: ${title}`,
            durationMinutes: 75,
            difficulty: "high",
            suggestedPeriod: "afternoon",
          },
          {
            id: `at-4-${Date.now()}`,
            title: "Troubleshoot edge cases & document implementation notes",
            durationMinutes: 45,
            difficulty: "medium",
            suggestedPeriod: "evening",
          },
        ],
      },
      {
        id: `ms-heur-3-${Date.now()}`,
        title: "Phase 3: Portfolio Polish & Demonstration",
        dueDate: targetDate,
        completed: false,
        actionableTasks: [
          {
            id: `at-5-${Date.now()}`,
            title: "Export final asset render or publish repository README",
            durationMinutes: 45,
            difficulty: "low",
            suggestedPeriod: "afternoon",
          },
        ],
      },
    ];
  }

  if (cat === "career" || title.toLowerCase().includes("promotion") || title.toLowerCase().includes("launch")) {
    return [
      {
        id: `ms-heur-1-${Date.now()}`,
        title: "Phase 1: Architecture Specification & Stakeholder Alignment",
        dueDate: "Sprint 1",
        completed: true,
        actionableTasks: [
          {
            id: `at-1-${Date.now()}`,
            title: "Draft technical spec & review with engineering leads",
            durationMinutes: 60,
            difficulty: "high",
            suggestedPeriod: "morning",
          },
          {
            id: `at-2-${Date.now()}`,
            title: "Define core success metrics & automated CI/CD checks",
            durationMinutes: 45,
            difficulty: "medium",
            suggestedPeriod: "morning",
          },
        ],
      },
      {
        id: `ms-heur-2-${Date.now()}`,
        title: "Phase 2: Production Implementation & Dogfooding",
        dueDate: "Sprint 2",
        completed: false,
        actionableTasks: [
          {
            id: `at-3-${Date.now()}`,
            title: "Execute deep work coding block for critical path service",
            durationMinutes: 90,
            difficulty: "high",
            suggestedPeriod: "morning",
          },
          {
            id: `at-4-${Date.now()}`,
            title: "Conduct peer code review and address security audit findings",
            durationMinutes: 45,
            difficulty: "medium",
            suggestedPeriod: "afternoon",
          },
        ],
      },
      {
        id: `ms-heur-3-${Date.now()}`,
        title: "Phase 3: General Availability & Executive Presentation",
        dueDate: targetDate,
        completed: false,
        actionableTasks: [
          {
            id: `at-5-${Date.now()}`,
            title: "Synthesize latency and uptime metrics into slide deck",
            durationMinutes: 45,
            difficulty: "medium",
            suggestedPeriod: "afternoon",
          },
        ],
      },
    ];
  }

  // Default general roadmap
  return [
    {
      id: `ms-heur-1-${Date.now()}`,
      title: "Phase 1: Discovery, Scoping & Environment Setup",
      dueDate: "Checkpoint 1",
      completed: true,
      actionableTasks: [
        {
          id: `at-1-${Date.now()}`,
          title: `Research reference implementations and outline ${title}`,
          durationMinutes: 45,
          difficulty: "medium",
          suggestedPeriod: "morning",
        },
      ],
    },
    {
      id: `ms-heur-2-${Date.now()}`,
      title: "Phase 2: Deep Execution & Iterative Refinement",
      dueDate: "Checkpoint 2",
      completed: false,
      actionableTasks: [
        {
          id: `at-2-${Date.now()}`,
          title: `Dedicated focus block: ${title}`,
          durationMinutes: 60,
          difficulty: "high",
          suggestedPeriod: "morning",
        },
      ],
    },
    {
      id: `ms-heur-3-${Date.now()}`,
      title: "Phase 3: Final Quality Audit & Milestone Completion",
      dueDate: targetDate,
      completed: false,
      actionableTasks: [
        {
          id: `at-3-${Date.now()}`,
          title: `Final review and sign-off on ${title}`,
          durationMinutes: 30,
          difficulty: "low",
          suggestedPeriod: "afternoon",
        },
      ],
    },
  ];
}
