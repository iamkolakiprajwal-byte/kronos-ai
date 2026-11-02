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
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
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

  return (
    <div className="bg-white rounded-2xl border border-[#e6e3da] shadow-xs overflow-hidden mt-8">
      {/* Assistant Header */}
      <div className="p-4 border-b border-[#e6e3da] bg-[#fdfcf9] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
              Kronos Assistant
              <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Context-Aware
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Conversational planning • Tell me your intentions for today
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Stream (Scrollable notebook style) */}
      <div className="p-4 max-h-72 overflow-y-auto space-y-3.5 bg-[#fcfbf8]">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === "user";
          const isApplied = appliedMessageIds[msg.id];

          return (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 text-xs",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-xl rounded-xl p-3.5 leading-relaxed shadow-xs",
                  isUser
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-[#e6e3da] rounded-tl-none"
                )}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Proposed Tasks Box (If AI suggested schedule items) */}
                {msg.suggestedTasks && msg.suggestedTasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#f0ede6] space-y-2">
                    <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Proposed Schedule Slots:</span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.suggestedTasks.map((st, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#f8f6f0] border border-[#e6e3da]/80 text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{st.title}</span>
                            {st.tag && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800">
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
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                          <Check className="w-3.5 h-3.5" />
                          Added to your Agenda
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(msg.id, msg.suggestedTasks!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] shadow-xs transition-colors"
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
                    "block text-[10px] mt-1.5",
                    isUser ? "text-slate-400 text-right" : "text-slate-400"
                  )}
                >
                  {msg.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isAiThinking && (
          <div className="flex gap-3 text-xs justify-start items-center">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-white border border-[#e6e3da] rounded-xl text-slate-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              <span>Analyzing schedule constraints, energy levels & buffer windows...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-4 py-2 bg-[#f8f6f0] border-t border-[#e6e3da] flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-500 font-medium shrink-0">Try asking:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full bg-white border border-[#e6e3da] hover:border-slate-400 text-slate-700 hover:text-slate-900 shrink-0 text-[11px] transition-colors"
          >
            "{prompt.slice(0, 36)}..."
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-[#e6e3da] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Tell AI what you want to achieve today (e.g. "I have 2 assignments, gym at 4, economics study")...`}
          className="flex-1 px-3.5 py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isAiThinking}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
        >
          <Send className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">Plan</span>
        </button>
      </form>
    </div>
  );
}
