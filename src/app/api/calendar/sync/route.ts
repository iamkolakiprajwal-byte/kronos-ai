import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { performBidirectionalSync, getOrRefreshValidAccessToken } from "@/lib/calendar/sync-service";
import { GoogleCalendarAdapter } from "@/lib/calendar/google-adapter";
import { GoogleTasksAdapter } from "@/lib/calendar/google-tasks-adapter";
import { mockCalendarAdapter } from "@/lib/calendar/mock-adapter";

const SyncRequestSchema = z.object({
  action: z
    .enum(["sync", "disconnect", "simulate_conflict", "resolve", "reset_and_sync", "delete_remote"])
    .default("sync"),
  conflictId: z.string().optional(),
  resolution: z.enum(["keep_local", "accept_remote"]).optional(),
  useMock: z.boolean().default(false),
  accessToken: z.string().optional(),
  taskId: z.string().optional(),
  eventId: z.string().optional(),
  title: z.string().optional(),
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
    const { action, conflictId, resolution, useMock, accessToken, taskId, eventId, title } =
      SyncRequestSchema.parse(body);

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

        if (action === "delete_remote") {
          const targetTitle = (title || "").trim();
          const targetTaskId = (taskId || "").trim();
          const targetEventId = (eventId || "").trim();

          let deletedFromGoogle = false;

          // 1. Delete from Supabase tasks & calendar_events
          if (targetTaskId) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetTaskId);
            if (isUuid) {
              await supabase.from("tasks").delete().eq("user_id", targetUserId).or(`id.eq.${targetTaskId},external_task_id.eq.${targetTaskId}`);
              await supabase.from("calendar_events").delete().eq("user_id", targetUserId).or(`id.eq.${targetTaskId},task_id.eq.${targetTaskId}`);
            } else {
              await supabase.from("tasks").delete().eq("user_id", targetUserId).or(`title.ilike.${targetTaskId},external_task_id.eq.${targetTaskId}`);
              await supabase.from("calendar_events").delete().eq("user_id", targetUserId).ilike("title", targetTaskId);
            }
          }
          if (targetTitle) {
            await supabase.from("tasks").delete().eq("user_id", targetUserId).ilike("title", targetTitle);
            await supabase.from("calendar_events").delete().eq("user_id", targetUserId).ilike("title", targetTitle);
          }

          // 2. Delete from Google Calendar & Google Tasks if active connection exists
          try {
            const { data: connection } = await supabase
              .from("calendar_connections")
              .select("*")
              .eq("user_id", targetUserId)
              .maybeSingle();

            if (connection && (connection.sync_status === "active" || connection.sync_status === "synced")) {
              const tokenResult = await getOrRefreshValidAccessToken(targetUserId, supabase, connection);
              if (tokenResult.accessToken) {
                const tasksAdapter = new GoogleTasksAdapter(tokenResult.accessToken);
                const calAdapter = new GoogleCalendarAdapter(tokenResult.accessToken, connection.calendar_id || "primary");

                // Google Tasks cleanup
                if (targetTaskId && !targetTaskId.startsWith("task-")) {
                  await tasksAdapter.deleteTask(targetTaskId).catch(() => false);
                  deletedFromGoogle = true;
                }
                if (targetTitle) {
                  const remoteTasks = await tasksAdapter.fetchTasks().catch(() => ({ items: [] }));
                  for (const item of remoteTasks.items || []) {
                    if (item.title?.toLowerCase().trim() === targetTitle.toLowerCase()) {
                      await tasksAdapter.deleteTask(item.id).catch(() => false);
                      deletedFromGoogle = true;
                    }
                  }
                }

                // Google Calendar cleanup
                if (targetEventId && !targetEventId.startsWith("event-")) {
                  await calAdapter.deleteEvent(targetEventId).catch(() => false);
                  deletedFromGoogle = true;
                }
                if (targetTitle) {
                  const remoteCal = await calAdapter.fetchRemoteChanges().catch(() => ({ added: [], deletedIds: [] }));
                  for (const ev of remoteCal.added || []) {
                    if (ev.title?.toLowerCase().trim() === targetTitle.toLowerCase()) {
                      await calAdapter.deleteEvent(ev.id).catch(() => false);
                      deletedFromGoogle = true;
                    }
                  }
                }
              }
            }
          } catch (remoteErr) {
            console.warn("[delete_remote] Remote Google cleanup notice:", remoteErr);
          }

          return NextResponse.json({
            success: true,
            action: "delete_remote",
            deletedFromGoogle,
            message: "Item removed from database and synchronized with Google.",
          });
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
