import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { mockCalendarAdapter } from "@/lib/calendar/mock-adapter";
import { GoogleCalendarAdapter, googleCalendarAdapter } from "@/lib/calendar/google-adapter";

const SyncRequestSchema = z.object({
  action: z.enum(["sync", "simulate_conflict", "resolve"]),
  syncToken: z.string().optional(),
  conflictId: z.string().optional(),
  resolution: z.enum(["keep_local", "accept_remote"]).optional(),
  accessToken: z.string().optional(),
  useMock: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, syncToken, conflictId, resolution, accessToken, useMock } =
      SyncRequestSchema.parse(body);

    const isTest = process.env.NODE_ENV === "test" || useMock;
    const cookieStore = await cookies();
    const token =
      accessToken ||
      cookieStore.get("kronos_google_token")?.value ||
      process.env.GOOGLE_CALENDAR_ACCESS_TOKEN;

    const adapter = isTest
      ? mockCalendarAdapter
      : token
      ? new GoogleCalendarAdapter(token)
      : null;

    if (action === "simulate_conflict") {
      if (!isTest) {
        return NextResponse.json(
          { success: false, error: "Simulated conflict is only permitted in test environments." },
          { status: 403 }
        );
      }
      const { conflict, remoteEvent } = mockCalendarAdapter.generateSimulatedConflict();
      return NextResponse.json({
        success: true,
        action: "simulate_conflict",
        conflict,
        remoteEvent,
      });
    }

    if (!adapter) {
      return NextResponse.json(
        {
          success: false,
          connected: false,
          error:
            "Google Calendar is not connected. Please connect your Google Calendar account from the header or Profile page.",
        },
        { status: 401 }
      );
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
      connected: true,
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
