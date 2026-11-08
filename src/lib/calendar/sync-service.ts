import { SupabaseClient } from "@supabase/supabase-js";
import { GoogleCalendarAdapter } from "./google-adapter";
import { GoogleTasksAdapter } from "./google-tasks-adapter";
import { CalendarEvent, Task } from "@/types";

export interface SyncSummary {
  success: boolean;
  connected: boolean;
  calendarEventsImported: number;
  calendarEventsDeleted: number;
  googleTasksImported: number;
  localTasksPushed: number;
  conflicts: number;
  lastSyncedAt: string;
  error?: string;
}

/**
 * Refreshes an expired Google OAuth access token using the stored refresh token.
 */
export async function refreshGoogleTokens(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
} | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) {
      console.error("[Token Refresh] Google OAuth token refresh failed:", res.statusText);
      return null;
    }

    const data = await res.json();
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
    };
  } catch (err) {
    console.error("[Token Refresh] Exception while refreshing token:", err);
    return null;
  }
}

/**
 * Executes a full bidirectional synchronization for an authenticated user.
 */
export async function performBidirectionalSync(
  userId: string,
  supabase: SupabaseClient
): Promise<SyncSummary> {
  const now = new Date().toISOString();

  // 1. Fetch user's calendar connection from the database
  const { data: connection, error: connError } = await supabase
    .from("calendar_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (connError || !connection || connection.sync_status === "disconnected") {
    return {
      success: false,
      connected: false,
      calendarEventsImported: 0,
      calendarEventsDeleted: 0,
      googleTasksImported: 0,
      localTasksPushed: 0,
      conflicts: 0,
      lastSyncedAt: now,
      error: "Google Calendar & Tasks are not connected for this account.",
    };
  }

  let accessToken = connection.access_token;
  const tokenExpiresAt = connection.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0;
  const isExpiringSoon = Date.now() >= tokenExpiresAt - 5 * 60 * 1000;

  // 2. Refresh token if expired or expiring soon
  if (isExpiringSoon && connection.refresh_token) {
    const refreshed = await refreshGoogleTokens(connection.refresh_token);
    if (refreshed) {
      accessToken = refreshed.accessToken;
      const newExpiry = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString();
      await supabase
        .from("calendar_connections")
        .update({
          access_token: refreshed.accessToken,
          token_expires_at: newExpiry,
          updated_at: now,
        })
        .eq("user_id", userId);
    } else {
      await supabase
        .from("calendar_connections")
        .update({ sync_status: "error", updated_at: now })
        .eq("user_id", userId);

      return {
        success: false,
        connected: false,
        calendarEventsImported: 0,
        calendarEventsDeleted: 0,
        googleTasksImported: 0,
        localTasksPushed: 0,
        conflicts: 0,
        lastSyncedAt: now,
        error: "Google authorization expired and could not be refreshed. Please reconnect Google Calendar.",
      };
    }
  }

  if (!accessToken) {
    return {
      success: false,
      connected: false,
      calendarEventsImported: 0,
      calendarEventsDeleted: 0,
      googleTasksImported: 0,
      localTasksPushed: 0,
      conflicts: 0,
      lastSyncedAt: now,
      error: "Valid Google access token missing. Please reconnect Google Calendar.",
    };
  }

  const calendarAdapter = new GoogleCalendarAdapter(accessToken, connection.external_calendar_id || "primary");
  const tasksAdapter = new GoogleTasksAdapter(accessToken);

  let calendarEventsImported = 0;
  let calendarEventsDeleted = 0;
  let googleTasksImported = 0;
  let localTasksPushed = 0;
  let conflicts = 0;

  try {
    // -------------------------------------------------------------------------
    // STEP A: Sync Google Calendar Events (Inbound)
    // -------------------------------------------------------------------------
    if (connection.google_calendar_sync_enabled !== false) {
      const calResult = await calendarAdapter.fetchRemoteChanges(connection.sync_token || undefined);

      // Import / Upsert added and modified events
      for (const ev of calResult.added) {
        const { error: upsertErr } = await supabase.from("calendar_events").upsert(
          {
            user_id: userId,
            title: ev.title,
            event_date: ev.date,
            start_time: ev.startTime,
            end_time: ev.endTime,
            category: ev.category || "meeting",
            is_fixed: true,
            location: ev.location,
            external_event_id: ev.id,
            source: "google",
            last_synced_at: now,
            updated_at: now,
          },
          { onConflict: "user_id,external_event_id" }
        );

        if (!upsertErr) {
          calendarEventsImported++;
        }
      }

      // Handle deleted Google Calendar events
      for (const delId of calResult.deletedIds) {
        const { error: delErr } = await supabase
          .from("calendar_events")
          .delete()
          .eq("user_id", userId)
          .eq("external_event_id", delId);

        if (!delErr) {
          calendarEventsDeleted++;
        }
      }

      // Update sync token
      if (calResult.newSyncToken && calResult.newSyncToken !== "token_fallback") {
        await supabase
          .from("calendar_connections")
          .update({ sync_token: calResult.newSyncToken, updated_at: now })
          .eq("user_id", userId);
      }
    }

    // -------------------------------------------------------------------------
    // STEP B: Sync Google Tasks (Inbound)
    // -------------------------------------------------------------------------
    if (connection.google_tasks_sync_enabled !== false) {
      const tasksResult = await tasksAdapter.fetchTasks();

      if (tasksResult.items && tasksResult.items.length > 0) {
        for (const gt of tasksResult.items) {
          let dueDate = new Date().toISOString().split("T")[0];
          if (gt.due) {
            dueDate = gt.due.split("T")[0];
          }

          const { error: taskUpsertErr } = await supabase.from("tasks").upsert(
            {
              user_id: userId,
              title: gt.title || "Untitled Google Task",
              description: gt.notes || "",
              category: "work",
              priority: "medium",
              status: gt.status === "completed" ? "completed" : "todo",
              scheduled_date: dueDate,
              external_task_id: gt.id,
              sync_source: "google_tasks",
              last_synced_at: now,
              updated_at: now,
            },
            { onConflict: "user_id,external_task_id" }
          );

          if (!taskUpsertErr) {
            googleTasksImported++;
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // STEP C: Outbound Sync (Kronos Tasks with Schedule -> Google Calendar)
    // -------------------------------------------------------------------------
    const { data: unsyncedEvents } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .eq("source", "local")
      .is("external_event_id", null);

    if (unsyncedEvents && unsyncedEvents.length > 0) {
      for (const localEv of unsyncedEvents) {
        try {
          const pushRes = await calendarAdapter.pushEvent({
            id: localEv.id,
            title: localEv.title,
            date: localEv.event_date,
            startTime: localEv.start_time,
            endTime: localEv.end_time,
            category: localEv.category,
            isFixed: localEv.is_fixed,
            location: localEv.location,
          });

          if (pushRes.success && pushRes.remoteId) {
            await supabase
              .from("calendar_events")
              .update({
                external_event_id: pushRes.remoteId,
                last_synced_at: now,
                updated_at: now,
              })
              .eq("id", localEv.id);
            localTasksPushed++;
          }
        } catch (pushErr) {
          console.warn("[Outbound Sync] Error pushing local event to Google:", pushErr);
        }
      }
    }

    // Update connection status
    await supabase
      .from("calendar_connections")
      .update({
        sync_status: "active",
        last_synced_at: now,
        updated_at: now,
      })
      .eq("user_id", userId);

    // Record in sync audit log
    await supabase.from("sync_audit_log").insert({
      user_id: userId,
      provider: "google_calendar",
      action: "import",
      status: "success",
      details: {
        calendarEventsImported,
        calendarEventsDeleted,
        googleTasksImported,
        localTasksPushed,
        conflicts,
      },
    });

    return {
      success: true,
      connected: true,
      calendarEventsImported,
      calendarEventsDeleted,
      googleTasksImported,
      localTasksPushed,
      conflicts,
      lastSyncedAt: now,
    };
  } catch (err: any) {
    console.error("[Sync Service] Critical error during bidirectional sync:", err);
    await supabase
      .from("calendar_connections")
      .update({ sync_status: "error", updated_at: now })
      .eq("user_id", userId);

    return {
      success: false,
      connected: false,
      calendarEventsImported,
      calendarEventsDeleted,
      googleTasksImported,
      localTasksPushed,
      conflicts,
      lastSyncedAt: now,
      error: err.message || "Failed to complete bidirectional synchronization",
    };
  }
}
