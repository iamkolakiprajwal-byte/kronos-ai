"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  CalendarCheck,
  Check,
  Clock,
  Mic,
  MicOff,
  Volume2,
  X,
  ArrowRight,
  ShieldCheck,
  Zap,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

const studentPrompts = [
  {
    title: "Morning Study & Exercise",
    prompt: "I need to complete two assignments, review lecture notes for 1 hour, and go for a run at 5 PM.",
  },
  {
    title: "Exam Preparation",
    prompt: "Schedule 90 minutes of focused problem solving before my afternoon class.",
  },
  {
    title: "Multi-Day Exam Plan",
    prompt: "Break down my upcoming exam review over the next 3 days.",
  },
  {
    title: "Build Reading Habit",
    prompt: "Help me build a consistent 20-minute academic reading habit every morning.",
  },
  {
    title: "Break Down Project",
    prompt: "Can you break down my semester project into an actionable, phased roadmap?",
  },
  {
    title: "Mid-Day Catchup",
    prompt: "I missed my morning study block. Reorganize the rest of today realistically around my remaining commitments.",
  },
];

const proPrompts = [
  {
    title: "Protect 2h Deep Work",
    prompt: "Protect a 2-hour uninterrupted deep focus block this morning for technical design.",
  },
  {
    title: "Meeting Reschedule",
    prompt: "I have an unexpected 4 PM stakeholder sync. Please reschedule my afternoon work blocks.",
  },
  {
    title: "Sprint Review Prep",
    prompt: "Find a 45-minute window before 5 PM to compile deliverables for tomorrow's review.",
  },
  {
    title: "Code Review Window",
    prompt: "Schedule a 60-minute focused window to review high-priority pull requests.",
  },
  {
    title: "Evening Boundary",
    prompt: "Ensure all my tasks conclude before 6:00 PM so I can disconnect cleanly.",
  },
  {
    title: "Project Breakdown",
    prompt: "Decompose our architectural migration initiative into 3 actionable milestones.",
  },
];

const dualPrompts = [
  {
    title: "Work & Evening Class",
    prompt: "I have a morning team sync and an evening seminar. Fit 1 hour of coursework study between them.",
  },
  {
    title: "Resolve Schedule Collision",
    prompt: "Check if my late meeting collides with my evening study commitments.",
  },
  {
    title: "High-Focus Study Window",
    prompt: "Find a 45-minute high-focus window for my coursework research after finishing my work shift.",
  },
  {
    title: "Weekend Study Plan",
    prompt: "Structure a realistic Saturday study plan to review coursework without burning out.",
  },
  {
    title: "Context Switch Buffer",
    prompt: "Add a 15-minute mental buffer between my afternoon work tasks and evening study.",
  },
  {
    title: "Evening Shutdown",
    prompt: "Schedule an evening wind-down transition block after finishing my studies.",
  },
];

export default function AIPage() {
  const {
    chatMessages,
    sendChatMessage,
    isAiThinking,
    applySuggestedTasks,
    applySuggestedHabit,
    applySuggestedGoal,
    role,
    profile,
    openQuickTask,
  } = useDemo();

  const [inputVal, setInputVal] = useState("");
  const [appliedMessageIds, setAppliedMessageIds] = useState<Record<string, boolean>>({});
  const [appliedHabitIds, setAppliedHabitIds] = useState<Record<string, boolean>>({});
  const [appliedGoalIds, setAppliedGoalIds] = useState<Record<string, boolean>>({});
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState("");
  const [aiStatus, setAiStatus] = useState<"checking" | "connected" | "configuration_required">("checking");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/ai/chat")
      .then((res) => res.json())
      .then((data) => {
        setAiStatus(data.configured ? "connected" : "configuration_required");
      })
      .catch(() => {
        setAiStatus("configuration_required");
      });
  }, []);

  const suggestedPrompts =
    role === "student"
      ? studentPrompts
      : role === "professional"
      ? proPrompts
      : dualPrompts;

  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    onTranscriptChange: (text) => setVoiceDraft(text),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAiThinking]);

  const handleSend = (text?: string) => {
    const query = text !== undefined ? text : inputVal;
    if (!query.trim()) {
      inputRef.current?.focus();
      return;
    }
    sendChatMessage(query);
    setInputVal("");
  };

  const handleApply = (msgId: string, tasks: any[]) => {
    applySuggestedTasks(tasks);
    setAppliedMessageIds((prev) => ({ ...prev, [msgId]: true }));
  };

  const handleApplyHabit = (msgId: string, habit: any) => {
    applySuggestedHabit(habit);
    setAppliedHabitIds((prev) => ({ ...prev, [msgId]: true }));
  };

  const handleApplyGoal = (msgId: string, goal: any) => {
    applySuggestedGoal(goal);
    setAppliedGoalIds((prev) => ({ ...prev, [msgId]: true }));
  };

  const openVoiceModal = () => {
    setIsVoiceModalOpen(true);
    setVoiceDraft(inputVal || "");
    if (isSpeechSupported) {
      resetTranscript();
      startListening();
    }
  };

  const handleConfirmVoice = () => {
    stopListening();
    setIsVoiceModalOpen(false);
    if (voiceDraft.trim()) {
      handleSend(voiceDraft.trim());
    }
  };

  const handleCancelVoice = () => {
    stopListening();
    setIsVoiceModalOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-12rem)] md:h-[calc(100dvh-9rem)] max-w-4xl mx-auto animate-in fade-in-50 duration-200">
      {/* Workspace Header */}
      <header className="pb-3 border-b border-[#e8e2d5] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#e8decb]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-base sm:text-xl font-normal text-[#201e1b] flex items-center gap-2">
              <span>Planning Assistant</span>
              <span className={cn(
                "hidden sm:inline-flex text-[10px] font-sans font-medium px-2 py-0.5 rounded-full border",
                aiStatus === "connected"
                  ? "bg-[#edf2ec] text-[#536b54] border-[#d6e0d5]"
                  : "bg-[#faece7] text-[#b85437] border-[#f3cec3]"
              )}>
                {aiStatus === "checking" ? "Checking AI..." : aiStatus === "connected" ? "Gemini AI Connected" : "Gemini AI: Setup Required"}
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-[#8a8479] truncate flex items-center gap-2">
              <span>Track: <strong className="text-[#545049] capitalize font-medium">{role === "student" ? "Academic" : role === "professional" ? "Professional" : "Dual"}</strong></span>
              <span className="text-[#d5cdbd]">•</span>
              <span>Peak: <strong className="text-[#545049] capitalize font-medium">{profile.mostProductivePeriod}</strong></span>
              <span className="text-[#d5cdbd] hidden md:inline">•</span>
              <span className="hidden md:inline">Focus: <strong className="text-[#545049] font-medium">{profile.preferredFocusDuration}m</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openQuickTask}
            className="text-xs font-medium text-[#201e1b] bg-white hover:bg-[#f2eee6] border border-[#e8e2d5] px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer active:scale-95"
            aria-label="New Task"
          >
            <Plus className="w-3.5 h-3.5 text-[#545049]" />
            <span>New Task</span>
          </button>
          <Link
            href="/my-day"
            className="text-xs font-medium text-[#545049] hover:text-[#201e1b] bg-white hover:bg-[#f2eee6] border border-[#e8e2d5] px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#687050]" />
            <span className="hidden sm:inline">View</span> My Day
          </Link>
        </div>
      </header>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto py-3.5 sm:py-4 space-y-3.5 sm:space-y-4 pr-1">
        {/* Status / Briefing Banner */}
        {aiStatus === "configuration_required" ? (
          <div className="bg-[#faece7]/50 border border-[#f3cec3] rounded-2xl p-4 text-xs space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-[#b85437] font-semibold">
              <Zap className="w-4 h-4 text-[#b85437] shrink-0" />
              <span className="font-serif text-sm">Gemini AI Setup Required</span>
            </div>
            <p className="text-[#545049] leading-relaxed text-[11px] sm:text-xs">
              To activate real-time Gemini AI scheduling, add your <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#e8e2d5]">GEMINI_API_KEY</code> to your environment variables or <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#e8e2d5]">.env.local</code>. You can also manually add tasks with the floating <strong>+</strong> button below.
            </p>
          </div>
        ) : (
          <div className="bg-[#fdfcf9] border border-[#e8e2d5] rounded-2xl p-4 text-xs space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-[#201e1b] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#536b54] shrink-0" />
              <span className="font-serif text-sm">Adaptive Constraint-Based Planning</span>
            </div>
            <p className="text-[#545049] leading-relaxed text-[11px] sm:text-xs">
              Tell Kronos your intentions to automatically fit study blocks and tasks around commitments, productive rhythms, and minimum buffer windows.
            </p>
          </div>
        )}

        {chatMessages.map((msg) => {
          const isUser = msg.sender === "user";
          const isApplied = appliedMessageIds[msg.id];

          return (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2 sm:gap-3 text-xs",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              {!isUser && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-3.5 h-3.5 text-[#e8decb]" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[88%] sm:max-w-xl rounded-2xl p-3.5 sm:p-4 leading-relaxed shadow-2xs transition-all",
                  isUser
                    ? "bg-[#201e1b] text-[#f8f6f0] rounded-tr-xs"
                    : "bg-[#fdfcf9] text-[#201e1b] border border-[#e8e2d5] rounded-tl-xs"
                )}
              >
                <p className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed">
                  {msg.text}
                </p>

                {/* Proposed Tasks Box (If AI suggested schedule items) */}
                {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#e8e2d5] space-y-2.5">
                    <div className="text-[11px] sm:text-xs font-semibold text-[#201e1b] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-[#536b54]" />
                        Proposed Schedule Timeblocks ({msg.suggestedTasks.length})
                      </span>
                      <span className="text-[10px] text-[#8a8479] font-normal">
                        Constraint Solved
                      </span>
                    </div>

                    <div className="space-y-2">
                      {msg.suggestedTasks.map((st, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 rounded-xl bg-[#f7f5f0] border border-[#e8e2d5] text-xs"
                        >
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className="font-semibold text-[#201e1b] truncate">
                              {st.title}
                            </span>
                            {st.tag && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#f2eee6] text-[#545049] font-medium border border-[#e4ded2]">
                                {st.tag}
                              </span>
                            )}
                            {st.energyLevel && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#edf2ec] text-[#536b54] capitalize border border-[#d6e0d5]">
                                {st.energyLevel} energy
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[#545049] font-medium text-[11px] shrink-0 font-mono">
                            <Clock className="w-3 h-3 text-[#8a8479]" />
                            <span>
                              {st.startTime ? `${st.startTime} (${st.estimatedDuration}m)` : `${st.estimatedDuration}m`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action button to apply proposed slots */}
                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      {isApplied ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#536b54] bg-[#edf2ec] border border-[#d6e0d5] px-3 py-1.5 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            Applied to Your Schedule
                          </span>
                          <Link
                            href="/my-day"
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#201e1b] hover:underline underline-offset-4"
                          >
                            Review in My Day <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(msg.id, msg.suggestedTasks!)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] font-medium text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#e8decb]" />
                          <span>Apply Proposed Schedule to My Day</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Proposed Habit Box */}
                {msg.suggestedHabit && (
                  <div className="mt-3 pt-3 border-t border-[#e8e2d5] space-y-2.5">
                    <div className="text-[11px] sm:text-xs font-semibold text-[#201e1b] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#536b54]" />
                        Proposed Behavioral Habit Protocol
                      </span>
                      <span className="text-[10px] text-[#8a8479] font-normal">
                        Tiny Habits Method
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f7f5f0] border border-[#e8e2d5] space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#201e1b]">
                          {msg.suggestedHabit.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#edf2ec] text-[#536b54] capitalize border border-[#d6e0d5]">
                          {msg.suggestedHabit.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#545049]">
                        <strong className="text-[#201e1b]">Anchor Cue:</strong> {msg.suggestedHabit.cue}
                      </p>
                      {msg.suggestedHabit.minimumVersion && (
                        <p className="text-[11px] text-[#545049]">
                          <strong className="text-[#201e1b]">2-Min Starter Rule:</strong> {msg.suggestedHabit.minimumVersion}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-[10px] text-[#8a8479]">
                        <span>Frequency: <strong className="capitalize text-[#545049]">{msg.suggestedHabit.frequency}</strong></span>
                        <span>•</span>
                        <span>Target: <strong className="text-[#545049]">{msg.suggestedHabit.targetDurationMinutes || 15}m</strong></span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      {appliedHabitIds[msg.id] ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#536b54] bg-[#edf2ec] border border-[#d6e0d5] px-3 py-1.5 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            Anchored to Growth
                          </span>
                          <Link
                            href="/growth"
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#201e1b] hover:underline underline-offset-4"
                          >
                            View in Growth <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApplyHabit(msg.id, msg.suggestedHabit)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] font-medium text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#e8decb]" />
                          <span>Anchor Habit to Growth Workspace</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Proposed Goal Roadmap Box */}
                {msg.suggestedGoal && (
                  <div className="mt-3 pt-3 border-t border-[#e8e2d5] space-y-2.5">
                    <div className="text-[11px] sm:text-xs font-semibold text-[#201e1b] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-[#b37e2a]" />
                        Proposed Goal Roadmap
                      </span>
                      <span className="text-[10px] text-[#8a8479] font-normal">
                        {msg.suggestedGoal.targetTimeline}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#f7f5f0] border border-[#e8e2d5] space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[#201e1b]">
                          {msg.suggestedGoal.title}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#f2eee6] text-[#b37e2a] uppercase tracking-wider font-semibold border border-[#e4ded2]">
                          {msg.suggestedGoal.priority} priority
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8479] block">
                          Milestones:
                        </span>
                        {msg.suggestedGoal.milestones?.map((m, mIdx) => (
                          <div key={mIdx} className="flex items-center gap-2 text-[11px] text-[#545049]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8a8479] shrink-0" />
                            <span>{m.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      {appliedGoalIds[msg.id] ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#536b54] bg-[#edf2ec] border border-[#d6e0d5] px-3 py-1.5 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            Roadmap Integrated
                          </span>
                          <Link
                            href="/growth"
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#201e1b] hover:underline underline-offset-4"
                          >
                            View in Growth <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApplyGoal(msg.id, msg.suggestedGoal)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] font-medium text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#e8decb]" />
                          <span>Integrate Goal to Roadmap</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Clarification / Quick Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#e8e2d5] space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-[#8a8479] tracking-wider block">
                      Options:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => handleSend(act.payload)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#f2eee6] border border-[#d5cdbd] hover:border-[#201e1b] text-xs font-medium text-[#201e1b] shadow-2xs transition-colors cursor-pointer"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span
                  className={cn(
                    "block text-[10px] mt-2 font-mono",
                    isUser ? "text-[#a39e93] text-right" : "text-[#8a8479]"
                  )}
                >
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#f2eee6] text-[#201e1b] border border-[#e4ded2] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isAiThinking && (
          <div className="flex gap-2.5 sm:gap-3 text-xs justify-start items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-3.5 h-3.5 text-[#e8decb]" />
            </div>
            <div className="p-3 bg-white border border-[#e8e2d5] rounded-2xl text-[#545049] text-xs flex items-center gap-2.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#536b54] animate-ping" />
              <span className="font-medium">
                Evaluating commitments, energy rhythms & free space...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Accessible Bottom Message Composer */}
      <div className="pt-2 pb-1 shrink-0 space-y-2">
        {/* Horizontally Browsable Suggested Prompt Chips (1-Tap to Send) */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none pb-0.5 -mx-1 px-1 sm:mx-0 sm:px-0">
          <span className="text-[10px] text-[#8a8479] font-medium shrink-0 flex items-center gap-1 uppercase tracking-wider">
            <Zap className="w-3 h-3 text-[#b37e2a]" /> Prompts:
          </span>
          {suggestedPrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(item.prompt)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-[#f2eee6] border border-[#e8e2d5] hover:border-[#d5cdbd] text-[#545049] hover:text-[#201e1b] shrink-0 text-[11px] transition-all whitespace-nowrap shadow-2xs font-medium cursor-pointer active:scale-95"
            >
              {item.title}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          autoComplete="off"
          data-form-type="other"
          noValidate
          className="bg-white border border-[#e8e2d5] rounded-2xl p-1.5 sm:p-2.5 flex items-center gap-2 shadow-2xs focus-within:ring-2 focus-within:ring-[#201e1b]/10 focus-within:border-[#201e1b] transition-all"
        >
          <input
            ref={inputRef}
            type="search"
            name="ai_chat_query"
            id="ai_chat_query"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask Kronos to plan your day..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck={false}
            enterKeyHint="send"
            data-form-type="other"
            data-lpignore="true"
            className="flex-1 px-3 py-2 bg-transparent border-0 text-xs sm:text-sm text-[#201e1b] placeholder:text-[#8a8479] focus:outline-hidden min-w-0"
          />

          {/* Voice Command Button */}
          <button
            type="button"
            onClick={openVoiceModal}
            className="w-11 h-11 sm:w-10 sm:h-10 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-xl border border-[#e8e2d5] bg-[#fbf9f5] hover:bg-[#f2eee6] text-[#545049] hover:text-[#201e1b] transition-colors flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
            title="Dictate schedule request"
            aria-label="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={isAiThinking}
            className={cn(
              "px-3.5 sm:px-4 h-11 sm:h-10 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer",
              inputVal.trim()
                ? "bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] active:scale-95"
                : "bg-[#f2eee6] text-[#8a8479] hover:bg-[#e8e2d5] hover:text-[#201e1b]"
            )}
            title={inputVal.trim() ? "Send schedule request" : "Type a request or tap a prompt above"}
            aria-label="Send message"
          >
            <Send className={cn("w-3.5 h-3.5", inputVal.trim() ? "text-[#e8decb]" : "text-[#8a8479]")} />
            <span className="hidden sm:inline">Plan</span>
          </button>
        </form>
      </div>

      {/* Voice Dictation & Review Modal */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#201e1b]/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-[#fbf9f5] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#e8e2d5] w-full sm:max-w-md p-5 sm:p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e2d5]">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#536b54]" />
                <h3 className="font-serif text-base sm:text-lg font-normal text-[#201e1b]">
                  Voice Schedule Input
                </h3>
              </div>
              <button
                onClick={handleCancelVoice}
                className="p-1.5 rounded-lg text-[#8a8479] hover:text-[#201e1b] hover:bg-[#f2eee6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Listening Indicator */}
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (isListening) stopListening();
                  else startListening();
                }}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md",
                  isListening
                    ? "bg-[#b85437] text-white animate-pulse ring-4 ring-[#faece7]"
                    : "bg-[#201e1b] text-white hover:bg-[#38342f]"
                )}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
              </button>
              <div className="text-xs text-center">
                <span className="font-semibold text-[#201e1b] block">
                  {isListening ? "Listening... Speak your daily intentions" : "Microphone idle"}
                </span>
                <span className="text-[11px] text-[#8a8479]">
                  {isListening ? "Tap to pause" : "Tap microphone to begin"}
                </span>
              </div>
            </div>

            {/* Draft Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#545049] uppercase tracking-wider block">
                Recognised Transcript
              </label>
              <textarea
                name="voice_draft_input"
                id="voice_draft_input"
                value={voiceDraft}
                onChange={(e) => setVoiceDraft(e.target.value)}
                placeholder="Spoken words will appear here for review..."
                rows={3}
                autoComplete="off"
                autoCorrect="off"
                data-form-type="other"
                data-lpignore="true"
                className="w-full p-3 rounded-xl bg-white border border-[#e8e2d5] text-xs text-[#201e1b] placeholder:text-[#8a8479] focus:outline-hidden focus:border-[#201e1b] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e8e2d5]">
              <button
                type="button"
                onClick={handleCancelVoice}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#545049] hover:bg-[#f2eee6] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVoice}
                disabled={!voiceDraft.trim()}
                className="px-4 py-2 rounded-xl bg-[#201e1b] hover:bg-[#38342f] disabled:opacity-40 text-[#f8f6f0] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-[#e8decb]" />
                <span>Submit to AI Planner</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
