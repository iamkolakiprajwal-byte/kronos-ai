"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Bot,
  Calendar,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  GraduationCap,
  Briefcase,
  Zap,
} from "lucide-react";
import { useDemo } from "@/context/demo-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const TUTORIAL_STORAGE_KEY = "kronos_ai_tutorial_completed_v1";

export function WelcomeTutorialModal() {
  const { role, profile, openQuickTask } = useDemo();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Only show if not previously completed or dismissed
    const hasSeen = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    if (!hasSeen) {
      // Small delay for gentle entrance after page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  const handleCreateFirstTask = () => {
    handleDismiss();
    openQuickTask();
  };

  if (!isOpen) return null;

  const displayName = user?.name?.split(" ")[0] || profile.name.split(" ")[0] || "there";

  const steps = [
    {
      title: `Welcome, ${displayName}!`,
      subtitle: "Your intelligent personal planning companion",
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shadow-md">
          <Sparkles className="w-6 h-6 text-[#e8decb]" />
        </div>
      ),
      content: (
        <div className="space-y-3 text-xs text-[#545049] leading-relaxed">
          <p>
            Kronos AI adapts your daily schedule based on your rhythm as a{" "}
            <strong className="text-[#201e1b] capitalize font-semibold">
              {role === "student" ? "student" : role === "professional" ? "working professional" : "dual work & study planner"}
            </strong>.
          </p>
          <div className="p-3 rounded-xl bg-[#f2eee6] border border-[#e4ded2] flex items-center gap-2.5">
            {role === "student" ? (
              <GraduationCap className="w-4 h-4 text-[#536b54] shrink-0" />
            ) : role === "professional" ? (
              <Briefcase className="w-4 h-4 text-[#b85437] shrink-0" />
            ) : (
              <Compass className="w-4 h-4 text-[#687050] shrink-0" />
            )}
            <span className="text-[11px] font-medium text-[#201e1b]">
              Your workspace is customized to protect peak energy hours and prevent burnout.
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Add Your First Task",
      subtitle: "Quick task addition right at your fingertips",
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shadow-md">
          <Plus className="w-6 h-6 text-[#e8decb]" />
        </div>
      ),
      content: (
        <div className="space-y-3 text-xs text-[#545049] leading-relaxed">
          <p>
            Notice the <strong>floating + button</strong> in the bottom-right corner of your screen (Google Keep style).
          </p>
          <p>
            You can tap it anytime from anywhere in the app to add classes, deep work sessions, assignments, or personal errands.
          </p>
          <button
            type="button"
            onClick={handleCreateFirstTask}
            className="w-full py-2.5 px-3 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-98 cursor-pointer mt-1"
          >
            <Plus className="w-4 h-4 text-[#e8decb]" />
            <span>Create First Plan Item Now</span>
          </button>
        </div>
      ),
    },
    {
      title: "Plan with AI Assistant",
      subtitle: "Conversational scheduling and rescheduling",
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-[#edf2ec] text-[#536b54] border border-[#d6e0d5] flex items-center justify-center shadow-md">
          <Bot className="w-6 h-6 text-[#536b54]" />
        </div>
      ),
      content: (
        <div className="space-y-3 text-xs text-[#545049] leading-relaxed">
          <p>
            Visit the <strong>AI workspace</strong> (tab 2 at the bottom) anytime to speak or type in natural language.
          </p>
          <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#e8e2d5] text-[11px] font-mono text-[#545049] space-y-1">
            <span className="text-[#8a8479] block text-[10px] uppercase font-sans font-bold">Example query:</span>
            <p className="italic text-[#201e1b]">
              &ldquo;Plan my day. I have an algorithm assignment for 2 hours, gym at 5 PM, and need to study for 45 minutes.&rdquo;
            </p>
          </div>
          <p>
            Kronos analyzes your fixed commitments, calculates energy curves, and generates structured proposals for your approval.
          </p>
        </div>
      ),
    },
    {
      title: "Track Flow & Habits",
      subtitle: "Daily execution and behavioral growth",
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-[#faece7] text-[#b85437] border border-[#f3cec3] flex items-center justify-center shadow-md">
          <Zap className="w-6 h-6 text-[#b85437]" />
        </div>
      ),
      content: (
        <div className="space-y-3 text-xs text-[#545049] leading-relaxed">
          <p>
            Use <strong>My Day</strong> for live task ticking with realistic mid-day rescheduling, and <strong>Growth</strong> to log focus sessions and build long-term habits.
          </p>
          <div className="p-3 rounded-xl bg-[#edf2ec] border border-[#d6e0d5] text-xs text-[#536b54] flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>You&apos;re all set! Let&apos;s start mastering your time.</span>
          </div>
        </div>
      ),
    },
  ];

  const active = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#201e1b]/50 backdrop-blur-xs animate-in fade-in-50 duration-200">
      <div className="bg-[#fdfcf9] rounded-3xl border border-[#e8e2d5] max-w-sm sm:max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {active.icon}
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#687050]">
                Step {currentStep + 1} of {steps.length}
              </span>
              <h3 className="font-serif text-lg font-normal text-[#201e1b] tracking-tight">
                {active.title}
              </h3>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-[#8a8479] hover:text-[#201e1b] hover:bg-[#f2eee6] cursor-pointer"
            title="Skip tutorial"
            aria-label="Skip tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body */}
        <div className="min-h-[140px] flex flex-col justify-center">
          {active.content}
        </div>

        {/* Indicator dots & Actions */}
        <div className="pt-3 border-t border-[#e8e2d5] flex items-center justify-between gap-2">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all cursor-pointer",
                  idx === currentStep ? "w-5 bg-[#201e1b]" : "w-1.5 bg-[#d5cdbd] hover:bg-[#8a8479]"
                )}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#545049] hover:bg-[#f2eee6] transition-colors cursor-pointer"
              >
                Back
              </button>
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-3.5 py-1.5 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#e8decb]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-1.5 rounded-xl bg-[#201e1b] hover:bg-[#38342f] text-[#f8f6f0] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
              >
                <span>Get Started</span>
                <Check className="w-3.5 h-3.5 text-[#e8decb]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
