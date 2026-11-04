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
  RotateCcw,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

const suggestedPrompts = [
  {
    title: "Morning Study & Gym",
    prompt: "I need to complete two assignments, study economics for 1 hour, and hit the gym at 5 PM.",
  },
  {
    title: "Meeting Reschedule",
    prompt: "I have an unexpected 4 PM sync. Please reschedule my afternoon work blocks.",
  },
  {
    title: "Catch Up Routine",
    prompt: "I missed my morning deep work session. How can I reorganise the rest of today realistically?",
  },
  {
    title: "Energy-Aligned Block",
    prompt: "Find a 45-minute high-focus window for thesis writing before my evening classes.",
  },
];

export default function AIPage() {
  const {
    chatMessages,
    sendChatMessage,
    isAiThinking,
    applySuggestedTasks,
    role,
    profile,
  } = useDemo();

  const [inputVal, setInputVal] = useState("");
  const [appliedMessageIds, setAppliedMessageIds] = useState<Record<string, boolean>>({});
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    const query = text || inputVal;
    if (!query.trim()) return;
    sendChatMessage(query);
    setInputVal("");
  };

  const handleApply = (msgId: string, tasks: any[]) => {
    applySuggestedTasks(tasks);
    setAppliedMessageIds((prev) => ({ ...prev, [msgId]: true }));
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
    <div className="flex flex-col h-[calc(100vh-8.5rem)] sm:h-[calc(100vh-7.5rem)] max-w-4xl mx-auto animate-in fade-in-50 duration-200">
      {/* Workspace Header */}
      <header className="pb-3 border-b border-[#e6e3da] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 truncate">
              Conversational Planning Assistant
              <span className="hidden sm:inline-flex text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                AI Powered
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate flex items-center gap-2">
              <span>Persona: <strong className="text-slate-700 capitalize">{profile.name} ({role})</strong></span>
              <span className="text-slate-300">•</span>
              <span>Peak: <strong className="text-slate-700 capitalize">{profile.mostProductivePeriod}</strong></span>
              <span className="text-slate-300 hidden md:inline">•</span>
              <span className="hidden md:inline">Focus: <strong className="text-slate-700">{profile.preferredFocusDuration}m</strong></span>
            </p>
          </div>
        </div>

        <Link
          href="/my-day"
          className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#e6e3da] px-2.5 sm:px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-2xs"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">View</span> My Day
        </Link>
      </header>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto py-3.5 sm:py-4 space-y-3.5 sm:space-y-4 pr-1">
        {/* Welcome Briefing Card */}
        <div className="bg-[#fcfbf7] border border-[#e8e4dc] rounded-2xl p-3.5 sm:p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Intelligent Constraint-Based Planning</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
            Kronos AI translates natural intentions into real timeblocks respecting your fixed commitments ({profile.role === "student" ? "classes & labs" : profile.role === "professional" ? "meetings & reviews" : "classes & meetings"}), productive rhythms, and minimum buffer windows. Casual questions are answered directly without altering your schedule.
          </p>
        </div>

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
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[88%] sm:max-w-xl rounded-2xl p-3.5 sm:p-4 leading-relaxed shadow-xs transition-all",
                  isUser
                    ? "bg-slate-900 text-white rounded-tr-xs"
                    : "bg-white text-slate-800 border border-[#e6e3da] rounded-tl-xs"
                )}
              >
                <p className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed">
                  {msg.text}
                </p>

                {/* Proposed Tasks Box (If AI suggested schedule items) */}
                {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#f0ede6] space-y-2.5">
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Proposed Schedule Timeblocks ({msg.suggestedTasks.length})
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Constraint Solved
                      </span>
                    </div>

                    <div className="space-y-2">
                      {msg.suggestedTasks.map((st, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-xs"
                        >
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className="font-semibold text-slate-900 truncate">
                              {st.title}
                            </span>
                            {st.tag && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-900 font-medium">
                                {st.tag}
                              </span>
                            )}
                            {st.energyLevel && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 capitalize">
                                {st.energyLevel} energy
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px] shrink-0">
                            <Clock className="w-3 h-3 text-slate-400" />
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
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                            <Check className="w-3.5 h-3.5" />
                            Applied to Your Schedule
                          </span>
                          <Link
                            href="/my-day"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-4"
                          >
                            Review in My Day <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(msg.id, msg.suggestedTasks!)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Apply Proposed Schedule to My Day</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <span
                  className={cn(
                    "block text-[10px] mt-2",
                    isUser ? "text-slate-400 text-right" : "text-slate-400"
                  )}
                >
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isAiThinking && (
          <div className="flex gap-2.5 sm:gap-3 text-xs justify-start items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-white border border-[#e6e3da] rounded-2xl text-slate-600 text-xs flex items-center gap-2.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span className="font-medium">
                Evaluating commitments, energy rhythms & free space...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="pt-2 pb-2 shrink-0 border-t border-[#e6e3da]/80">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none pb-1">
          <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-600" /> Prompts:
          </span>
          {suggestedPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 border border-[#e6e3da] hover:border-slate-400 text-slate-700 hover:text-slate-900 shrink-0 text-[11px] transition-colors whitespace-nowrap shadow-2xs font-medium"
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box with Speech Dictation */}
      <div className="pt-1 pb-1 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="bg-white border border-[#e6e3da] rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 shadow-xs focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-800 transition-all"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type your goals, tasks, or schedule changes (e.g. 'Study economics for 1h, gym at 5')..."
            className="flex-1 px-2.5 py-1.5 bg-transparent border-0 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden min-w-0"
          />

          {/* Voice Command Button */}
          <button
            type="button"
            onClick={openVoiceModal}
            className="w-9 h-9 rounded-xl border border-[#e6e3da] bg-[#faf9f6] hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-900 transition-colors flex items-center justify-center shrink-0"
            title="Dictate schedule request"
            aria-label="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!inputVal.trim() || isAiThinking}
            className="px-3.5 sm:px-4 h-9 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Plan</span>
          </button>
        </form>
      </div>

      {/* Voice Dictation & Review Modal */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border-t sm:border border-[#e6e3da] w-full sm:max-w-md p-5 sm:p-6 shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e3da]">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-700" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                  Voice Schedule Input
                </h3>
              </div>
              <button
                onClick={handleCancelVoice}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Listening Indicator */}
            <div className="flex flex-col items-center justify-center py-3 sm:py-4 space-y-2.5 sm:space-y-3">
              <button
                type="button"
                onClick={() => {
                  if (isListening) stopListening();
                  else startListening();
                }}
                className={cn(
                  "w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md",
                  isListening
                    ? "bg-rose-500 text-white animate-pulse ring-4 ring-rose-200"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                )}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? <Mic className="w-6 h-6 sm:w-7 sm:h-7" /> : <MicOff className="w-6 h-6 sm:w-7 sm:h-7" />}
              </button>
              <div className="text-xs text-center">
                <span className="font-semibold text-slate-800 block">
                  {isListening ? "Listening... Speak your daily intentions" : "Microphone idle"}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400">
                  {isSpeechSupported
                    ? "Powered by Web Speech Recognition"
                    : "Browser speech API not available; select sample below"}
                </span>
              </div>
            </div>

            {/* Transcribed Text Review & Edit */}
            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-600 font-medium text-[11px] sm:text-xs">
                Transcribed Request (Edit before submitting):
              </label>
              <textarea
                rows={3}
                value={voiceDraft}
                onChange={(e) => setVoiceDraft(e.target.value)}
                placeholder="Speak or edit your command here..."
                className="w-full p-2.5 sm:p-3 rounded-xl bg-[#faf9f6] border border-[#e6e3da] text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 leading-relaxed text-xs"
              />
            </div>

            {/* Sample Voice Utterance Presets */}
            <div className="space-y-1.5 pt-2 border-t border-[#e6e3da]">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Quick Test Utterances:
              </span>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {[
                  "Study economics 1 hour and gym at 5",
                  "Reschedule afternoon tasks due to meeting",
                  "Prepare 45m review for Stanford thesis",
                ].map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setVoiceDraft(preset)}
                    className="text-[10px] px-2 py-1 rounded-md bg-[#faf9f6] border border-[#e6e3da] text-slate-700 hover:bg-slate-100"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e6e3da]">
              <button
                type="button"
                onClick={handleCancelVoice}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVoice}
                disabled={!voiceDraft.trim()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xs"
              >
                Plan with AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
