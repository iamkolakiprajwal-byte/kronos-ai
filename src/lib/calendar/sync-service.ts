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
  reauthRequired?: boolean;
}

export interface RefreshResult {
  success: boolean;
  accessToken?: string;
  expiresIn?: number;
  refreshToken?: string;
  error?: "invalid_grant" | "temporary_error" | "config_missing" | "no_refresh_token";
  message?: string;
}

// Single-flight in-memory promise locks preventing concurrent duplicate operations per user
const inFlightSyncs = new Map<string, Promise<SyncSummary>>();
const inFlightRefreshes = new Map<string, Promise<RefreshResult>>();

/**
 * Refreshes an expired Google OAuth access token using the stored refresh token.
 * Differentiates between permanent revocation (invalid_grant), temporary outages, and missing config.
 */
export async function refreshGoogleTokens(refreshToken: string): Promise<RefreshResult> {
  if (!refreshToken) {
    return {
      success: false,
      error: "no_refresh_token",
      message: "No refresh token available to refresh Google session.",
    };
  }

  const existingRefresh = inFlightRefreshes.get(refreshToken);
  if (existingRefresh) {
    return existingRefresh;
  }

  const refreshPromise = executeGoogleTokenRefresh(refreshToken).finally(() => {
    inFlightRefreshes.delete(refreshToken);
  });

  inFlightRefreshes.set(refreshToken, refreshPromise);
  return refreshPromise;
}

async function executeGoogleTokenRefresh(refreshToken: string): Promise<RefreshResult> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("[Token Refresh] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured in server environment.");
    return {
      success: false,
      error: "config_missing",
      message: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required in .env.local to refresh tokens automatically.",
    };
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
      signal: AbortSignal.timeout(12000),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errCode = data?.error;
      const errDesc = data?.error_description || res.statusText;
      console.error(`[Token Refresh] Google OAuth token refresh failed (${res.status}): ${errCode} - ${errDesc}`);

      if (errCode === "invalid_grant") {
        return {
          success: false,
          error: "invalid_grant",
          message: "Google authorization has been revoked or expired. Please reauthorize access.",
        };
      }

      return {
        success: false,
        error: "temporary_error",
        message: `Google token refresh failed (${res.status}): ${errDesc}`,
      };
    }

    if (!data?.access_token) {
      return {
        success: false,
        error: "temporary_error",
        message: "Google token endpoint returned response without access_token.",
      };
    }

    return {
      success: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in || 3600,
      refreshToken: data.refresh_token, // Google may rotate the refresh token
    };
  } catch (err: any) {
    console.error("[Token Refresh] Exception while refreshing Google token:", err);
    return {
      success: false,
      error: "temporary_error",
      message: err.message || "Network exception during token refresh",
    };
  }
}

/**
 * Retrieves a valid access token for the given user, proactively refreshing
 * if the token is expired or expiring within 5 minutes.
 */
export function isTokenExpired(
  tokenExpiresAt?: string | number | null,
  bufferMs: number = 5 * 60 * 1000
): boolean {
  if (!tokenExpiresAt) return true;
  const expiryMs = typeof tokenExpiresAt === "number" ? tokenExpiresAt : new Date(tokenExpiresAt).getTime();
  if (isNaN(expiryMs)) return true;
  return Date.now() >= expiryMs - bufferMs;
}

async function getOrRefreshValidAccessToken(
  userId: string,
  supabase: SupabaseClient,
  connection: any
): Promise<{ accessToken: string | null; error?: string; reauthRequired?: boolean }> {
  let accessToken = connection?.access_token || process.env.GOOGLE_CALENDAR_ACCESS_TOKEN || null;
  const isExpiredOrExpiring = isTokenExpired(connection?.token_expires_at);

  if (isExpiredOrExpiring && connection?.refresh_token) {
    // Single-flight deduplication: if a refresh is already in flight for this user, await it
    let refreshPromise = inFlightRefreshes.get(userId);
    if (!refreshPromise) {
      refreshPromise = refreshGoogleTokens(connection.refresh_token).finally(() => {
        inFlightRefreshes.delete(userId);
      });
      inFlightRefreshes.set(userId, refreshPromise);
    }

    const refreshResult = await refreshPromise;

    if (refreshResult.success && refreshResult.accessToken) {
      accessToken = refreshResult.accessToken;
      const newExpiry = new Date(Date.now() + (refreshResult.expiresIn || 3600) * 1000).toISOString();
      
      const updatePayload: any = {
        access_token: refreshResult.accessToken,
        token_expires_at: newExpiry,
        sync_status: "active",
        updated_at: new Date().toISOString(),
      };
      if (refreshResult.refreshToken) {
        updatePayload.refresh_token = refreshResult.refreshToken;
      }

      await supabase
        .from("calendar_connections")
        .update(updatePayload)
        .eq("user_id", userId);

      console.log(`[Token Refresh] Successfully refreshed access token for user ${userId}. Valid until ${newExpiry}`);
      return { accessToken };
    }

    if (refreshResult.error === "invalid_grant") {
      await supabase
        .from("calendar_connections")
        .update({ sync_status: "error", updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      return {
        accessToken: null,
        error: refreshResult.message || "Google authorization revoked.",
        reauthRequired: true,
      };
    }

    if (refreshResult.error === "config_missing") {
      // If client credentials are not in .env.local, use existing access_token if still unexpired
      if (!isTokenExpired(connection?.token_expires_at, 0) && accessToken) {
        return { accessToken };
      }
      return {
        accessToken: null,
        error: "Google token refresh requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local.",
        reauthRequired: false,
      };
    }
  }

  return { accessToken };
}

/**
 * Executes a full bidirectional synchronization for an authenticated user with
 * single-flight concurrency protection, automatic token refresh, and retry on 401.
 */
export async function performBidirectionalSync(
  userId: string,
  supabase: SupabaseClient,
  overrideAccessToken?: string,
  forceFullSync: boolean = false
): Promise<SyncSummary> {
  // If a sync is already running for this user, return the active promise
  const existingSync = inFlightSyncs.get(userId);
  if (existingSync) {
    console.log(`[Sync Service] Joining existing in-flight sync for user ${userId}`);
    return existingSync;
  }

  const syncPromise = executeBidirectionalSync(userId, supabase, overrideAccessToken, forceFullSync)
    .finally(() => {
      inFlightSyncs.delete(userId);
    });

  inFlightSyncs.set(userId, syncPromise);
  return syncPromise;
}

async function executeBidirectionalSync(
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

  // If explicitly disconnected
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

  // 2. Resolve valid access token (proactively refreshed if needed)
  let activeAccessToken = overrideAccessToken;
  if (!activeAccessToken) {
    const tokenResult = await getOrRefreshValidAccessToken(userId, supabase, connection);
    if (!tokenResult.accessToken) {
      return {
        success: false,
        connected: !tokenResult.reauthRequired,
        calendarEventsImported: 0,
        calendarEventsDeleted: 0,
        googleTasksImported: 0,
        localTasksPushed: 0,
        conflicts: 0,
        lastSyncedAt: now,
        error: tokenResult.error || "No valid Google Calendar authorization token found.",
        reauthRequired: tokenResult.reauthRequired,
      };
    }
    activeAccessToken = tokenResult.accessToken;
  }

  // Ensure connection row exists and preserves refresh token
  if (activeAccessToken && (!connection || connection.access_token !== activeAccessToken || connection.sync_status !== "active")) {
    const upsertPayload: any = {
      user_id: userId,
      provider: "google",
      access_token: activeAccessToken,
      sync_status: "active",
      last_synced_at: now,
      google_tasks_sync_enabled: true,
      google_calendar_sync_enabled: true,
      updated_at: now,
    };
    if (connection?.refresh_token) {
      upsertPayload.refresh_token = connection.refresh_token;
    }
    if (connection?.token_expires_at) {
      upsertPayload.token_expires_at = connection.token_expires_at;
    }

    await supabase.from("calendar_connections").upsert(upsertPayload, { onConflict: "user_id" });
  }

  const calendarAdapter = new GoogleCalendarAdapter(activeAccessToken, connection?.external_calendar_id || "primary");
  const tasksAdapter = new GoogleTasksAdapter(activeAccessToken);

  let calendarEventsImported = 0;
  let calendarEventsDeleted = 0;
  let googleTasksImported = 0;
  let localTasksPushed = 0;
  let conflicts = 0;

  // Helper to re-attempt an operation once if a 401 is encountered
  const attemptWithTokenRetry = async <T>(operationName: string, op: () => Promise<T>): Promise<T> => {
    try {
      return await op();
    } catch (opErr: any) {
      const is401 = opErr.message?.includes("401") || opErr.message?.includes("authorization has expired");
      if (is401 && connection?.refresh_token) {
        console.warn(`[Sync Service] 401 encountered in ${operationName}. Refreshing token and retrying once...`);
        const refreshResult = await refreshGoogleTokens(connection.refresh_token);
        if (refreshResult.success && refreshResult.accessToken) {
          activeAccessToken = refreshResult.accessToken;
          calendarAdapter.setAccessToken(refreshResult.accessToken);
          tasksAdapter.setAccessToken(refreshResult.accessToken);
          const newExpiry = new Date(Date.now() + (refreshResult.expiresIn || 3600) * 1000).toISOString();

          await supabase
            .from("calendar_connections")
            .update({
              access_token: refreshResult.accessToken,
              token_expires_at: newExpiry,
              sync_status: "active",
              updated_at: now,
            })
            .eq("user_id", userId);

          return await op(); // Retry operation with fresh token
        }
      }
      throw opErr;
    }
  };

  try {
    // -------------------------------------------------------------------------
    // STEP A: Sync Google Calendar Events (Inbound)
    // -------------------------------------------------------------------------
    if (connection?.google_calendar_sync_enabled !== false) {
      const syncTokenToUse = forceFullSync ? undefined : connection?.sync_token || undefined;
      const calResult = await attemptWithTokenRetry("Google Calendar Fetch", () =>
        calendarAdapter.fetchRemoteChanges(syncTokenToUse)
      );

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
          if (!updErr) calendarEventsImported++;
        } else {
          const { error: insErr } = await supabase
            .from("calendar_events")
            .insert(payload);
          if (!insErr) calendarEventsImported++;
        }
      }

      for (const delId of calResult.deletedIds) {
        const { error: delErr } = await supabase
          .from("calendar_events")
          .delete()
          .eq("user_id", userId)
          .eq("external_event_id", delId);
        if (!delErr) calendarEventsDeleted++;
      }

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
    if (connection?.google_tasks_sync_enabled !== false) {
      const tasksResult = await attemptWithTokenRetry("Google Tasks Fetch", () =>
        tasksAdapter.fetchTasks()
      );

      if (tasksResult.items && tasksResult.items.length > 0) {
        for (const gt of tasksResult.items) {
          let dueDate = new Date().toISOString().split("T")[0];
          if (gt.due) dueDate = gt.due.split("T")[0];

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
            if (!taskUpdErr) googleTasksImported++;
          } else {
            const { error: taskInsErr } = await supabase
              .from("tasks")
              .insert(taskPayload);
            if (!taskInsErr) googleTasksImported++;
          }
        }
      }
    }

    // -------------------------------------------------------------------------
    // STEP C: Outbound Sync (Kronos Tasks -> Google)
    // -------------------------------------------------------------------------
    const { data: unsyncedTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .is("external_task_id", null)
      .limit(10);

    if (unsyncedTasks && unsyncedTasks.length > 0) {
      for (const ut of unsyncedTasks) {
        try {
          const pushRes = await attemptWithTokenRetry(`Push Task ${ut.title}`, () =>
            tasksAdapter.createTask({
              title: ut.title,
              notes: ut.description || undefined,
              due: ut.deadline || (ut.scheduled_date ? `${ut.scheduled_date}T23:59:59Z` : undefined),
            })
          );

          if (pushRes.id) {
            await supabase
              .from("tasks")
              .update({
                external_task_id: pushRes.id,
                sync_source: "kronos_to_google",
                last_synced_at: now,
              })
              .eq("id", ut.id);
            localTasksPushed++;
          }
        } catch (pushErr) {
          console.warn(`[Outbound Sync] Error pushing task "${ut.title}" to Google Tasks:`, pushErr);
        }
      }
    }

    // Outbound push for scheduled timeline blocks to Google Calendar
    const { data: unsyncedEvents } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .not("start_time", "is", null)
      .is("google_event_id", null)
      .limit(5);

    if (unsyncedEvents && unsyncedEvents.length > 0) {
      for (const tt of unsyncedEvents) {
        try {
          const gcalRes = await attemptWithTokenRetry(`Push Event ${tt.title}`, () =>
            calendarAdapter.pushEvent({
              id: tt.id,
              title: tt.title,
              date: tt.scheduled_date || new Date().toISOString().split("T")[0],
              startTime: tt.start_time || "09:00",
              endTime: tt.end_time || "10:00",
              category: "deep_work",
              isFixed: false,
            })
          );

          if (gcalRes.success && gcalRes.remoteId) {
            await supabase
              .from("tasks")
              .update({ google_event_id: gcalRes.remoteId })
              .eq("id", tt.id);
            localTasksPushed++;
          }
        } catch (calPushErr) {
          console.warn(`[Outbound Sync] Error pushing task "${tt.title}" to Google Calendar:`, calPushErr);
        }
      }
    }

    // 3. Mark connection active and preserve refresh token
    const updateConnPayload: any = {
      sync_status: "active",
      last_synced_at: now,
      updated_at: now,
    };
    if (activeAccessToken) {
      updateConnPayload.access_token = activeAccessToken;
    }

    await supabase
      .from("calendar_connections")
      .update(updateConnPayload)
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
    const isAuthRevoked =
      err.message?.includes("invalid_grant") ||
      err.message?.includes("revoked") ||
      err.message?.includes("reconnect your account");

    // Only set sync_status = "error" if authorization is genuinely revoked!
    // Temporary network timeouts or 5xx outages preserve sync_status = "active".
    if (isAuthRevoked) {
      await supabase
        .from("calendar_connections")
        .update({ sync_status: "error", updated_at: now })
        .eq("user_id", userId);
    }

    return {
      success: false,
      connected: !isAuthRevoked,
      calendarEventsImported,
      calendarEventsDeleted,
      googleTasksImported,
      localTasksPushed,
      conflicts,
      lastSyncedAt: now,
      error: err.message || "Failed to complete bidirectional synchronization",
      reauthRequired: isAuthRevoked,
    };
  }
}
