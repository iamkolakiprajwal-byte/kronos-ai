"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function HabitsPage() {
  const { habits, toggleHabit, profile } = useDemo();

  // Focus Timer state (Flow Theory)
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [flowRating, setFlowRating] = useState<number | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && timerRunning) {
      setTimerRunning(false);
      setSessionCompleted(true);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  const resetTimer = (mins: number) => {
    setTimerRunning(false);
    setFocusMinutes(mins);
    setSecondsLeft(mins * 60);
    setSessionCompleted(false);
    setFlowRating(null);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-[#e6e3da]">
        <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
          Habit Formation & Flow Focus
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Rooted in behavioral science: Cues, context-dependent automaticity, and distraction-free focus blocks.
        </p>
      </div>

      {/* Flow Focus Session Section */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5" />
              Flow Theory Session
            </span>
            <h2 className="font-serif text-2xl font-bold">Deep Concentration Interval</h2>
            <p className="text-xs text-slate-300 max-w-md">
              Single-task immersion. Minimize tab context-switching to protect cognitive flow.
            </p>
          </div>

          {/* Timer Display & Controls */}
          <div className="flex flex-col items-center gap-4">
            <div className="font-mono text-5xl font-bold text-amber-200 tracking-widest">
              {formatTimer(secondsLeft)}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{timerRunning ? "Pause" : "Start Focus"}</span>
              </button>

              <button
                onClick={() => resetTimer(focusMinutes)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 text-xs">
              {[20, 25, 45, 50].map((dur) => (
                <button
                  key={dur}
                  onClick={() => resetTimer(dur)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                    focusMinutes === dur && !timerRunning
                      ? "bg-amber-300/20 text-amber-200 border border-amber-300/40"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {dur}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reflection Prompt on Complete */}
        {sessionCompleted && (
          <div className="mt-6 pt-6 border-t border-slate-800 text-center animate-in fade-in-50">
            <p className="text-xs text-amber-200 font-medium mb-3">
              Session completed! How deeply engaged and focused did you feel?
            </p>
            <div className="flex justify-center gap-2">
              {["1 (Distracted)", "2 (Moderate)", "3 (High Flow)", "4 (Effortless Flow)"].map(
                (label, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFlowRating(idx + 1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      flowRating === idx + 1
                        ? "bg-amber-300 text-slate-950 font-bold"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Habits Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Daily Behavioral Habits & Automaticity
        </h2>

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
                  Measured by consistent repetition in identical contexts, without streak guilt.
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
