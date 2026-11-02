import { NextResponse } from "next/server";
import { z } from "zod";
import { decomposeGoalIntoRoadmap } from "@/lib/ai/roadmap";

const DecomposeRequestSchema = z.object({
  title: z.string().min(2),
  description: z.string().default(""),
  category: z.string().default("academic"),
  targetDate: z.string().default("2026-12-15"),
  role: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = DecomposeRequestSchema.parse(body);

    const milestones = await decomposeGoalIntoRoadmap(validated);
    return NextResponse.json({
      success: true,
      milestones,
    });
  } catch (error: any) {
    console.error("Roadmap decomposition error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to decompose goal",
      },
      { status: 400 }
    );
  }
}
