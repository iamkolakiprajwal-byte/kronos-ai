import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { performBidirectionalSync } from "@/lib/calendar/sync-service";
import { mockCalendarAdapter } from "@/lib/calendar/mock-adapter";

const SyncRequestSchema = z.object({
  action: z.enum(["sync", "disconnect", "simulate_conflict", "resolve", "reset_and_sync"]).default("sync"),
  conflictId: z.string().optional(),
  resolution: z.enum(["keep_local", "accept_remote"]).optional(),
  useMock: z.boolean().default(false),
  accessToken: z.string().optional(),
});

/**
 * GET /api/calendar/sync
 * Retrieves current Google Calendar connection status, sync state, and auto-sync metadata.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        connected: false,
        syncStatus: "disconnected",
        message: "Database client unconfigured",
      });
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    let targetUserId = user?.id;
    if (!targetUserId) {
      const cookieUserId = cookieStore.get("kronos_auth_user")?.value;
      if (cookieUserId) {
        targetUserId = cookieUserId;
      }
    }

    if (!targetUserId) {
      return NextResponse.json({
        connected: false,
        syncStatus: "disconnected",
        message: "No authenticated session",
      });
    }

    const { data: conn } = await supabase
      .from("calendar_connections")
      .select("id, provider, sync_status, last_synced_at, google_email, token_expires_at, scopes, refresh_token")
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (!conn) {
      return NextResponse.json({
        connected: false,
        syncStatus: "disconnected",
        lastSyncedAt: null,
      });
    }

    const isConnected = conn.sync_status === "active" || conn.sync_status === "synced";

    return NextResponse.json({
      connected: isConnected,
      syncStatus: conn.sync_status,
      lastSyncedAt: conn.last_synced_at,
      googleEmail: conn.google_email,
      hasRefreshToken: !!conn.refresh_token,
      tokenExpiresAt: conn.token_expires_at,
      scopes: conn.scopes || [],
      requiresReauth: conn.sync_status === "error",
    });
  } catch (error: any) {
    console.error("GET /api/calendar/sync error:", error);
    return NextResponse.json(
      { connected: false, error: error.message || "Failed to check calendar connection" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, conflictId, resolution, useMock, accessToken } = SyncRequestSchema.parse(body);

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

      const cookieStore = await cookies();
      let targetUserId = user?.id;
      if (!targetUserId) {
        const cookieUserId = cookieStore.get("kronos_auth_user")?.value;
        if (cookieUserId) {
          targetUserId = cookieUserId;
        }
      }

      // Do NOT fall back to short-lived cookie token. Let sync-service use persistent DB token
      // and perform auto-refresh via refresh_token when expired.
      const effectiveAccessToken = accessToken || undefined;

      if (targetUserId) {
        if (action === "disconnect") {
          await supabase
            .from("calendar_connections")
            .update({
              sync_status: "disconnected",
              access_token: null,
              refresh_token: null,
              sync_token: null,
              google_tasks_sync_token: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", targetUserId);

          const response = NextResponse.json({
            success: true,
            connected: false,
            message: "Google Calendar & Tasks disconnected successfully.",
          });
          response.cookies.delete("kronos_google_token");
          response.cookies.delete("kronos_google_refresh_token");
          return response;
        }

        const forceFullSync = action === "reset_and_sync";
        if (forceFullSync) {
          await supabase
            .from("calendar_connections")
            .update({
              sync_token: null,
              google_tasks_sync_token: null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", targetUserId);
        }

        const summary = await performBidirectionalSync(
          targetUserId,
          supabase,
          effectiveAccessToken,
          forceFullSync
        );
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
