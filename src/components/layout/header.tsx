"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Plus,
  Calendar,
  Sparkles,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Menu,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenQuickTask?: () => void;
  onToggleMobileNav?: () => void;
}

export function Header({ onOpenQuickTask, onToggleMobileNav }: HeaderProps) {
  const {
    profile,
    notifications,
    markNotificationRead,
    syncStatus,
    lastSyncTime,
    syncConflicts,
    triggerCalendarSync,
    simulateExternalCalendarConflict,
    resolveSyncConflict,
  } = useDemo();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");
  const [todayFormatted, setTodayFormatted] = useState("Monday, Nov 2, 2026");

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const formatted = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
    setTodayFormatted(formatted);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="border-b border-[#e8e2d5] bg-[#fbf9f5]/85 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between">
      {/* Left: Mobile Avatar & Desktop Greeting */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {onToggleMobileNav && (
          <button
            onClick={onToggleMobileNav}
            className="md:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[#d5cdbd] overflow-hidden flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all shadow-2xs hover:border-[#201e1b]"
            aria-label="Open profile and settings"
            title="Profile & Settings"
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-xs font-semibold text-[#201e1b]">
                {profile.name.split(" ").map((n) => n[0]).join("")}
              </span>
            )}
          </button>
        )}

        {/* Mobile Header Title */}
        <div className="md:hidden min-w-0">
          <span className="font-serif text-sm font-semibold text-[#201e1b] truncate block leading-tight">
            {profile.name.split(" ")[0]}
          </span>
          <span className="text-[10px] text-[#8a8479] truncate block leading-tight">
            {todayFormatted.split(",")[0]}, {todayFormatted.split(",")[1]}
          </span>
        </div>

        {/* Desktop Greeting & Date Briefing */}
        <div className="hidden md:block min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-normal text-[#201e1b] tracking-tight truncate">
              {greeting}, {profile.name.split(" ")[0]}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-sans font-medium text-[#536b54] bg-[#edf2ec] border border-[#d6e0d5] px-2.5 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#536b54] animate-pulse" />
              AI Scheduled
            </span>
          </div>
          <p className="text-xs text-[#8a8479] flex items-center gap-2 mt-0.5 truncate">
            <span className="truncate">{todayFormatted}</span>
            <span className="text-[#d5cdbd]">•</span>
            <span className="text-[#545049] font-medium truncate">
              {profile.institutionOrCompany}
            </span>
          </p>
        </div>
      </div>

      {/* Right: Actions, Notifications, & Quick Task */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Calendar Sync Pill */}
        <button
          onClick={() => setShowSyncModal(true)}
          className={cn(
            "flex items-center justify-center gap-1.5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-[36px] px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer shadow-2xs",
            syncStatus === "conflict"
              ? "bg-[#faece7] text-[#b85437] border-[#f3cec3] animate-bounce"
              : syncStatus === "syncing"
              ? "bg-[#f1f3ea] text-[#687050] border-[#dce1d4]"
              : "bg-white text-[#545049] border-[#e8e2d5] hover:bg-[#f2eee6] hover:text-[#201e1b]"
          )}
          title="Click to view Google Calendar sync status"
        >
          {syncStatus === "conflict" ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-[#b85437] shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-[#b85437]">1 Conflict</span>
            </>
          ) : (
            <>
              <RefreshCw
                className={cn(
                  "w-3.5 h-3.5 text-[#8a8479] shrink-0",
                  syncStatus === "syncing" && "animate-spin text-[#687050]"
                )}
              />
              <span className="hidden sm:inline">
                Demo GCal: {syncStatus === "syncing" ? "Syncing..." : "Synced"}
              </span>
            </>
          )}
        </button>

        {/* Quick Task Button */}
        {onOpenQuickTask && (
          <>
            <button
              onClick={onOpenQuickTask}
              className="sm:hidden w-11 h-11 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-white flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
              aria-label="Add new task"
            >
              <Plus className="w-4 h-4 text-[#e8decb]" />
            </button>
            <button
              onClick={onOpenQuickTask}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] rounded-xl text-xs font-medium shadow-2xs transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#e8decb]" />
              <span>New Task</span>
            </button>
          </>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl border border-[#e8e2d5] bg-white hover:bg-[#f2eee6] text-[#545049] hover:text-[#201e1b] flex items-center justify-center relative transition-colors shadow-2xs cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#b85437] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-full mt-1 sm:mt-2 w-auto sm:w-96 bg-white border border-[#e8e2d5] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
              <div className="p-3.5 border-b border-[#e8e2d5] bg-[#fbf9f5] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-[#201e1b]">Notifications</h3>
                  <p className="text-[11px] text-[#8a8479]">Smart reminders & scheduling alerts</p>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-md text-[#8a8479] hover:text-[#201e1b] hover:bg-[#f2eee6]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#f2eee6]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#8a8479]">
                    No notifications at this moment.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markNotificationRead(item.id)}
                      className={cn(
                        "p-3.5 hover:bg-[#fbf9f5] transition-colors cursor-pointer flex items-start gap-2.5",
                        !item.read && "bg-[#faf7f0]/60"
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0",
                          item.read
                            ? "bg-transparent"
                            : item.type === "calendar"
                            ? "bg-[#b85437]"
                            : "bg-[#536b54]"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-[#201e1b] truncate">
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-[#8a8479] shrink-0">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#545049] mt-0.5 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Google Calendar Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#201e1b]/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border-t sm:border border-[#e8e2d5] w-full sm:max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d5]">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#687050]" />
                <h3 className="font-serif text-lg text-[#201e1b]">
                  Google Calendar Two-Way Sync (Simulated Demo)
                </h3>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="p-1 rounded-md text-[#8a8479] hover:text-[#201e1b] hover:bg-[#f2eee6]"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Simulated Demo Notice */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
              <strong>Zero-Cost Demo Mode:</strong> Powered by <code className="font-mono bg-white/70 px-1 py-0.5 rounded">MockCalendarAdapter</code>. No personal Google credentials or OAuth tokens are required. Remote events and schedule conflicts are simulated locally for review.
            </div>

            {/* Sync Status Banner */}
            <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-[#e8e2d5] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#545049] font-medium">Adapter Protocol:</span>
                <span className="font-mono text-[#201e1b] font-semibold">
                  MockCalendarAdapter (Simulated API v3)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#545049] font-medium">Last Synchronized:</span>
                <span className="text-[#201e1b]">{lastSyncTime || "Just now"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#545049] font-medium">Active Conflicts:</span>
                <span
                  className={cn(
                    "font-bold",
                    syncConflicts.length > 0 ? "text-[#b85437]" : "text-[#536b54]"
                  )}
                >
                  {syncConflicts.length > 0
                    ? `${syncConflicts.length} Conflict Requiring Action`
                    : "0 (Clean)"}
                </span>
              </div>
            </div>

            {/* Conflict Resolution Block */}
            {syncConflicts.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#201e1b] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#b85437]" />
                  <span>External Schedule Conflict Detected</span>
                </h4>
                {syncConflicts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-[#f3cec3] bg-[#faece7]/40 space-y-2 text-xs"
                  >
                    <div className="font-semibold text-[#b85437]">{c.description}</div>
                    <p className="text-[11px] text-[#545049] leading-relaxed">
                      Google Calendar scheduled{" "}
                      <strong className="text-[#201e1b]">"{c.eventTitle}"</strong> (Remote: {c.remoteTime}, Local: {c.localTime}).
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => resolveSyncConflict(c.id, "accept_remote")}
                        className="px-3 py-1.5 rounded-lg bg-[#201e1b] text-white hover:bg-[#38342f] text-xs font-medium transition-colors cursor-pointer"
                      >
                        Accept Remote Event
                      </button>
                      <button
                        onClick={() => resolveSyncConflict(c.id, "keep_local")}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#e8e2d5] text-[#545049] hover:bg-[#f2eee6] text-xs font-medium transition-colors cursor-pointer"
                      >
                        Keep Local Focus Block
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#edf2ec] border border-[#d6e0d5] text-xs text-[#536b54] space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#536b54]" />
                  <span>Calendar State Perfectly Harmonized</span>
                </div>
                <p className="text-[11px] text-[#536b54]/90">
                  All local agenda blocks and remote events align without time collisions.
                </p>
              </div>
            )}

            {/* Test Actions */}
            <div className="pt-2 border-t border-[#e8e2d5] space-y-2">
              <span className="text-[10px] font-semibold text-[#8a8479] uppercase tracking-wider block">
                Evaluation Test Controls:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={triggerCalendarSync}
                  className="px-3 py-1.5 rounded-lg bg-[#f2eee6] hover:bg-[#e8e2d5] text-[#201e1b] text-xs font-medium transition-colors cursor-pointer"
                >
                  Trigger Incremental Sync
                </button>
                <button
                  type="button"
                  onClick={simulateExternalCalendarConflict}
                  className="px-3 py-1.5 rounded-lg bg-[#faece7] hover:bg-[#f6dfd7] text-[#b85437] text-xs font-medium transition-colors cursor-pointer"
                >
                  Simulate GCal Surprise Conflict
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#e8e2d5]">
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="px-4 py-2 rounded-xl bg-[#201e1b] text-white font-medium text-xs hover:bg-[#38342f] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
