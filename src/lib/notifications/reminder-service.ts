import { CalendarEvent, Task, NotificationItem } from "@/types";

export interface ScheduledReminder {
  id: string;
  targetTime: string;
  title: string;
  message: string;
  type: "task" | "calendar" | "habit" | "eco";
}

export class ReminderService {
  /**
   * Request browser notification permission
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window !== "undefined" && "Notification" in window) {
      return await Notification.requestPermission();
    }
    return "denied";
  }

  /**
   * Check if notifications are enabled
   */
  static isPermissionGranted(): boolean {
    if (typeof window !== "undefined" && "Notification" in window) {
      return Notification.permission === "granted";
    }
    return false;
  }

  /**
   * Dispatches a notification if permissions allow, or returns an in-app notification item
   */
  static notify(title: string, message: string, type: "task" | "calendar" | "habit" | "eco" = "task"): NotificationItem {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body: message,
          icon: "/file.svg",
        });
      } catch (err) {
        console.warn("Could not fire native notification:", err);
      }
    }

    return {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: "Just now",
      type,
      read: false,
    };
  }

  /**
   * Scans today's schedule and generates smart reminders
   */
  static generateScheduleReminders(tasks: Task[], events: CalendarEvent[]): ScheduledReminder[] {
    const reminders: ScheduledReminder[] = [];

    // Reminders for fixed commitments
    for (const ev of events) {
      reminders.push({
        id: `rem-ev-${ev.id}`,
        targetTime: ev.startTime,
        title: `Upcoming: ${ev.title}`,
        message: `Starts at ${ev.startTime}${ev.location ? ` (${ev.location})` : ""}. Prepare materials now.`,
        type: "calendar",
      });
    }

    // Reminders for high-priority tasks
    for (const task of tasks.filter((t) => (t.priority === "urgent" || t.priority === "high") && t.status !== "completed")) {
      if (task.startTime) {
        reminders.push({
          id: `rem-task-${task.id}`,
          targetTime: task.startTime,
          title: `Focus Block: ${task.title}`,
          message: `Scheduled for ${task.startTime} (${task.estimatedDuration}m). Minimize distractions.`,
          type: "task",
        });
      }
    }

    return reminders;
  }
}
