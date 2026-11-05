import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAIProvider } from "@/lib/ai";
import { saveUserMemory } from "@/lib/ai/memory";

const chatRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  context: z.object({
    profile: z
      .object({
        id: z.string().default("user-demo"),
        name: z.string().default("Aria"),
        role: z.enum(["student", "professional", "both"]).default("student"),
        wakeTime: z.string().default("07:00"),
        sleepTime: z.string().default("23:00"),
        mostProductivePeriod: z.enum(["morning", "afternoon", "evening", "night"]).default("morning"),
        preferredFocusDuration: z.number().default(45),
        preferredBreakDuration: z.number().default(10),
        planningStyle: z.enum(["structured", "flexible", "time-blocked"]).default("time-blocked"),
        sustainabilityOptIn: z.boolean().default(false),
      })
      .passthrough()
      .default({
        id: "user-demo",
        name: "Aria",
        role: "student",
        wakeTime: "07:00",
        sleepTime: "23:00",
        mostProductivePeriod: "morning",
        preferredFocusDuration: 45,
        preferredBreakDuration: 10,
        planningStyle: "time-blocked",
        sustainabilityOptIn: false,
      }),
    existingTasks: z.array(z.any()).default([]),
    fixedCommitments: z
      .array(
        z.object({
          title: z.string(),
          startTime: z.string(),
          endTime: z.string(),
          isFixed: z.boolean().default(true),
        }).passthrough()
      )
      .default([]),
    currentDate: z.string().default("2026-11-02"),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = chatRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { prompt, context } = parsed.data;
    const provider = getAIProvider();

    const plan = await provider.generatePlan(prompt, context as any);

    // Persist any newly detected preferences into user memory
    if (plan.detectedPreferences) {
      for (const [key, val] of Object.entries(plan.detectedPreferences)) {
        await saveUserMemory(key, val, 0.9, context.profile.id);
      }
    }

    return NextResponse.json({
      success: true,
      provider: provider.name,
      plan,
    });
  } catch (error: any) {
    console.error("AI Chat Route Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate schedule plan",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
