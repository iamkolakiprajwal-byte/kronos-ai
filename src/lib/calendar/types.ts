import { CalendarEvent, SyncConflict } from "@/types";

export type CalendarSyncStatus = "synced" | "syncing" | "conflict" | "error" | "offline";

export interface SyncResult {
  added: CalendarEvent[];
  updated: CalendarEvent[];
  deletedIds: string[];
  conflicts: SyncConflict[];
  newSyncToken: string;
  syncedAt: string;
}

export interface CalendarAdapter {
  name: string;
  fetchRemoteChanges(syncToken?: string): Promise<SyncResult>;
  pushEvent(event: CalendarEvent): Promise<{ success: boolean; remoteId: string }>;
  deleteEvent(remoteId: string): Promise<boolean>;
  resolveConflict(conflictId: string, resolution: "keep_local" | "accept_remote"): Promise<boolean>;
}
