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
  supabase: SupabaseClient,
  overrideAccessToken?: string,
  forceFullSync: boolean = false
): Promise<SyncSummary> {
  const now = new Date().toISOString();

  // 1. Fetch user's calendar connection from the database
  const { data: connection } = await supabase
    .from("calendar_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let accessToken = overrideAccessToken || connection?.access_token || process.env.GOOGLE_CALENDAR_ACCESS_TOKEN;

  // If connection is explicitly disconnected and no override token was passed
  if (!overrideAccessToken && connection?.sync_status === "disconnected") {
    return {
      success: false,
      connected: false,
      calendarEventsImported: 0,
      calendarEventsDeleted: 0,
      googleTasksImported: 0,
      localTasksPushed: 0,
      conflicts: 0,
      lastSyncedAt: now,
      error: "Google Calendar & Tasks are disconnected for this account.",
    };
  }

  // 2. Refresh token if expired or expiring soon
  const tokenExpiresAt = connection?.token_expires_at ? new Date(connection.token_expires_at).getTime() : 0;
  const isExpiringSoon = Date.now() >= tokenExpiresAt - 5 * 60 * 1000;

  if (isExpiringSoon && connection?.refresh_token && !overrideAccessToken) {
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
    } else if (!accessToken) {
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
        error: "Google authorization expired and could not be refreshed. Please click 'Authorize Calendar Access' to reconnect.",
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
      error: "No active Google Calendar authorization token found. Please click 'Authorize Calendar Access' in the header.",
    };
  }

  // Ensure connection row exists and is marked active with this token
  if (accessToken && (!connection || connection.access_token !== accessToken || connection.sync_status !== "active")) {
    await supabase.from("calendar_connections").upsert(
      {
        user_id: userId,
        provider: "google",
        access_token: accessToken,
        sync_status: "active",
        last_synced_at: now,
        google_tasks_sync_enabled: true,
        google_calendar_sync_enabled: true,
      },
      { onConflict: "user_id" }
    );
  }

  const calendarAdapter = new GoogleCalendarAdapter(accessToken, connection?.external_calendar_id || "primary");
  const tasksAdapter = new GoogleTasksAdapter(accessToken);

  let calendarEventsImported = 0;
  let calendarEventsDeleted = 0;
  let googleTasksImported = 0;
  let localTasksPushed = 0;
  let conflicts = 0;

  try {
    // -------------------------------------------------------------------------
    // STEP A: Sync Google Calendar Events (Inbound: Primary + Birthdays + Custom)
    // -------------------------------------------------------------------------
    if (connection?.google_calendar_sync_enabled !== false) {
      const syncTokenToUse = forceFullSync ? undefined : connection?.sync_token || undefined;
      const calResult = await calendarAdapter.fetchRemoteChanges(syncTokenToUse);

      for (const ev of calResult.added) {
        const payload: any = {
          user_id: userId,
          title: ev.title,
          event_date: ev.date,
          start_time: ev.startTime || "09:00",
          end_time: ev.endTime || "10:00",
          category: ev.category || "meeting",
          is_fixed: true,
          is_all_day: (ev as any).isAllDay || (ev.startTime === "00:00" && ev.endTime === "23:59"),
          location: ev.location,
          color: ev.color,
          external_event_id: ev.id,
          source: "google",
          last_synced_at: now,
          updated_at: now,
        };

        const { data: existing } = await supabase
          .from("calendar_events")
          .select("id")
          .eq("user_id", userId)
          .eq("external_event_id", ev.id)
          .maybeSingle();

        if (existing) {
          const { error: updErr } = await supabase
            .from("calendar_events")
            .update(payload)
            .eq("id", existing.id);
          if (!updErr) {
            calendarEventsImported++;
          }
        } else {
          const { error: insErr } = await supabase
            .from("calendar_events")
            .insert(payload);
          if (!insErr) {
            calendarEventsImported++;
          }
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
    // STEP B: Sync Google Tasks (Inbound: All Task Lists)
    // -------------------------------------------------------------------------
    if (connection?.google_tasks_sync_enabled !== false) {
      const tasksResult = await tasksAdapter.fetchTasks();

      if (tasksResult.items && tasksResult.items.length > 0) {
        for (const gt of tasksResult.items) {
          let dueDate = new Date().toISOString().split("T")[0];
          if (gt.due) {
            dueDate = gt.due.split("T")[0];
          }

          const taskPayload = {
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
          };

          const { data: existingTask } = await supabase
            .from("tasks")
            .select("id")
            .eq("user_id", userId)
            .eq("external_task_id", gt.id)
            .maybeSingle();

          if (existingTask) {
            const { error: taskUpdErr } = await supabase
              .from("tasks")
              .update(taskPayload)
              .eq("id", existingTask.id);
            if (!taskUpdErr) {
              googleTasksImported++;
            }
          } else {
            const { error: taskInsErr } = await supabase
              .from("tasks")
              .insert(taskPayload);
            if (!taskInsErr) {
              googleTasksImported++;
            }
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // STEP C: Outbound Sync (Kronos Tasks & Events -> Google Tasks & Google Calendar)
    // -------------------------------------------------------------------------

    // Pass C1: Push Local Kronos Tasks to Google Tasks
    const { data: unsyncedTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("sync_source", "local")
      .is("external_task_id", null)
      .limit(10);

    if (unsyncedTasks && unsyncedTasks.length > 0) {
      for (const t of unsyncedTasks) {
        try {
          const createdRemote = await tasksAdapter.createTask({
            title: t.title,
            notes: t.description || undefined,
            due: t.scheduled_date,
            status: t.status === "completed" ? "completed" : "needsAction",
          });

          if (createdRemote?.id) {
            await supabase
              .from("tasks")
              .update({
                external_task_id: createdRemote.id,
                last_synced_at: now,
                updated_at: now,
              })
              .eq("id", t.id);
            localTasksPushed++;
          }
        } catch (taskPushErr) {
          console.warn(`[Outbound Sync] Error pushing task "${t.title}" to Google Tasks:`, taskPushErr);
        }
      }
    }

    // Pass C2: Push Local Calendar Events to Google Calendar
    const { data: unsyncedEvents } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .eq("source", "local")
      .is("external_event_id", null)
      .limit(10);

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
          console.warn("[Outbound Sync] Error pushing local event to Google Calendar:", pushErr);
        }
      }
    }

    // Pass C3: Push Scheduled Tasks (with startTime and endTime) to Google Calendar as events
    const { data: timedTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .not("start_time", "is", null)
      .not("end_time", "is", null)
      .limit(10);

    if (timedTasks && timedTasks.length > 0) {
      for (const tt of timedTasks) {
        // Check if event already created for this task
        const { data: existingCalEv } = await supabase
          .from("calendar_events")
          .select("id")
          .eq("user_id", userId)
          .eq("task_id", tt.id)
          .maybeSingle();

        if (!existingCalEv) {
          try {
            const pushRes = await calendarAdapter.pushEvent({
              id: tt.id,
              title: tt.title,
              date: tt.scheduled_date,
              startTime: tt.start_time || "09:00",
              endTime: tt.end_time || "10:00",
              category: tt.category === "study" ? "academic" : "meeting",
              isFixed: tt.is_fixed || false,
            });

            if (pushRes.success && pushRes.remoteId) {
              await supabase.from("calendar_events").insert({
                user_id: userId,
                task_id: tt.id,
                title: tt.title,
                event_date: tt.scheduled_date,
                start_time: tt.start_time || "09:00",
                end_time: tt.end_time || "10:00",
                category: tt.category === "study" ? "academic" : "meeting",
                is_fixed: tt.is_fixed || false,
                external_event_id: pushRes.remoteId,
                source: "google",
                last_synced_at: now,
                updated_at: now,
              });
              localTasksPushed++;
            }
          } catch (calPushErr) {
            console.warn(`[Outbound Sync] Error pushing scheduled task "${tt.title}" to Google Calendar:`, calPushErr);
          }
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
