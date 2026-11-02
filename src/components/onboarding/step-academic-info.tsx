"use client";

import React, { useState } from "react";
import { GraduationCap, BookOpen, Plus, Trash2, Clock, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { TimetableEntry } from "@/types";

interface StepAcademicInfoProps {
  data: {
    course: string;
    semester: string;
    subjects: string[];
    timetable: TimetableEntry[];
  };
  onChange: (fields: Partial<StepAcademicInfoProps["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

const daysOfWeek: TimetableEntry["dayOfWeek"][] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function StepAcademicInfo({ data, onChange, onNext, onBack }: StepAcademicInfoProps) {
  const [newSubject, setNewSubject] = useState("");
  const [newSlotDay, setNewSlotDay] = useState<TimetableEntry["dayOfWeek"]>("Monday");
  const [newSlotSubject, setNewSlotSubject] = useState("");
  const [newSlotStart, setNewSlotStart] = useState("09:00");
  const [newSlotEnd, setNewSlotEnd] = useState("10:15");
  const [newSlotLocation, setNewSlotLocation] = useState("");
  const [showAddSlot, setShowAddSlot] = useState(false);

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    if (!data.subjects.includes(newSubject.trim())) {
      onChange({ subjects: [...data.subjects, newSubject.trim()] });
    }
    setNewSubject("");
  };

  const handleRemoveSubject = (sub: string) => {
    onChange({ subjects: data.subjects.filter((s) => s !== sub) });
  };

  const handleAddTimetableSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotSubject.trim()) return;

    const newEntry: TimetableEntry = {
      id: `tt-custom-${Date.now()}`,
      dayOfWeek: newSlotDay,
      subject: newSlotSubject.trim(),
      startTime: newSlotStart,
      endTime: newSlotEnd,
      locationOrLink: newSlotLocation.trim() || undefined,
    };

    onChange({ timetable: [...data.timetable, newEntry] });
    setNewSlotSubject("");
    setNewSlotLocation("");
    setShowAddSlot(false);
  };

  const handleRemoveSlot = (id: string) => {
    onChange({ timetable: data.timetable.filter((t) => t.id !== id) });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
            Academic Information & Timetable
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Enter your current academic coursework and class timetable. These slots are protected as non-negotiable commitments.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#e6e3da] p-6 shadow-xs space-y-6">
        {/* Course and Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course / Degree Program
            </label>
            <input
              type="text"
              value={data.course}
              onChange={(e) => onChange({ course: e.target.value })}
              placeholder="e.g. B.S. Computer Science & Economics"
              className="w-full px-3.5 py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Semester / Term
            </label>
            <input
              type="text"
              value={data.semester}
              onChange={(e) => onChange({ semester: e.target.value })}
              placeholder="e.g. Fall Quarter (Junior Year)"
              className="w-full px-3.5 py-2.5 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Subjects Enrolled */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subjects / Modules Enrolled
          </label>
          <p className="text-[11px] text-slate-500 mb-2">
            Add your active classes so the AI can tag assignments and exam preparation blocks.
          </p>

          <div className="flex items-center gap-2 mb-2.5">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSubject();
                }
              }}
              placeholder="e.g. CS 106B, ECON 201"
              className="flex-1 px-3 py-2 bg-[#fbfaf7] border border-[#e6e3da] rounded-xl text-xs text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleAddSubject}
              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {data.subjects.map((sub) => (
              <span
                key={sub}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200 text-xs font-medium"
              >
                <span>{sub}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(sub)}
                  className="text-blue-500 hover:text-rose-600 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Interactive Timetable Editor */}
        <div className="pt-2 border-t border-[#f0ede6]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Class Timetable ({data.timetable.length} slots)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Fixed slots that cannot be moved or double-booked.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddSlot(!showAddSlot)}
              className="px-3 py-1.5 bg-[#f5f3ec] hover:bg-[#ede9df] text-slate-800 text-xs font-semibold rounded-lg border border-[#e6e3da] flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class</span>
            </button>
          </div>

          {/* Add Slot Row */}
          {showAddSlot && (
            <div className="p-3.5 mb-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3 animate-in fade-in-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Day</label>
                  <select
                    value={newSlotDay}
                    onChange={(e) => setNewSlotDay(e.target.value as any)}
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
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={newSlotSubject}
                    onChange={(e) => setNewSlotSubject(e.target.value)}
                    placeholder="e.g. ECON 201 Lecture"
                    className="w-full px-2 py-1.5 bg-white border border-[#e6e3da] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#e6e3da] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#e6e3da] rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={newSlotLocation}
                  onChange={(e) => setNewSlotLocation(e.target.value)}
                  placeholder="Location or link (e.g. Cubberley 110 or Zoom link)"
                  className="flex-1 px-2.5 py-1.5 bg-white border border-[#e6e3da] rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddTimetableSlot}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
                >
                  Save Slot
                </button>
              </div>
            </div>
          )}

          {/* Timetable List */}
          <div className="space-y-2">
            {data.timetable.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No classes added yet. Click "+ Add Class" above or use presets.
              </p>
            ) : (
              data.timetable.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#faf9f6] border border-[#e6e3da]/80 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-slate-200 text-slate-700">
                      {slot.dayOfWeek.slice(0, 3)}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900">{slot.subject}</span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{slot.startTime} – {slot.endTime}</span>
                        {slot.locationOrLink && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[150px]">{slot.locationOrLink}</span>
                          </>
                        )}
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
                      onClick={() => handleRemoveSlot(slot.id)}
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
