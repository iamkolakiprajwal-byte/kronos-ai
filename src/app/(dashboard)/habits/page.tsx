"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDemo } from "@/context/demo-context";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Compass,
  Check,
  Brain,
  Leaf,
  Clock,
  History,
  MessageSquare,
  ShieldAlert,
  Zap,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { FocusSessionLog } from "@/types";

export default function HabitsPage() {
  const {
    habits,
    toggleHabit,
    profile,
    focusSessions,
    logFocusSession,
    logEcoActivity,
  } = useDemo();

  // Focus Timer state (Flow Theory)
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string>("");

  // Post-session reflection state
  const [flowState, setFlowState] = useState<FocusSessionLog["flowState"]>("flow");
  const [reflectionNotes, setReflectionNotes] = useState("");
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [logSuccessNotice, setLogSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      setSessionCompleted(true);
      setShowReflectionModal(true);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  const resetTimer = (mins: number) => {
    setTimerRunning(false);
    setFocusMinutes(mins);
    setSecondsLeft(mins * 60);
    setSessionCompleted(false);
    setShowReflectionModal(false);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinishEarly = () => {
    setTimerRunning(false);
    setSessionCompleted(true);
    setShowReflectionModal(true);
  };

  const handleSaveReflection = () => {
    const duration = Math.max(1, Math.round((focusMinutes * 60 - secondsLeft) / 60) || focusMinutes);
    logFocusSession(
      selectedHabitId || null,
      duration,
      flowState,
      reflectionNotes.trim() || undefined
    );

    setShowReflectionModal(false);
    setSessionCompleted(false);
    resetTimer(focusMinutes);
    setLogSuccessNotice(`Recorded ${duration}m ${flowState.toUpperCase()} focus session!`);
    setTimeout(() => setLogSuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Growth Workspace Upgrade Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Habits and Flow have been integrated into the comprehensive <strong>Growth</strong> workspace with the Habit Discontinuity Hypothesis, 2-minute activations, and cross-domain insights.
          </span>
        </div>
        <Link
          href="/growth"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shrink-0 shadow-2xs"
        >
          <span>Open Growth Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {/* Header */}
      <div className="pb-3 sm:pb-4 border-b border-[#e6e3da] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 sm:p-1.5 rounded-lg bg-emerald-100 text-emerald-900 shrink-0">
              <Brain className="w-4 h-4" />
            </span>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Habits & Flow Theory Focus
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
            Rooted in behavioral science: Context cues, automaticity tracking without streak shame, and immersion timers.
          </p>
        </div>
      </div>

      {logSuccessNotice && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{logSuccessNotice}</span>
        </div>
      )}

      {/* Flow Focus Session Section */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 sm:space-y-3 text-center md:text-left w-full md:w-auto">
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Csíkszentmihályi Flow Interval
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">Deep Concentration Block</h2>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed mx-auto md:mx-0">
              Single-task immersion. Balance cognitive challenge with your current capability to induce optimal flow.
            </p>

            {/* Target Habit Linkage */}
            <div className="pt-1">
              <label className="text-[10px] sm:text-[11px] text-slate-400 block mb-1">
                Link to habit (optional):
              </label>
              <select
                value={selectedHabitId}
                onChange={(e) => setSelectedHabitId(e.target.value)}
                className="bg-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none w-full sm:w-auto max-w-full"
              >
                <option value="">No specific habit (General Focus)</option>
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timer Display & Controls */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full md:w-auto">
            <div className="font-mono text-4xl sm:text-5xl font-bold text-amber-200 tracking-widest">
              {formatTimer(secondsLeft)}
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{timerRunning ? "Pause" : "Start Focus"}</span>
              </button>

              <button
                onClick={() => resetTimer(focusMinutes)}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {timerRunning && (
                <button
                  onClick={handleFinishEarly}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-medium transition-colors"
                >
                  Done Early
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs flex-wrap justify-center">
              {[20, 25, 45, 50, 90].map((dur) => (
                <button
                  key={dur}
                  onClick={() => resetTimer(dur)}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-mono transition-colors ${
                    focusMinutes === dur && !timerRunning
                      ? "bg-amber-300/20 text-amber-200 border border-amber-300/40 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {dur}m
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Post-Session Reflection Modal (Bottom Sheet on Mobile) */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border-t sm:border border-[#e6e3da] w-full sm:max-w-md p-5 sm:p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="pb-3 border-b border-[#e6e3da]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Flow Theory Check-In
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 mt-1">
                How Was Your Immersion State?
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                Reflecting on challenge vs. skill balance builds sustainable deep work habits.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-slate-700 font-semibold text-xs">Select Flow State:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: "flow",
                    label: "Flow State",
                    sub: "Balanced challenge & skill, absorbed attention",
                    color: "border-emerald-500 bg-emerald-50/50 text-emerald-950",
                  },
                  {
                    id: "balanced",
                    label: "Steady Progress",
                    sub: "Comfortable pace, slight distraction",
                    color: "border-sky-500 bg-sky-50/50 text-sky-950",
                  },
                  {
                    id: "boredom",
                    label: "Under-Challenged",
                    sub: "Task lacked interest or novelty",
                    color: "border-amber-500 bg-amber-50/50 text-amber-950",
                  },
                  {
                    id: "anxiety",
                    label: "Over-Challenged",
                    sub: "Task felt overwhelming or frustrating",
                    color: "border-rose-500 bg-rose-50/50 text-rose-950",
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFlowState(item.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      flowState === item.id
                        ? `${item.color} font-bold ring-1 ring-slate-900`
                        : "border-[#e6e3da] bg-[#faf9f6] text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-medium text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Reflection Note (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Cleared 3 hard proofs. Phone in do-not-disturb was key..."
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6e3da]">
                <button
                  type="button"
                  onClick={() => setShowReflectionModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-xs"
                >
                  Save Reflection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Habits Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Daily Behavioral Habits & Automaticity
          </h2>
          <span className="text-[11px] text-slate-400">
            {habits.filter((h) => h.completedToday).length} of {habits.length} completed today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className={`p-5 rounded-2xl border transition-all ${
                habit.completedToday
                  ? "bg-white border-emerald-300/80 shadow-xs"
                  : "bg-white border-[#e6e3da]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {habit.completedToday ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        habit.completedToday ? "text-slate-900" : "text-slate-800"
                      }`}
                    >
                      {habit.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">Anchor Cue:</span> "{habit.cue}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{habit.currentStreak}d</span>
                </div>
              </div>

              {/* Automaticity Score Bar */}
              <div className="mt-4 pt-3 border-t border-[#f0ede6] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Habit Automaticity Index</span>
                  <span className="font-semibold text-slate-800">{habit.automaticityScore}%</span>
                </div>
                <div className="w-full bg-[#f0ede6] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${habit.automaticityScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Measured by contextual repetition consistency, without punitive streak resets.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus Session Log History */}
      <div className="space-y-4 pt-4 border-t border-[#e6e3da]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Recent Flow Sessions & Reflections ({focusSessions.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {focusSessions.map((session) => (
            <div
              key={session.id}
              className="p-3.5 rounded-xl bg-white border border-[#e6e3da] text-xs space-y-2 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  {session.durationMinutes} Minutes Focus
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    session.flowState === "flow"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : session.flowState === "balanced"
                      ? "bg-sky-50 text-sky-800 border-sky-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {session.flowState}
                </span>
              </div>

              {session.reflectionNotes && (
                <p className="text-slate-600 text-[11px] italic bg-[#faf9f6] p-2 rounded-lg border border-[#e6e3da]/60">
                  "{session.reflectionNotes}"
                </p>
              )}

              <div className="text-[10px] text-slate-400 text-right">
                {session.completedAt}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
