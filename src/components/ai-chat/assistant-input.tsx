"use client";

import React, { useState } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  CalendarCheck,
  Check,
  ArrowRight,
  Clock,
  Mic,
  MicOff,
  Volume2,
  X,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";

const samplePrompts = [
  "Today I have two assignments to complete, need to study economics, hit the gym and learn Blender.",
  "I have an urgent meeting at 4 PM, please adjust my schedule.",
  "I couldn't finish my morning study session, please reschedule remaining tasks.",
];

export function AssistantInput() {
  const { chatMessages, sendChatMessage, isAiThinking, applySuggestedTasks, role } = useDemo();
  const [inputVal, setInputVal] = useState("");
  const [appliedMessageIds, setAppliedMessageIds] = useState<Record<string, boolean>>({});
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState("");

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
    <div className="bg-white rounded-2xl border border-[#e6e3da] shadow-xs overflow-hidden mt-4 sm:mt-8">
      {/* Assistant Header */}
      <div className="p-3.5 sm:p-4 border-b border-[#e6e3da] bg-[#fdfcf9] flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-serif flex items-center gap-1.5 sm:gap-2 truncate">
              Kronos Assistant
              <span className="text-[9px] sm:text-[10px] font-sans font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                Context-Aware
              </span>
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
              Conversational planning • Type or speak your daily intentions
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Stream (Scrollable notebook style) */}
      <div className="p-3 sm:p-4 max-h-80 sm:max-h-72 overflow-y-auto space-y-3 sm:space-y-3.5 bg-[#fcfbf8]">
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
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[85%] sm:max-w-xl rounded-xl p-3 sm:p-3.5 leading-relaxed shadow-xs",
                  isUser
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-[#e6e3da] rounded-tl-none"
                )}
              >
                <p className="whitespace-pre-line text-[11px] sm:text-xs">{msg.text}</p>

                {/* Proposed Tasks Box (If AI suggested schedule items) */}
                {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                  <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-[#f0ede6] space-y-2">
                    <div className="text-[10px] sm:text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Proposed Schedule Slots:</span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.suggestedTasks.map((st, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 p-2 rounded-lg bg-[#f8f6f0] border border-[#e6e3da]/80 text-[10px] sm:text-[11px]"
                        >
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800">{st.title}</span>
                            {st.tag && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-amber-100 text-amber-800">
                                {st.tag}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-500 font-medium">
                            {st.startTime ? `${st.startTime} (${st.estimatedDuration}m)` : `${st.estimatedDuration}m`}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action button to apply proposed slots */}
                    <div className="mt-2.5 pt-1">
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                          <Check className="w-3.5 h-3.5" />
                          Added to your Agenda
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(msg.id, msg.suggestedTasks!)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] shadow-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Apply Proposed Schedule</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <span
                  className={cn(
                    "block text-[9px] sm:text-[10px] mt-1.5",
                    isUser ? "text-slate-400 text-right" : "text-slate-400"
                  )}
                >
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isAiThinking && (
          <div className="flex gap-2 sm:gap-3 text-xs justify-start items-center">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="p-2.5 sm:p-3 bg-white border border-[#e6e3da] rounded-xl text-slate-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              <span>Analyzing constraints, energy levels & buffers...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-3 sm:px-4 py-2 bg-[#f8f6f0] border-t border-[#e6e3da] flex items-center gap-1.5 sm:gap-2 overflow-x-auto text-xs scrollbar-none">
        <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium shrink-0">Try asking:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full bg-white border border-[#e6e3da] hover:border-slate-400 text-slate-700 hover:text-slate-900 shrink-0 text-[10px] sm:text-[11px] transition-colors whitespace-nowrap"
          >
            "{prompt.slice(0, 32)}..."
          </button>
        ))}
      </div>

      {/* Input Form with Voice Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        autoComplete="off"
        data-form-type="other"
        noValidate
        className="p-2.5 sm:p-3 bg-white border-t border-[#e6e3da] flex items-center gap-2"
      >
        <input
          type="search"
          name="assistant_chat_input"
          id="assistant_chat_input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Tell AI what you want to achieve today...`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="sentences"
          spellCheck={false}
          enterKeyHint="send"
          data-form-type="other"
          data-lpignore="true"
          className="flex-1 px-3 sm:px-3.5 py-2 sm:py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all min-w-0"
        />

        {/* Microphone Button */}
        <button
          type="button"
          onClick={openVoiceModal}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#e6e3da] bg-[#faf9f6] hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-900 transition-colors flex items-center justify-center shrink-0"
          title="Voice Command Input (Web Speech API)"
          aria-label="Voice input"
        >
          <Mic className="w-4 h-4" />
        </button>

        <button
          type="submit"
          disabled={!inputVal.trim() || isAiThinking}
          className="px-3.5 sm:px-4 h-9 sm:h-10 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Plan</span>
        </button>
      </form>

      {/* Voice Dictation & Review Modal (Bottom Sheet on Mobile) */}
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
                  {isListening ? "Listening... Speak your plan" : "Microphone idle"}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-400">
                  {isSpeechSupported
                    ? "Powered by Web Speech Recognition"
                    : "Browser speech not supported; type or select sample below"}
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
