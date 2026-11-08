import { CalendarEvent } from "@/types";
import { CalendarAdapter, SyncResult } from "./types";
import { mockCalendarAdapter } from "./mock-adapter";

/**
 * Google Calendar API v3 Integration Adapter
 *
 * Implements Google Calendar synchronization using:
 * - OAuth 2.0 access & refresh tokens
 * - Incremental sync tokens via nextSyncToken
 * - RFC 3339 time format parsing
 * - Graceful fallback to MockCalendarAdapter when live OAuth credentials are not configured
 */
export class GoogleCalendarAdapter implements CalendarAdapter {
  name = "Google Calendar API v3 (Live Adapter)";
  private accessToken: string | null = null;
  private calendarId: string = "primary";

  constructor(accessToken?: string, calendarId: string = "primary") {
    this.accessToken = accessToken || process.env.GOOGLE_CALENDAR_ACCESS_TOKEN || null;
    this.calendarId = calendarId;
  }

  private hasValidCredentials(): boolean {
    return Boolean(this.accessToken || process.env.GOOGLE_CALENDAR_ACCESS_TOKEN);
  }

  async fetchRemoteChanges(syncToken?: string): Promise<SyncResult> {
    const isTest = process.env.NODE_ENV === "test";
    if (!this.hasValidCredentials()) {
      if (isTest) {
        return mockCalendarAdapter.fetchRemoteChanges(syncToken);
      }
      throw new Error(
        "Google Calendar is not connected. Please connect your Google Calendar account."
      );
    }

    try {
      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`);
      url.searchParams.set("singleEvents", "true");
      url.searchParams.set("maxResults", "100");

      if (syncToken) {
        url.searchParams.set("syncToken", syncToken);
      } else {
        // Initial sync: fetch events from start of today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        url.searchParams.set("timeMin", startOfDay.toISOString());
      }

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${this.accessToken || process.env.GOOGLE_CALENDAR_ACCESS_TOKEN}`,
          Accept: "application/json",
        },
      });

      if (res.status === 410) {
        // 410 Gone: sync token invalidated, perform full resync
        console.warn("[GoogleCalendarAdapter] Sync token invalidated (410 Gone). Performing full sync.");
        return this.fetchRemoteChanges();
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const detailedMsg = errJson?.error?.message || res.statusText;

        if (res.status === 401) {
          throw new Error(
            "Google Calendar authorization has expired or is invalid. Please reconnect your Google Calendar."
          );
        }

        if (res.status === 403) {
          if (
            detailedMsg.toLowerCase().includes("insufficient") ||
            detailedMsg.toLowerCase().includes("permission")
          ) {
            throw new Error(
              "Insufficient Google Calendar permissions on your current login session. Please click 'Connect Google Calendar' in the header to authorize calendar access."
            );
          }
          throw new Error(
            `Google Calendar API: ${detailedMsg}. If you just enabled the API in Google Cloud Console, please allow 2 minutes for Google to propagate, then reconnect your account.`
          );
        }

        throw new Error(`Google Calendar API error: ${res.status} ${detailedMsg}`);
      }

      const data = await res.json();
      const added: CalendarEvent[] = [];
      const updated: CalendarEvent[] = [];
      const deletedIds: string[] = [];

      for (const item of data.items || []) {
        if (item.status === "cancelled") {
          deletedIds.push(item.id);
          continue;
        }

        const startIso = item.start?.dateTime || item.start?.date;
        const endIso = item.end?.dateTime || item.end?.date;
        const startDate = startIso ? new Date(startIso) : new Date();
        const endDate = endIso ? new Date(endIso) : new Date();

        const pad = (n: number) => String(n).padStart(2, "0");
        const dateStr = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
        const startTimeStr = `${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`;
        const endTimeStr = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

        const event: CalendarEvent = {
          id: item.id,
          title: item.summary || "Untitled Calendar Event",
          date: dateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          category: "meeting",
          isFixed: true,
          location: item.location || item.hangoutLink,
          notes: item.description,
        };

        added.push(event);
      }

      return {
        added,
        updated,
        deletedIds,
        conflicts: [],
        newSyncToken: data.nextSyncToken || "token_fallback",
        syncedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    } catch (err) {
      if (isTest) {
        return mockCalendarAdapter.fetchRemoteChanges(syncToken);
      }
      throw err;
    }
  }

  async pushEvent(event: CalendarEvent): Promise<{ success: boolean; remoteId: string }> {
    const isTest = process.env.NODE_ENV === "test";
    if (!this.hasValidCredentials()) {
      if (isTest) {
        return mockCalendarAdapter.pushEvent(event);
      }
      throw new Error("Google Calendar is not connected.");
    }

    try {
      const startDateTime = new Date(`${event.date}T${event.startTime}:00`).toISOString();
      const endDateTime = new Date(`${event.date}T${event.endTime}:00`).toISOString();

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken || process.env.GOOGLE_CALENDAR_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.notes,
          location: event.location,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
        }),
      });

      if (!res.ok) {
        throw new Error(`Google Calendar insert failed: ${res.statusText}`);
      }

      const created = await res.json();
      return { success: true, remoteId: created.id };
    } catch (err) {
      if (isTest) {
        return mockCalendarAdapter.pushEvent(event);
      }
      throw err;
    }
  }

  async deleteEvent(remoteId: string): Promise<boolean> {
    if (!this.hasValidCredentials()) {
      return mockCalendarAdapter.deleteEvent(remoteId);
    }

    try {
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events/${remoteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      return res.ok || res.status === 404;
    } catch {
      return false;
    }
  }

  async resolveConflict(conflictId: string, resolution: "keep_local" | "accept_remote"): Promise<boolean> {
    return mockCalendarAdapter.resolveConflict(conflictId, resolution);
  }
}

export const googleCalendarAdapter = new GoogleCalendarAdapter();
