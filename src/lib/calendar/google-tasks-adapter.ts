/**
 * Google Tasks API v1 Integration Adapter
 *
 * Implements Google Tasks synchronization using:
 * - Direct REST calls to https://tasks.googleapis.com/tasks/v1
 * - OAuth 2.0 Bearer token authorization
 * - Support for @default tasklist
 * - Bidirectional sync between Kronos tasks and Google Tasks
 */

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  due?: string; // RFC 3339 timestamp
  status: "needsAction" | "completed";
  completed?: string; // RFC 3339 timestamp
  updated: string;
  deleted?: boolean;
}

export class GoogleTasksAdapter {
  private accessToken: string | null = null;
  private tasklistId: string = "@default";

  constructor(accessToken?: string, tasklistId: string = "@default") {
    this.accessToken = accessToken || null;
    this.tasklistId = tasklistId;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Discovers all task lists for the user.
   */
  async fetchTaskLists(): Promise<{ id: string; title: string }[]> {
    if (!this.accessToken) return [{ id: "@default", title: "My Tasks" }];
    try {
      const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        return [{ id: "@default", title: "My Tasks" }];
      }

      const data = await res.json();
      const lists = (data.items || []).map((l: any) => ({
        id: l.id,
        title: l.title || "Tasks",
      }));
      return lists.length > 0 ? lists : [{ id: "@default", title: "My Tasks" }];
    } catch {
      return [{ id: "@default", title: "My Tasks" }];
    }
  }

  /**
   * Fetches all tasks across all task lists (My Tasks, Reminders, custom lists).
   */
  async fetchTasks(): Promise<{ items: GoogleTaskItem[]; error?: string }> {
    if (!this.accessToken) {
      throw new Error("Google Tasks is not connected: access token missing.");
    }

    try {
      const taskLists = await this.fetchTaskLists();
      const allItems: GoogleTaskItem[] = [];
      const seenIds = new Set<string>();

      for (const list of taskLists) {
        try {
          const url = new URL(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(list.id)}/tasks`);
          url.searchParams.set("showCompleted", "true");
          url.searchParams.set("showHidden", "true");
          url.searchParams.set("maxResults", "100");

          const res = await fetch(url.toString(), {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              Accept: "application/json",
            },
            signal: AbortSignal.timeout(10000),
          });

          if (!res.ok) {
            const errJson = await res.json().catch(() => null);
            const detailedMsg = errJson?.error?.message || res.statusText;

            if (res.status === 401) {
              throw new Error("Google Tasks authorization has expired. Please reconnect your account.");
            }
            if (res.status === 403) {
              throw new Error("Insufficient Google Tasks permissions. Please authorize the https://www.googleapis.com/auth/tasks scope.");
            }
            continue;
          }

          const data = await res.json();
          for (const item of data.items || []) {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id);
              allItems.push(item);
            }
          }
        } catch (listErr: any) {
          if (listErr.message?.includes("authorization") || listErr.message?.includes("permissions")) {
            throw listErr;
          }
          console.warn(`[GoogleTasksAdapter] Notice fetching list ${list.title}:`, listErr);
        }
      }

      return { items: allItems };
    } catch (err: any) {
      return { items: [], error: err.message };
    }
  }

  /**
   * Creates a task in Google Tasks.
   */
  async createTask(task: {
    title: string;
    notes?: string;
    due?: string;
    status?: "needsAction" | "completed";
  }): Promise<{ id: string; error?: string }> {
    if (!this.accessToken) {
      throw new Error("Google Tasks is not connected.");
    }

    const payload: any = {
      title: task.title,
      notes: task.notes || "",
      status: task.status || "needsAction",
    };

    if (task.due) {
      // Google Tasks requires due date formatted as RFC 3339 timestamp (e.g. 2026-11-08T00:00:00.000Z)
      payload.due = task.due.includes("T") ? task.due : `${task.due}T00:00:00.000Z`;
    }

    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(this.tasklistId)}/tasks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(`Failed to create Google Task: ${errJson?.error?.message || res.statusText}`);
    }

    const created = await res.json();
    return { id: created.id };
  }

  /**
   * Updates an existing task in Google Tasks.
   */
  async updateTask(
    taskId: string,
    updates: {
      title?: string;
      notes?: string;
      due?: string;
      status?: "needsAction" | "completed";
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.accessToken) {
      throw new Error("Google Tasks is not connected.");
    }

    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.due !== undefined) {
      payload.due = updates.due.includes("T") ? updates.due : `${updates.due}T00:00:00.000Z`;
    }

    const res = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(this.tasklistId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return { success: res.ok };
  }

  /**
   * Deletes a task from Google Tasks.
   */
  async deleteTask(taskId: string): Promise<boolean> {
    if (!this.accessToken) return false;

    const res = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(this.tasklistId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    return res.ok || res.status === 404;
  }
}

export const googleTasksAdapter = new GoogleTasksAdapter();
