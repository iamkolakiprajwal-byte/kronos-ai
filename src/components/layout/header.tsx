"use client";

import React, { useState } from "react";
import {
  Bell,
  Plus,
  Calendar,
  Sparkles,
  Check,
  X,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
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
    <header className="border-b border-[#e6e3da] bg-[#fdfcf9]/80 backdrop-blur-md sticky top-0 z-30 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between">
      {/* Left: Greeting & Current Date */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleMobileNav && (
          <button
            onClick={onToggleMobileNav}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate">
              {greeting}, {profile.name.split(" ")[0]}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI Scheduled
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5 sm:gap-2 mt-0.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{todayFormatted}</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-600 font-medium hidden sm:inline truncate">{profile.institutionOrCompany}</span>
          </p>
        </div>
      </div>

      {/* Right: Actions, Notifications, & Quick Task */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Calendar Sync Pill */}
        <button
          onClick={() => setShowSyncModal(true)}
          className={cn(
            "flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-xs",
            syncStatus === "conflict"
              ? "bg-amber-100 text-amber-900 border-amber-300 animate-bounce"
              : syncStatus === "syncing"
              ? "bg-sky-50 text-sky-800 border-sky-200"
              : "bg-white text-slate-700 border-[#e6e3da] hover:bg-slate-50"
          )}
          title="Click to view Google Calendar sync status"
        >
          {syncStatus === "conflict" ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-amber-900">1 Conflict</span>
            </>
          ) : (
            <>
              <RefreshCw
                className={cn(
                  "w-3.5 h-3.5 text-slate-500 shrink-0",
                  syncStatus === "syncing" && "animate-spin text-sky-600"
                )}
              />
              <span className="hidden sm:inline">GCal: {syncStatus === "syncing" ? "Syncing..." : "Synced"}</span>
            </>
          )}
        </button>

        {/* Quick Task Button */}
        {onOpenQuickTask && (
          <>
            <button
              onClick={onOpenQuickTask}
              className="sm:hidden w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-xs transition-all active:scale-95"
              aria-label="Add new task"
            >
              <Plus className="w-4 h-4 text-amber-300" />
            </button>
            <button
              onClick={onOpenQuickTask}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>New Task</span>
            </button>
          </>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#e6e3da] bg-white hover:bg-[#f5f3ec] text-slate-700 flex items-center justify-center relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-full mt-1 sm:mt-2 w-auto sm:w-96 bg-white border border-[#e6e3da] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
              <div className="p-3.5 border-b border-[#e6e3da] bg-[#fbfaf7] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                  <p className="text-[11px] text-slate-500">Smart reminders & scheduling alerts</p>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#f0ede6]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications right now.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        "p-3.5 text-xs cursor-pointer transition-colors hover:bg-[#fbfaf7]",
                        !n.read ? "bg-amber-50/40" : ""
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo Mode Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200/80 bg-amber-50 text-[11px] font-medium text-amber-900">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Evaluation Mode</span>
        </div>
      </div>

      {/* Calendar Synchronization & Conflict Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border-t sm:border border-[#e6e3da] w-full sm:max-w-lg p-5 sm:p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e3da]">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-800" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                  Google Calendar Two-Way Sync
                </h3>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Sync Status Banner */}
            <div className="p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Adapter Protocol:</span>
                <span className="font-mono text-slate-900 font-semibold">
                  Google Calendar API v3 (Evaluation Mode)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Last Synchronized:</span>
                <span className="text-slate-800">{lastSyncTime || "Just now"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Active Conflicts:</span>
                <span
                  className={cn(
                    "font-bold",
                    syncConflicts.length > 0 ? "text-amber-700" : "text-emerald-700"
                  )}
                >
                  {syncConflicts.length > 0 ? `${syncConflicts.length} Conflict Requiring Action` : "0 (Clean)"}
                </span>
              </div>
            </div>

            {/* Active Conflicts Resolution UI */}
            {syncConflicts.length > 0 ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  External Schedule Shift Detected
                </span>

                {syncConflicts.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-amber-50/60 border border-amber-300 text-xs space-y-3"
                  >
                    <div>
                      <h4 className="font-semibold text-amber-950 text-sm">{c.eventTitle}</h4>
                      <p className="text-amber-900/80 mt-1">{c.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-white border border-amber-200 text-[11px]">
                      <div>
                        <span className="text-slate-400 block font-medium">Local Kronos Block:</span>
                        <span className="font-semibold text-slate-800">{c.localTime}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Remote Google Event:</span>
                        <span className="font-semibold text-amber-900">{c.remoteTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => resolveSyncConflict(c.id, "keep_local")}
                        className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-slate-800 font-medium hover:bg-slate-50 transition-all text-xs"
                      >
                        Keep Local Focus Block
                      </button>
                      <button
                        onClick={() => resolveSyncConflict(c.id, "accept_remote")}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all text-xs"
                      >
                        Accept Remote Shift (Reschedule Block)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-slate-500">
                All local commitments and remote calendar entries are currently in perfect alignment.
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#e6e3da]">
              <button
                onClick={() => simulateExternalCalendarConflict()}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-semibold transition-all"
                title="Generates a simulated remote meeting collision to demonstrate two-way conflict handling"
              >
                Simulate Remote GCal Change (Demo)
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    await triggerCalendarSync();
                  }}
                  disabled={syncStatus === "syncing"}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn("w-3.5 h-3.5", syncStatus === "syncing" && "animate-spin")}
                  />
                  <span>{syncStatus === "syncing" ? "Syncing..." : "Sync Now"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
