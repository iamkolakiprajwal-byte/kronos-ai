import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { performBidirectionalSync } from "@/lib/calendar/sync-service";
import { mockCalendarAdapter } from "@/lib/calendar/mock-adapter";

const SyncRequestSchema = z.object({
  action: z.enum(["sync", "disconnect", "simulate_conflict", "resolve"]).default("sync"),
  conflictId: z.string().optional(),
  resolution: z.enum(["keep_local", "accept_remote"]).optional(),
  useMock: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, conflictId, resolution, useMock } = SyncRequestSchema.parse(body);

    const isTest = process.env.NODE_ENV === "test" || useMock;

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

    if (action === "resolve" && conflictId && resolution) {
      const resolved = await mockCalendarAdapter.resolveConflict(conflictId, resolution);
      return NextResponse.json({
        success: resolved,
        action: "resolve",
        conflictId,
        resolution,
      });
    }

    const supabase = await createServerSupabaseClient();

    // 1. Live Authenticated Sync
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let targetUserId = user?.id;
      if (!targetUserId) {
        const cookieStore = await cookies();
        const cookieUserId = cookieStore.get("kronos_auth_user")?.value;
        if (cookieUserId) {
          targetUserId = cookieUserId;
        }
      }

      if (targetUserId) {
        if (action === "disconnect") {
          await supabase
            .from("calendar_connections")
            .update({
              sync_status: "disconnected",
              access_token: null,
              refresh_token: null,
              sync_token: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", targetUserId);

          return NextResponse.json({
            success: true,
            connected: false,
            message: "Google Calendar & Tasks disconnected successfully.",
          });
        }

        const summary = await performBidirectionalSync(targetUserId, supabase);
        return NextResponse.json(summary);
      }
    }

    // 2. Fallback for test runner or unconfigured auth
    if (isTest) {
      const res = await mockCalendarAdapter.fetchRemoteChanges();
      return NextResponse.json({
        success: true,
        connected: true,
        action: "sync",
        calendarEventsImported: res.added.length,
        calendarEventsDeleted: res.deletedIds.length,
        googleTasksImported: 0,
        localTasksPushed: 0,
        conflicts: 0,
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        result: res,
      });
    }

    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: "Google Calendar is not connected. Please click 'Connect Google Calendar' in your Profile or header.",
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Calendar sync route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to synchronize calendar" },
      { status: 400 }
    );
  }
}
