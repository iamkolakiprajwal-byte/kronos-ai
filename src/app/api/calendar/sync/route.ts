import { NextResponse } from "next/server";
import { z } from "zod";
import { mockCalendarAdapter } from "@/lib/calendar/mock-adapter";
import { googleCalendarAdapter } from "@/lib/calendar/google-adapter";

const SyncRequestSchema = z.object({
  action: z.enum(["sync", "simulate_conflict", "resolve"]),
  syncToken: z.string().optional(),
  conflictId: z.string().optional(),
  resolution: z.enum(["keep_local", "accept_remote"]).optional(),
  useMock: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, syncToken, conflictId, resolution, useMock } = SyncRequestSchema.parse(body);

    const adapter = useMock ? mockCalendarAdapter : googleCalendarAdapter;

    if (action === "simulate_conflict") {
      const { conflict, remoteEvent } = mockCalendarAdapter.generateSimulatedConflict();
      return NextResponse.json({
        success: true,
        action: "simulate_conflict",
        conflict,
        remoteEvent,
      });
    }

    if (action === "resolve" && conflictId && resolution) {
      const resolved = await adapter.resolveConflict(conflictId, resolution);
      return NextResponse.json({
        success: resolved,
        action: "resolve",
        conflictId,
        resolution,
      });
    }

    // Default: Perform sync
    const result = await adapter.fetchRemoteChanges(syncToken);
    return NextResponse.json({
      success: true,
      action: "sync",
      result,
    });
  } catch (error: any) {
    console.error("Calendar sync route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to synchronize calendar" },
      { status: 400 }
    );
  }
}
