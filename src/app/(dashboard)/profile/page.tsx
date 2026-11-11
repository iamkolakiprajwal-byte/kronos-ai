"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/context/demo-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  User,
  GraduationCap,
  Briefcase,
  Compass,
  Clock,
  ShieldCheck,
  Leaf,
  Bell,
  Sparkles,
  ArrowRight,
  Bike,
  Footprints,
  Tablet,
  Moon,
  Trees,
  CheckCircle2,
  Database,
  RotateCcw,
  Download,
  Upload,
  Check,
  AlertTriangle,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { calculateEcoImpact } from "@/lib/sustainability/eco-calculator";
import { getStorageDiagnostics } from "@/lib/storage";
import { AUTO_SYNC_INTERVAL_OPTIONS, AutoSyncInterval } from "@/types";

export default function ProfilePage() {
  const { user, connectGoogleCalendar } = useAuth();
  const {
    profile,
    role,
    setRole,
    ecoEntries,
    logEcoActivity,
    resetDemoData,
    exportData,
    importData,
    restoreBackup,
    tasks,
    habits,
    calendarEvents,
    focusSessions,
    syncStatus,
    lastSyncTime,
    lastSyncTimestampMs,
    autoSyncInterval,
    setAutoSyncInterval,
    triggerCalendarSync,
    disconnectCalendar,
  } = useDemo();

  const isGoogleSynced = syncStatus === "synced" || syncStatus === "syncing";
  const isGoogleError = syncStatus === "error";

  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const handleDisconnectCalendar = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectCalendar();
      setResetNotice("Google Calendar and Google Tasks disconnected.");
      setTimeout(() => setResetNotice(null), 3500);
    } catch (e) {
      console.warn("Failed to disconnect calendar:", e);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const [ecoNotice, setEcoNotice] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const ecoImpact = calculateEcoImpact(ecoEntries);
  const diagnostics = mounted
    ? getStorageDiagnostics()
    : { isAvailable: true, totalBytes: 0, lastSaved: null, itemCount: 0, hasCustomData: false, hasBackup: false };

  const handleQuickLog = (activity: any, minutes: number, label: string) => {
    logEcoActivity(activity, minutes);
    setEcoNotice(`Logged ${label}! Updated your sustainability score.`);
    setTimeout(() => setEcoNotice(null), 4000);
  };

  const handleConfirmReset = (targetRole?: any) => {
    resetDemoData(targetRole || role);
    setIsResetModalOpen(false);
    setResetNotice("Workspace data has been refreshed to a clean baseline state.");
    setTimeout(() => setResetNotice(null), 5000);
  };

  const handleExportBackup = () => {
    try {
      const json = exportData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kronos-backup-${role}-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportNotice("Backup file downloaded successfully!");
      setTimeout(() => setExportNotice(null), 4000);
    } catch {
      setExportNotice("Failed to export backup.");
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    setImportError(null);
    const success = importData(importJsonText.trim());
    if (success) {
      setIsImportOpen(false);
      setImportJsonText("");
      setResetNotice("Backup data restored successfully!");
      setTimeout(() => setResetNotice(null), 5000);
    } else {
      setImportError("Invalid Kronos backup JSON format. Please verify the file content.");
    }
  };

  const handleRestoreSafetyBackup = () => {
    if (!restoreBackup) return;
    const success = restoreBackup();
    if (success) {
      setResetNotice("Pre-migration safety backup restored successfully!");
      setTimeout(() => setResetNotice(null), 5000);
    } else {
      setResetNotice("No pre-migration safety backup found in storage.");
      setTimeout(() => setResetNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8 max-w-4xl animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="pb-3 sm:pb-4 border-b border-[#e6e3da]">
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          User Profile & Planning Preferences
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
          Customize your biological waking routine, academic/work constraints, and AI scheduling behavior.
        </p>
      </div>

      {/* Dynamic Feedback Banner */}
      {(resetNotice || exportNotice || ecoNotice) && (
        <div className="p-3.5 rounded-2xl bg-[#edf2ec] border border-[#d6e0d5] text-[#536b54] text-xs flex items-center justify-between gap-3 animate-in fade-in-50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#536b54]" />
            <span className="font-medium">{resetNotice || exportNotice || ecoNotice}</span>
          </div>
          <button
            onClick={() => {
              setResetNotice(null);
              setExportNotice(null);
              setEcoNotice(null);
            }}
            className="text-[10px] text-[#536b54] hover:underline font-semibold cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0"
          />
          <div className="min-w-0">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 truncate">{profile.name}</h2>
            <p className="text-xs text-slate-600 truncate">{profile.headline}</p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">{profile.institutionOrCompany}</p>
          </div>
        </div>

        <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-[#f0ede6] rounded-xl border border-[#e6e3da]">
          <button
            onClick={() => setRole("student")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
              role === "student" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Student</span>
          </button>
          <button
            onClick={() => setRole("professional")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
              role === "professional" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pro</span>
          </button>
          <button
            onClick={() => setRole("both")}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-all ${
              role === "both" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Both</span>
          </button>
        </div>
      </div>

      {/* Onboarding Wizard Action Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-slate-900">
              Interactive Setup & Timetable Wizard
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
              Re-run the guided onboarding flow to reconfigure your biological routine, semester classes, recurring meetings, or target goals.
            </p>
          </div>
        </div>

        <Link
          href="/onboarding"
          className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors"
        >
          <span>Launch Onboarding</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
        </Link>
      </div>

      {/* Routine & Biological Energy Parameters */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[#f0ede6]">
          <Clock className="w-4 h-4 text-slate-700" />
          <h3 className="font-serif text-base font-bold text-slate-900">
            Daily Biological Routine & Sleep Windows
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da]">
            <span className="text-[10px] sm:text-[11px] text-slate-500 block">Wake-up Time</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono mt-0.5 sm:mt-1 block">
              {profile.wakeTime} AM
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da]">
            <span className="text-[10px] sm:text-[11px] text-slate-500 block">Sleep Target</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono mt-0.5 sm:mt-1 block">
              {profile.sleepTime} PM
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da]">
            <span className="text-[10px] sm:text-[11px] text-slate-500 block">Peak Focus Window</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 capitalize mt-0.5 sm:mt-1 block truncate">
              {profile.mostProductivePeriod}
            </span>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da]">
            <span className="text-[10px] sm:text-[11px] text-slate-500 block">Focus Session</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 sm:mt-1 block">
              {profile.preferredFocusDuration} min
            </span>
          </div>
        </div>
      </div>

      {/* Environmental Sustainability Dashboard */}
      <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#f0ede6] gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <Leaf className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-base font-bold text-slate-900">
              Environmental Sustainability & Eco Routine
            </h3>
          </div>
          <span className="self-start sm:self-auto text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Eco Score: {ecoImpact.ecoScore}/100
          </span>
        </div>

        {ecoNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in-50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{ecoNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-center">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              CO₂ Saved
            </span>
            <span className="font-serif text-lg sm:text-xl font-bold text-emerald-700 mt-0.5 block">
              {ecoImpact.totalCo2SavedKg} kg
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-center">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Trees Equiv.
            </span>
            <span className="font-serif text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block flex items-center justify-center gap-1">
              <Trees className="w-4 h-4 text-emerald-600" />
              {ecoImpact.treesEquivalent}
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-center">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Active Commute
            </span>
            <span className="font-serif text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block">
              {ecoImpact.activeCommuteMinutes} min
            </span>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-center">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Paperless Study
            </span>
            <span className="font-serif text-lg sm:text-xl font-bold text-slate-900 mt-0.5 block">
              {ecoImpact.paperlessHours} hrs
            </span>
          </div>
        </div>

        {/* Quick Log Eco Actions */}
        <div className="pt-2 space-y-2">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Log Daily Eco Action:
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
            <button
              onClick={() => handleQuickLog("cycle_commute", 30, "30m Cycle Commute")}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#e6e3da] bg-[#faf9f6] hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 text-[11px] sm:text-xs transition-colors"
            >
              <Bike className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>30m Bicycle Commute</span>
            </button>
            <button
              onClick={() => handleQuickLog("walk_commute", 20, "20m Walking Commute")}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#e6e3da] bg-[#faf9f6] hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 text-[11px] sm:text-xs transition-colors"
            >
              <Footprints className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>20m Walking Commute</span>
            </button>
            <button
              onClick={() => handleQuickLog("paperless_study", 60, "1 hr Paperless Study")}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#e6e3da] bg-[#faf9f6] hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 text-[11px] sm:text-xs transition-colors"
            >
              <Tablet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>1 hr Paperless Notes</span>
            </button>
            <button
              onClick={() => handleQuickLog("screen_power_down", 60, "Evening Screen Power-Down")}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#e6e3da] bg-[#faf9f6] hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 text-[11px] sm:text-xs transition-colors"
            >
              <Moon className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Screen Power-Down</span>
            </button>
            <button
              onClick={() => handleQuickLog("plant_meal", 1, "Plant-Based Meal")}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#e6e3da] bg-[#faf9f6] hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 text-[11px] sm:text-xs transition-colors"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Plant-Based Meal</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI & Calendar Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendar Connection Info Card */}
        <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#536b54]" />
              <h3 className="font-serif text-sm font-bold text-[#201e1b]">
                Google Calendar Integration
              </h3>
            </div>
            <span
              className={cn(
                "text-[10px] font-mono px-2 py-0.5 rounded-full font-medium border",
                isGoogleSynced
                  ? syncStatus === "syncing"
                    ? "bg-[#edf2ec] text-[#536b54] border-[#d6e0d5]"
                    : "bg-[#edf2ec] text-[#536b54] border-[#d6e0d5]"
                  : isGoogleError
                  ? "bg-[#faece7] text-[#b85437] border-[#f3cec3]"
                  : "bg-[#f2eee6] text-[#8a8479] border-[#e8e2d5]"
              )}
            >
              {syncStatus === "syncing"
                ? "Syncing..."
                : isGoogleSynced
                ? "Live Connected"
                : isGoogleError
                ? "Permission Needed"
                : "Not Linked"}
            </span>
          </div>
          <p className="text-xs text-[#545049] leading-relaxed">
            {isGoogleSynced
              ? "Your Google account is linked via Google OAuth. External lectures, team syncs, and meetings are automatically pulled and protected as fixed commitments."
              : isGoogleError
              ? "Your current Google session lacks permission to access Google Calendar and Google Tasks. Click 'Authorize Calendar Access' below to grant permissions."
              : "Connect your Google account to enable two-way synchronization. Your meetings, classes, and appointments will be imported into Kronos to protect them during AI scheduling."}
          </p>

          <div className="pt-1">
            {isGoogleError ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl border border-[#f3cec3] bg-[#faece7]/40 text-xs text-[#b85437] space-y-2">
                  <p className="text-[11px] leading-relaxed">
                    Google Calendar requires explicit authorization to view calendars and tasks.
                  </p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await connectGoogleCalendar(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-[#b85437] hover:bg-[#9e452c] text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Authorize Calendar Access</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectCalendar}
                      disabled={isDisconnecting}
                      className="px-2.5 py-2 rounded-lg bg-white border border-[#f3cec3] hover:bg-stone-50 text-[#545049] text-xs font-medium transition-colors cursor-pointer"
                    >
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : isGoogleSynced ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[#faf7f0] border border-[#e8e2d5] text-[11px] text-[#545049]">
                  <span>Last synchronized: <strong>{lastSyncTime || "Just now"}</strong></span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await triggerCalendarSync();
                      }}
                      disabled={syncStatus === "syncing"}
                      className="px-3 py-1 rounded-lg bg-[#536b54] text-white hover:bg-[#3f5340] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-3 h-3", syncStatus === "syncing" && "animate-spin")} />
                      <span>{syncStatus === "syncing" ? "Syncing..." : "Sync Now"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await triggerCalendarSync(true);
                      }}
                      disabled={syncStatus === "syncing"}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#e8e2d5] hover:bg-stone-50 text-[#201e1b] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      title="Clear sync tokens and re-import all Google calendars, birthdays, and task lists"
                    >
                      <span>Reset & Re-sync</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectCalendar}
                      disabled={isDisconnecting}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#e8e2d5] hover:bg-red-50 hover:text-red-700 text-[#545049] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                      title="Disconnect Google Calendar and Google Tasks"
                    >
                      <span>{isDisconnecting ? "Disconnecting..." : "Disconnect"}</span>
                    </button>
                  </div>
                </div>

                {/* Background Auto-Sync Cadence Selector */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-[#fbf9f5] border border-[#e8e2d5] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 text-[#536b54]" />
                      <span className="font-semibold text-xs text-[#201e1b]">
                        Automatic Background Sync Cadence
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#edf2ec] text-[#536b54] border border-[#d6e0d5]">
                      {autoSyncInterval === "manual" ? "Manual Only" : `Every ${autoSyncInterval}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#545049] leading-relaxed">
                    Background synchronization runs silently on this schedule without user intervention.
                  </p>
                  <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    {AUTO_SYNC_INTERVAL_OPTIONS.map((opt) => {
                      const isSelected = autoSyncInterval === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAutoSyncInterval(opt.value)}
                          className={cn(
                            "py-1.5 px-1 text-[11px] rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[34px]",
                            isSelected
                              ? "bg-[#201e1b] text-white border-[#201e1b] shadow-xs font-semibold"
                              : "bg-white text-[#545049] border-[#e8e2d5] hover:border-[#b5ad9e] hover:bg-[#f2eee6]"
                          )}
                          title={opt.label}
                        >
                          <span className="font-medium">{opt.shortLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  await connectGoogleCalendar();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-[#e8decb]" />
                <span>Connect Google Calendar</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Engine Architecture Card */}
        <div className="bg-white rounded-2xl border border-[#e6e3da] p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#b37e2a]" />
              <h3 className="font-serif text-sm font-bold text-[#201e1b]">
                AI Cognitive Engine
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#edf2ec] text-[#536b54] font-medium border border-[#d6e0d5]">
              Active Engine
            </span>
          </div>
          <p className="text-xs text-[#545049] leading-relaxed">
            Local intelligent scheduling engine for instant response and private data processing. Deterministic priority scheduling, energy-level matching, and natural language understanding execute seamlessly in your workspace.
          </p>
          <div className="p-2.5 rounded-xl bg-[#faf7f0] border border-[#e8e2d5] text-[11px] text-[#545049]">
            ✓ Deterministic interval-scheduling engine places tasks around protected fixed commitments.
          </div>
        </div>
      </div>

      {/* Local Storage Persistence & Data Management Card */}
      <div className="bg-white rounded-2xl border border-[#e8e2d5] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#e8e2d5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shrink-0 shadow-2xs">
              <Database className="w-4 h-4 text-[#e8decb]" />
            </div>
            <div>
              <h3 className="font-serif text-sm sm:text-base font-semibold text-[#201e1b]">
                Workspace Data & Storage
              </h3>
              <p className="text-[11px] text-[#8a8479]">
                Your agenda, habits, and focus sessions are securely stored in your browser workspace with automatic backup protection and export capabilities.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#edf2ec] text-[#536b54] text-[10px] font-semibold border border-[#d6e0d5] self-start sm:self-auto">
            <Check className="w-3 h-3" />
            Storage Active
          </span>
        </div>

        {/* Safety Backup Alert if available */}
        {mounted && diagnostics.hasBackup && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-amber-900 leading-relaxed">
                <strong>Pre-Migration Backup Detected:</strong> An earlier version of your customized schedule is safely preserved in storage.
              </span>
            </div>
            <button
              onClick={handleRestoreSafetyBackup}
              className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
            >
              Restore Safety Backup
            </button>
          </div>
        )}

        {/* Diagnostics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#e8e2d5]">
            <span className="text-[10px] uppercase font-bold text-[#8a8479] block tracking-wider">
              Agenda Tasks
            </span>
            <span className="font-serif text-lg font-bold text-[#201e1b] mt-0.5 block">
              {tasks.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#e8e2d5]">
            <span className="text-[10px] uppercase font-bold text-[#8a8479] block tracking-wider">
              Active Habits
            </span>
            <span className="font-serif text-lg font-bold text-[#201e1b] mt-0.5 block">
              {habits.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#e8e2d5]">
            <span className="text-[10px] uppercase font-bold text-[#8a8479] block tracking-wider">
              Focus Logs
            </span>
            <span className="font-serif text-lg font-bold text-[#201e1b] mt-0.5 block">
              {focusSessions.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#fbf9f5] border border-[#e8e2d5]">
            <span className="text-[10px] uppercase font-bold text-[#8a8479] block tracking-wider">
              Last Saved
            </span>
            <span className="font-serif text-xs font-semibold text-[#545049] mt-1 block truncate">
              {diagnostics.lastSaved || "Just now"}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8e2d5] bg-white hover:bg-[#f2eee6] text-xs font-medium text-[#201e1b] shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#536b54]" />
              <span>Export State (JSON)</span>
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e8e2d5] bg-white hover:bg-[#f2eee6] text-xs font-medium text-[#201e1b] shadow-2xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#8a8479]" />
              <span>Import State</span>
            </button>
            {mounted && diagnostics.hasBackup && (
              <button
                onClick={handleRestoreSafetyBackup}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-medium text-amber-900 shadow-2xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>Restore Safety Backup</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setIsResetModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#fdf2ee] hover:bg-[#fae4dc] border border-[#f2cfc2] text-[#b85437] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Workspace Data</span>
          </button>
        </div>
      </div>

      {/* Workspace Clear Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#201e1b]/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-[#fbf9f5] rounded-3xl border border-[#e8e2d5] w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fdf2ee] border border-[#f2cfc2] flex items-center justify-center text-[#b85437] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-normal text-[#201e1b]">
                  Clear Local Workspace Data?
                </h3>
                <p className="text-xs text-[#545049] mt-1 leading-relaxed">
                  This will clear custom tasks, focus session reflections, and chat messages in your local browser cache and reset your workspace to a clean state.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8e2d5]">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#545049] hover:bg-[#f2eee6] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmReset()}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#ba4328] hover:bg-[#96341d] text-white transition-colors cursor-pointer"
              >
                Clear Local Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import JSON Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#201e1b]/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-[#fbf9f5] rounded-3xl border border-[#e8e2d5] w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d5]">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#536b54]" />
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#201e1b]">
                  Import Kronos Backup JSON
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsImportOpen(false);
                  setImportError(null);
                }}
                className="text-xs text-[#8a8479] hover:text-[#201e1b]"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-[#545049]">
              Paste exported Kronos JSON backup below to restore your exact tasks, habits, and focus history:
            </p>

            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              rows={8}
              placeholder="Paste JSON content here..."
              className="w-full p-3 rounded-2xl bg-white border border-[#e8e2d5] text-xs font-mono text-[#201e1b] focus:outline-hidden focus:ring-2 focus:ring-[#201e1b]/10 resize-none"
            />

            {importError && (
              <p className="text-xs text-[#b85437] font-medium">{importError}</p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsImportOpen(false);
                  setImportError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#545049] hover:bg-[#f2eee6] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={!importJsonText.trim()}
                className="px-4 py-2 rounded-xl bg-[#201e1b] hover:bg-[#38342f] disabled:opacity-40 text-white text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Restore Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
