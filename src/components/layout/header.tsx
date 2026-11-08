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
  GraduationCap,
  Briefcase,
  Compass,
  ChevronDown,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenQuickTask?: () => void;
  onToggleMobileNav?: () => void;
}

export function Header({ onOpenQuickTask, onToggleMobileNav }: HeaderProps) {
  const { user, signInWithGoogle, connectGoogleCalendar } = useAuth();
  const {
    profile,
    role,
    setRole,
    notifications,
    markNotificationRead,
    syncStatus,
    lastSyncTime,
    syncConflicts,
    triggerCalendarSync,
    resolveSyncConflict,
  } = useDemo();

  const isGoogleSynced = syncStatus === "synced" || syncStatus === "syncing";
  const isGoogleError = syncStatus === "error";
  const isGoogleSyncing = syncStatus === "syncing";

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
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
    <>
      <header className="border-b border-[#e8e2d5] bg-[#fbf9f5]/90 backdrop-blur-md sticky top-0 z-30 px-3.5 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Mobile Avatar & Desktop Greeting */}
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleMobileNav && (
            <button
              onClick={onToggleMobileNav}
              className="md:hidden w-9 h-9 min-w-[36px] min-h-[36px] rounded-full border border-[#d5cdbd] overflow-hidden flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all shadow-2xs hover:border-[#201e1b]"
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
            <span className="font-serif text-sm font-semibold text-[#201e1b] truncate block leading-none">
              {profile.name.split(" ")[0]}
            </span>
            <span className="text-[10px] text-[#8a8479] truncate block mt-0.5 leading-tight">
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

        {/* Right: Persona Dropdown, Sync & Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Persona Track Dropdown (Compact & Rarely Used) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowNotifications(false);
              }}
              className="h-9 px-2.5 sm:px-3 rounded-full border border-[#e8e2d5] bg-white hover:bg-[#f2eee6] text-[#201e1b] transition-all shadow-2xs cursor-pointer text-xs font-medium flex items-center gap-1.5"
              title="Switch Persona Track (Student / Pro / Dual)"
              aria-label="Switch Persona Track"
            >
              {role === "student" ? (
                <GraduationCap className="w-3.5 h-3.5 text-[#536b54]" />
              ) : role === "professional" ? (
                <Briefcase className="w-3.5 h-3.5 text-[#b85437]" />
              ) : (
                <Compass className="w-3.5 h-3.5 text-[#687050]" />
              )}
              <span className="font-semibold text-[11px] sm:text-xs capitalize">
                {role === "student" ? "Student" : role === "professional" ? "Pro" : "Dual"}
              </span>
              <ChevronDown className="w-3 h-3 text-[#8a8479]" />
            </button>

            {showRoleDropdown && (
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-auto sm:right-0 top-16 sm:top-full mt-1 sm:mt-2 w-auto sm:w-80 bg-[#fdfcf9] border border-[#e8e2d5] rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in-50 slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-[#e8e2d5]/60 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8a8479] block">
                    Select Persona Track
                  </span>
                  <p className="text-[11px] text-[#545049] mt-0.5">
                    Adapts workspace layout, schedule constraints & metrics
                  </p>
                </div>

                {/* Student Option */}
                <button
                  onClick={() => {
                    setRole("student");
                    setShowRoleDropdown(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer",
                    role === "student"
                      ? "bg-[#201e1b] text-[#f8f6f0] shadow-2xs"
                      : "hover:bg-[#f2eee6] text-[#201e1b]"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg mt-0.5 shrink-0", role === "student" ? "bg-white/10 text-white" : "bg-[#edf2ec] text-[#536b54]")}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">Student Track</span>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-mono", role === "student" ? "bg-white/20 text-white" : "bg-[#edf2ec] text-[#536b54]")}>Academic</span>
                    </div>
                    <p className={cn("text-[10px] mt-0.5 leading-snug", role === "student" ? "text-stone-300" : "text-[#8a8479]")}>
                      Course timetables, lectures, lab sessions, p-sets & semester exams.
                    </p>
                  </div>
                </button>

                {/* Pro Option */}
                <button
                  onClick={() => {
                    setRole("professional");
                    setShowRoleDropdown(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer",
                    role === "professional"
                      ? "bg-[#201e1b] text-[#f8f6f0] shadow-2xs"
                      : "hover:bg-[#f2eee6] text-[#201e1b]"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg mt-0.5 shrink-0", role === "professional" ? "bg-white/10 text-white" : "bg-[#faece7] text-[#b85437]")}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">Professional Track</span>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-mono", role === "professional" ? "bg-white/20 text-white" : "bg-[#faece7] text-[#b85437]")}>Career</span>
                    </div>
                    <p className={cn("text-[10px] mt-0.5 leading-snug", role === "professional" ? "text-stone-300" : "text-[#8a8479]")}>
                      Sprint deliverables, meeting triage, deep work blocks & architecture reviews.
                    </p>
                  </div>
                </button>

                {/* Dual Track Option */}
                <button
                  onClick={() => {
                    setRole("both");
                    setShowRoleDropdown(false);
                  }}
                  className={cn(
                    "w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer",
                    role === "both"
                      ? "bg-[#201e1b] text-[#f8f6f0] shadow-2xs"
                      : "hover:bg-[#f2eee6] text-[#201e1b]"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg mt-0.5 shrink-0", role === "both" ? "bg-white/10 text-white" : "bg-[#f1f3ea] text-[#687050]")}>
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold">Dual Track (Work + Study)</span>
                      <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-mono", role === "both" ? "bg-white/20 text-white" : "bg-[#f1f3ea] text-[#687050]")}>Hybrid</span>
                    </div>
                    <p className={cn("text-[10px] mt-0.5 leading-snug", role === "both" ? "text-stone-300" : "text-[#8a8479]")}>
                      Daytime professional responsibilities + evening coursework & degree balance.
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
          {/* Calendar Sync Button (Sleek circle on mobile, pill on desktop) */}
          <button
            onClick={() => setShowSyncModal(true)}
            className={cn(
              "h-9 px-2 sm:px-3 rounded-full text-xs font-medium border transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5",
              isGoogleSynced
                ? "bg-[#edf2ec] text-[#536b54] border-[#d6e0d5]"
                : isGoogleError
                ? "bg-[#faece7] text-[#b85437] border-[#f3cec3]"
                : "bg-white text-[#545049] border-[#e8e2d5] hover:bg-[#f2eee6] hover:text-[#201e1b]"
            )}
            title="Google Calendar Integration Status"
            aria-label="Google Calendar Integration Status"
          >
            <Calendar
              className={cn(
                "w-3.5 h-3.5 shrink-0",
                isGoogleSynced
                  ? "text-[#536b54]"
                  : isGoogleError
                  ? "text-[#b85437]"
                  : "text-[#8a8479]"
              )}
            />
            <span className="hidden md:inline text-[11px]">
              {isGoogleSyncing
                ? "Google Calendar: Syncing..."
                : isGoogleSynced
                ? "Google Calendar: Synced"
                : isGoogleError
                ? "Google Calendar: Permission Needed"
                : "Connect Google Calendar"}
            </span>
          </button>

          {/* Optional Desktop Quick Task Button (Mobile uses Google Keep style FAB) */}
          {onOpenQuickTask && (
            <button
              onClick={onOpenQuickTask}
              className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3.5 bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] rounded-full text-xs font-medium shadow-2xs transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#e8decb]" />
              <span>New Task</span>
            </button>
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-full border border-[#e8e2d5] bg-white hover:bg-[#f2eee6] text-[#545049] hover:text-[#201e1b] flex items-center justify-center relative transition-colors shadow-2xs cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                <Calendar className="w-4 h-4 text-[#687050]" />
                <h3 className="font-serif text-lg text-[#201e1b]">
                  Google Calendar Two-Way Integration
                </h3>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="p-1 rounded-md text-[#8a8479] hover:text-[#201e1b] hover:bg-[#f2eee6]"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Live Integration Notice */}
            <div className="p-3.5 rounded-xl bg-[#fbf9f5] border border-[#e8e2d5] text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#545049] font-medium">Integration Status:</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                    isGoogleSynced
                      ? "bg-[#edf2ec] text-[#536b54]"
                      : isGoogleError
                      ? "bg-[#faece7] text-[#b85437]"
                      : "bg-[#f2eee6] text-[#8a8479]"
                  )}
                >
                  {isGoogleSyncing
                    ? "Syncing..."
                    : isGoogleSynced
                    ? "Synced & Active"
                    : isGoogleError
                    ? "Permission Required"
                    : "Not Linked"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#545049] font-medium">Authenticated Account:</span>
                <span className="text-[#201e1b] font-mono text-[11px] truncate max-w-[200px]">
                  {user?.email || "No Google Account Linked"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#545049] font-medium">Active Schedule Conflicts:</span>
                <span className={cn("font-bold", syncConflicts.length > 0 ? "text-[#b85437]" : "text-[#536b54]")}>
                  {syncConflicts.length > 0 ? `${syncConflicts.length} Conflict Requiring Action` : "0 (Synchronized)"}
                </span>
              </div>
            </div>

            {/* When Permissions Error / Reconnect Needed */}
            {isGoogleError ? (
              <div className="p-4 rounded-xl border border-[#f3cec3] bg-[#faece7]/50 space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#b85437] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#b85437] text-xs">
                      Calendar Permissions Required
                    </h4>
                    <p className="text-[#545049] text-[11px] mt-1 leading-relaxed">
                      Your current Google session does not have permission to access your Google Calendar and Google Tasks. Please click the button below to grant permission on Google&apos;s consent screen.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      await connectGoogleCalendar();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#b85437] hover:bg-[#9e452c] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Authorize Calendar Access</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch("/api/calendar/sync", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "disconnect" }),
                        });
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("kronos_google_provider_token");
                        }
                        setShowSyncModal(false);
                      } catch (e) {
                        console.warn("Failed to disconnect calendar:", e);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-white border border-[#f3cec3] hover:bg-stone-50 text-[#545049] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : !isGoogleSynced ? (
              <div className="p-4 rounded-xl border border-[#e8e2d5] bg-stone-50 space-y-3 text-xs">
                <p className="text-[#545049] leading-relaxed">
                  Kronos AI synchronizes two-way with your Google Calendar and Google Tasks. External meetings, lectures, and invites are automatically mapped into your schedule as fixed, immovable commitments.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await connectGoogleCalendar();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Connect Google Calendar Account</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#edf2ec] border border-[#d6e0d5] text-xs text-[#536b54] space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#536b54]" />
                  <span>Google Calendar Connected & Synchronized</span>
                </div>
                <p className="text-[11px] text-[#536b54]/90">
                  Your agenda and external calendar events are in two-way synchronization.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#d6e0d5]/60">
                  <span className="text-[11px] text-[#536b54]">
                    Last synced: {lastSyncTime || "Just now"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await triggerCalendarSync();
                      }}
                      disabled={syncStatus === "syncing"}
                      className="px-3 py-1.5 rounded-lg bg-[#536b54] text-white hover:bg-[#3f5340] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", syncStatus === "syncing" && "animate-spin")} />
                      <span>{syncStatus === "syncing" ? "Syncing..." : "Sync Now"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await fetch("/api/calendar/sync", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "disconnect" }),
                          });
                          if (typeof window !== "undefined") {
                            localStorage.removeItem("kronos_google_provider_token");
                          }
                          setShowSyncModal(false);
                        } catch (e) {
                          console.warn("Failed to disconnect calendar:", e);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#d6e0d5] hover:bg-red-50 hover:text-red-700 text-[#545049] text-xs font-medium transition-colors cursor-pointer"
                    >
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Conflict Resolution Block if any real conflicts exist */}
            {syncConflicts.length > 0 && (
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
            )}

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
  </>
  );
}
