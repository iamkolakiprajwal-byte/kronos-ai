import { CalendarEvent, SyncConflict } from "@/types";
import { CalendarAdapter, SyncResult } from "./types";

export class MockCalendarAdapter implements CalendarAdapter {
  name = "Mock Google Calendar Adapter (Evaluation Mode)";

  private currentSyncToken = "sync_token_v1";
  private simulatedRemoteEvents: CalendarEvent[] = [
    {
      id: "gcal-ext-1",
      title: "Google Meet: Quarterly Academic / OKR Review",
      date: "2026-11-02",
      startTime: "16:00",
      endTime: "17:00",
      category: "meeting",
      isFixed: true,
      location: "meet.google.com/xyz-eval",
      notes: "Simulated remote event synced from Google Calendar",
    },
  ];

  async fetchRemoteChanges(syncToken?: string): Promise<SyncResult> {
    // Artificial realistic latency (150ms)
    await new Promise((r) => setTimeout(r, 150));

    const syncedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // If no previous token, return initial sync
    if (!syncToken) {
      return {
        added: this.simulatedRemoteEvents,
        updated: [],
        deletedIds: [],
        conflicts: [],
        newSyncToken: "sync_token_v2",
        syncedAt,
      };
    }

    // Incremental sync
    return {
      added: [],
      updated: [],
      deletedIds: [],
      conflicts: [],
      newSyncToken: syncToken,
      syncedAt,
    };
  }

  async pushEvent(event: CalendarEvent): Promise<{ success: boolean; remoteId: string }> {
    await new Promise((r) => setTimeout(r, 100));
    const remoteId = `gcal_${event.id}`;
    return { success: true, remoteId };
  }

  async deleteEvent(remoteId: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 80));
    this.simulatedRemoteEvents = this.simulatedRemoteEvents.filter((e) => e.id !== remoteId);
    return true;
  }

  async resolveConflict(conflictId: string, resolution: "keep_local" | "accept_remote"): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 80));
    return true;
  }

  /**
   * Generates a simulated conflict for assignment demonstration purposes
   */
  generateSimulatedConflict(): { conflict: SyncConflict; remoteEvent: CalendarEvent } {
    const remoteEvent: CalendarEvent = {
      id: "gcal-conflict-01",
      title: "Urgent: Thesis / Sprint Retrospective",
      date: "2026-11-02",
      startTime: "14:00",
      endTime: "15:00",
      category: "meeting",
      isFixed: true,
      location: "Google Meet (External Invitation)",
      notes: "Modified by department coordinator on Google Calendar",
    };

    const conflict: SyncConflict = {
      id: "sync-conflict-101",
      eventTitle: "Deep Work / Study Block vs Retrospective",
      localTime: "14:00 – 15:30 (Scheduled Study Block)",
      remoteTime: "14:00 – 15:00 (Google Meet Invitation)",
      source: "google_calendar",
      description:
        "External organizer created a meeting in Google Calendar overlapping your scheduled deep work block.",
    };

    return { conflict, remoteEvent };
  }
}

export const mockCalendarAdapter = new MockCalendarAdapter();
