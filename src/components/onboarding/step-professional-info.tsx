"use client";

import React, { useState } from "react";
import { Briefcase, Building, Clock, Plus, Trash2, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { RecurringMeetingEntry } from "@/types";

interface StepProfessionalInfoProps {
  data: {
    jobRole: string;
    company: string;
    workStartTime: string;
    workEndTime: string;
    recurringMeetings: RecurringMeetingEntry[];
  };
  onChange: (fields: Partial<StepProfessionalInfoProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const daysOfWeek: RecurringMeetingEntry["dayOfWeek"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function StepProfessionalInfo({ data, onChange, onNext, onBack }: StepProfessionalInfoProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newDay, setNewDay] = useState<RecurringMeetingEntry["dayOfWeek"]>("Monday");
  const [newStart, setNewStart] = useState("09:30");
  const [newEnd, setNewEnd] = useState("10:00");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("high");
  const [showAddMeeting, setShowAddMeeting] = useState(false);

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newMeeting: RecurringMeetingEntry = {
      id: `rm-custom-${Date.now()}`,
      dayOfWeek: newDay,
      title: newTitle.trim(),
      startTime: newStart,
      endTime: newEnd,
      priority: newPriority,
    };

    onChange({ recurringMeetings: [...data.recurringMeetings, newMeeting] });
    setNewTitle("");
    setShowAddMeeting(false);
  };

  const handleRemoveMeeting = (id: string) => {
    onChange({ recurringMeetings: data.recurringMeetings.filter((m) => m.id !== id) });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Professional Information & Recurring Meetings
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Define your core office or remote working window and recurring stakeholder meetings so Kronos can defend your deep focus time.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-6">
        {/* Role & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Role / Position
            </label>
            <input
              type="text"
              value={data.jobRole}
              onChange={(e) => onChange({ jobRole: e.target.value })}
              placeholder="e.g. Principal Systems Architect"
              className="w-full px-3.5 py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company / Team
            </label>
            <input
              type="text"
              value={data.company}
              onChange={(e) => onChange({ company: e.target.value })}
              placeholder="e.g. CloudScale Distributed Systems"
              className="w-full px-3.5 py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Working Hours */}
        <div className="p-4 rounded-xl bg-[#faf9f6] border border-[#e6e3da]">
          <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Core Working Hours Window</span>
          </label>
          <p className="text-[11px] text-slate-500 mb-3">
            Tasks relating to your professional responsibilities will be mapped within this boundary.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-500 block mb-1">Work Start</span>
              <input
                type="time"
                value={data.workStartTime}
                onChange={(e) => onChange({ workStartTime: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#e6e3da] rounded-lg text-xs font-semibold"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-1">Work End / Sign-off</span>
              <input
                type="time"
                value={data.workEndTime}
                onChange={(e) => onChange({ workEndTime: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#e6e3da] rounded-lg text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Recurring Meetings Editor */}
        <div className="pt-2 border-t border-[#f0ede6]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recurring Meetings & Standups ({data.recurringMeetings.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Fixed meeting blocks that cannot be interrupted.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddMeeting(!showAddMeeting)}
              className="px-3 py-1.5 bg-[#f5f3ec] hover:bg-[#ede9df] text-slate-800 text-xs font-semibold rounded-lg border border-[#e6e3da] flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Meeting</span>
            </button>
          </div>

          {/* Add Meeting Form */}
          {showAddMeeting && (
            <div className="p-3.5 mb-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3 animate-in fade-in-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Day</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border border-[#e6e3da] rounded-lg text-xs"
                  >
                    {daysOfWeek.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Meeting Name</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Daily Standup"
                    className="w-full px-2 py-1.5 bg-white border border-[#e6e3da] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#e6e3da] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#e6e3da] rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-slate-600">Priority:</span>
                  {(["high", "medium", "low"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                        newPriority === p
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 border border-[#e6e3da]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddMeeting}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Save Meeting
                </button>
              </div>
            </div>
          )}

          {/* Meetings List */}
          <div className="space-y-2">
            {data.recurringMeetings.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No recurring meetings specified yet. Click "+ Add Meeting" above or use presets.
              </p>
            ) : (
              data.recurringMeetings.map((rm) => (
                <div
                  key={rm.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da]/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-slate-200 text-slate-700">
                      {rm.dayOfWeek.slice(0, 3)}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">{rm.title}</span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{rm.startTime} – {rm.endTime}</span>
                        <span className="text-[10px] uppercase font-semibold text-slate-600">
                          {rm.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                      <Lock className="w-2.5 h-2.5" />
                      Fixed
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMeeting(rm.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="pt-4 flex items-center justify-between border-t border-[#e6e3da]">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl border border-[#e6e3da] text-xs font-semibold text-slate-700 hover:bg-[#f5f3ec] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
        >
          <span>Continue</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>
    </div>
  );
}
