import { Task } from "@/types";
import {
  SchedulerInput,
  ScheduleResult,
  FixedInterval,
  ScheduledTaskPlacement,
  SchedulingConflict,
  TimeSlot,
} from "./types";

export function timeToMinutes(t: string): number {
  const parts = t.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

export function minutesToTime(mins: number): string {
  const normalized = Math.max(0, Math.min(1439, mins));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export class DeterministicScheduler {
  static scheduleDay(input: SchedulerInput): ScheduleResult {
    const wakeMins = timeToMinutes(input.wakeTime || "07:30");
    const sleepMins = timeToMinutes(input.sleepTime || "23:30");
    const breakDuration = input.preferredBreakDuration || 10;

    // Start scheduling from wake time, or from current time if mid-day rescheduling
    let startBoundary = wakeMins;
    if (input.currentTime) {
      startBoundary = Math.max(startBoundary, timeToMinutes(input.currentTime));
    }

    // 1. Process Fixed Commitments (Classes, Standups, Fixed Meetings)
    const fixedIntervals: FixedInterval[] = input.fixedCommitments
      .map((c) => ({
        id: c.id,
        title: c.title,
        startTime: c.startTime,
        endTime: c.endTime,
        startMinutes: timeToMinutes(c.startTime),
        endMinutes: timeToMinutes(c.endTime),
        category: c.category || "academic",
      }))
      .sort((a, b) => a.startMinutes - b.startMinutes);

    // 2. Add lunch recovery window if hours span across midday (12:15 to 13:00)
    const lunchStart = 12 * 60 + 15; // 12:15
    const lunchEnd = 13 * 60;        // 13:00
    if (startBoundary <= lunchStart && sleepMins >= lunchEnd) {
      const hasConflict = fixedIntervals.some(
        (f) => Math.max(f.startMinutes, lunchStart) < Math.min(f.endMinutes, lunchEnd)
      );
      if (!hasConflict) {
        fixedIntervals.push({
          id: "lunch-buffer",
          title: "Mindful Lunch & Transition",
          startTime: "12:15",
          endTime: "13:00",
          startMinutes: lunchStart,
          endMinutes: lunchEnd,
          category: "personal",
        });
        fixedIntervals.sort((a, b) => a.startMinutes - b.startMinutes);
      }
    }

    // 3. Compute Open Available Intervals between startBoundary and sleepMins
    let availableSlots: TimeSlot[] = [];
    let currentPointer = startBoundary;

    for (const fixed of fixedIntervals) {
      if (fixed.endMinutes <= startBoundary) {
        // Commitment has already elapsed
        continue;
      }

      if (fixed.startMinutes > currentPointer) {
        // Open window between currentPointer and start of fixed commitment
        availableSlots.push({
          startMinutes: currentPointer,
          endMinutes: Math.min(fixed.startMinutes, sleepMins),
        });
      }
      currentPointer = Math.max(currentPointer, fixed.endMinutes);
    }

    if (currentPointer < sleepMins) {
      availableSlots.push({
        startMinutes: currentPointer,
        endMinutes: sleepMins,
      });
    }

    // Filter out slivers smaller than minimum viable task duration (15 min)
    availableSlots = availableSlots.filter((slot) => slot.endMinutes - slot.startMinutes >= 15);

    // 4. Energy Peak Window Bounds
    let peakStart = 8 * 60;   // 08:00
    let peakEnd = 12 * 60;    // 12:00
    if (input.mostProductivePeriod === "afternoon") {
      peakStart = 12 * 60;
      peakEnd = 17 * 60;
    } else if (input.mostProductivePeriod === "evening") {
      peakStart = 17 * 60;
      peakEnd = 21 * 60;
    } else if (input.mostProductivePeriod === "night") {
      peakStart = 21 * 60;
      peakEnd = 23 * 60 + 30;
    }

    // 5. Score and Sort Tasks by Priority & Deadline
    const scoreTask = (task: Task): number => {
      let score = 0;
      if (task.priority === "urgent") score += 1000;
      else if (task.priority === "high") score += 500;
      else if (task.priority === "medium") score += 200;
      else score += 50;

      if (task.deadline) {
        score += 300;
      }
      if (task.energyLevel === "high") {
        score += 150;
      }
      return score;
    };

    // Separate fixed tasks already placed from flexible tasks
    const flexibleTasks = input.tasksToSchedule
      .filter((t) => !t.isFixed && t.status !== "completed")
      .sort((a, b) => scoreTask(b) - scoreTask(a));

    const scheduledPlacements: ScheduledTaskPlacement[] = [];
    const conflicts: SchedulingConflict[] = [];

    // 6. Placement Loop using First-Fit with Energy Bias
    for (const task of flexibleTasks) {
      const duration = task.estimatedDuration || input.preferredFocusDuration || 45;
      let placed = false;

      // First try to place high-energy/urgent tasks inside the peak window if possible
      if (task.energyLevel === "high" || task.priority === "urgent") {
        for (let i = 0; i < availableSlots.length; i++) {
          const slot = availableSlots[i];
          const slotStart = slot.startMinutes;
          const slotEnd = slot.endMinutes;

          // Check if slot overlaps with peak window
          const overlapStart = Math.max(slotStart, peakStart);
          const overlapEnd = Math.min(slotEnd, peakEnd);

          if (overlapEnd - overlapStart >= duration) {
            const taskStart = overlapStart;
            const taskEnd = taskStart + duration;

            scheduledPlacements.push({
              task,
              startTime: minutesToTime(taskStart),
              endTime: minutesToTime(taskEnd),
              startMinutes: taskStart,
              endMinutes: taskEnd,
            });

            // Re-slice available slots
            availableSlots.splice(i, 1);
            if (taskStart - slotStart >= 15) {
              availableSlots.push({ startMinutes: slotStart, endMinutes: taskStart });
            }
            const nextFree = taskEnd + breakDuration;
            if (slotEnd - nextFree >= 15) {
              availableSlots.push({ startMinutes: nextFree, endMinutes: slotEnd });
            }
            availableSlots.sort((a, b) => a.startMinutes - b.startMinutes);
            placed = true;
            break;
          }
        }
      }

      // If not placed in peak window, find first open slot that fits duration
      if (!placed) {
        for (let i = 0; i < availableSlots.length; i++) {
          const slot = availableSlots[i];
          const slotDuration = slot.endMinutes - slot.startMinutes;

          if (slotDuration >= duration) {
            const taskStart = slot.startMinutes;
            const taskEnd = taskStart + duration;

            scheduledPlacements.push({
              task,
              startTime: minutesToTime(taskStart),
              endTime: minutesToTime(taskEnd),
              startMinutes: taskStart,
              endMinutes: taskEnd,
            });

            const nextFree = taskEnd + breakDuration;
            if (slot.endMinutes - nextFree >= 15) {
              availableSlots[i] = { startMinutes: nextFree, endMinutes: slot.endMinutes };
            } else {
              availableSlots.splice(i, 1);
            }
            placed = true;
            break;
          }
        }
      }

      // If unable to fit, record an explicit conflict instead of silently dropping
      if (!placed) {
        conflicts.push({
          taskId: task.id,
          taskTitle: task.title,
          reason: `Requires ${duration} minutes, but remaining open slots before ${input.sleepTime} are insufficient.`,
          suggestedAction: "Shift to tomorrow or divide into smaller 25-minute segments.",
        });
      }
    }

    // Sort scheduled placements chronologically
    scheduledPlacements.sort((a, b) => a.startMinutes - b.startMinutes);

    const totalFocusMinutes = scheduledPlacements.reduce(
      (sum, p) => sum + (p.endMinutes - p.startMinutes),
      0
    );
    const totalAvailableMinutes = sleepMins - wakeMins;

    const summaryExplanation =
      conflicts.length === 0
        ? `All ${scheduledPlacements.length} tasks scheduled successfully. Protected sleep at ${input.sleepTime}.`
        : `Scheduled ${scheduledPlacements.length} tasks. ${conflicts.length} task(s) could not fit without violating sleep or fixed slots.`;

    return {
      isFeasible: conflicts.length === 0,
      scheduledPlacements,
      conflicts,
      totalFocusMinutes,
      totalAvailableMinutes,
      summaryExplanation,
    };
  }

  /**
   * Dynamic Rescheduling:
   * When an unexpected interruption occurs or a morning task is missed,
   * recalculates remaining schedule from currentTime forward.
   */
  static rescheduleRemainingDay(
    input: SchedulerInput,
    interruption?: { title: string; duration: number; startTime: string }
  ): ScheduleResult {
    const copyInput: SchedulerInput = { ...input };

    if (interruption) {
      const startMins = timeToMinutes(interruption.startTime);
      const endMins = startMins + interruption.duration;
      copyInput.fixedCommitments = [
        ...copyInput.fixedCommitments,
        {
          id: `interrupt-${Date.now()}`,
          title: interruption.title,
          startTime: interruption.startTime,
          endTime: minutesToTime(endMins),
          category: "meeting",
        },
      ];
    }

    return this.scheduleDay(copyInput);
  }
}
