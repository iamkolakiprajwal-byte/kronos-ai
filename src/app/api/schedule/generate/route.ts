import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { DeterministicScheduler } from "@/lib/scheduler/engine";

const scheduleRequestSchema = z.object({
  date: z.string(),
  wakeTime: z.string().default("07:30"),
  sleepTime: z.string().default("23:30"),
  mostProductivePeriod: z
    .enum(["morning", "afternoon", "evening", "night"])
    .default("morning"),
  preferredFocusDuration: z.number().default(45),
  preferredBreakDuration: z.number().default(10),
  fixedCommitments: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        category: z.string().optional(),
      })
    )
    .default([]),
  tasksToSchedule: z.array(z.any()).default([]),
  currentTime: z.string().optional(),
  interruption: z
    .object({
      title: z.string(),
      duration: z.number(),
      startTime: z.string(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = scheduleRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid schedule input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { interruption, ...schedulerInput } = parsed.data;

    let result;
    if (interruption) {
      result = DeterministicScheduler.rescheduleRemainingDay(
        schedulerInput as any,
        interruption
      );
    } else {
      result = DeterministicScheduler.scheduleDay(schedulerInput as any);
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("Schedule Generation Error:", error);
    return NextResponse.json(
      {
        error: "Deterministic scheduling failed",
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
