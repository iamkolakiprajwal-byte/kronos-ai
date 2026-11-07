"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemo } from "@/context/demo-context";
import { UserRole, OnboardingFormData } from "@/types";
import {
  studentOnboardingPreset,
  professionalOnboardingPreset,
  bothOnboardingPreset,
} from "@/lib/mock/demo-data";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { StepWelcome } from "@/components/onboarding/step-welcome";
import { StepUserType } from "@/components/onboarding/step-user-type";
import { StepPersonalInfo } from "@/components/onboarding/step-personal-info";
import { StepDailyRoutine } from "@/components/onboarding/step-daily-routine";
import { StepAcademicInfo } from "@/components/onboarding/step-academic-info";
import { StepProfessionalInfo } from "@/components/onboarding/step-professional-info";
import { StepGoals } from "@/components/onboarding/step-goals";
import { StepHabits } from "@/components/onboarding/step-habits";
import { StepProductivityPreferences } from "@/components/onboarding/step-productivity-preferences";
import { StepSustainability } from "@/components/onboarding/step-sustainability";
import { StepReviewSummary } from "@/components/onboarding/step-review-summary";
import { StepSchedulePreview } from "@/components/onboarding/step-schedule-preview";
import Link from "next/link";
import { Clock, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { dataService } from "@/lib/supabase/data-service";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { onboardingDraft, setOnboardingDraft, completeOnboarding } = useDemo();

  const [formData, setFormData] = useState<OnboardingFormData>(
    () => onboardingDraft || studentOnboardingPreset
  );
  const [currentStep, setCurrentStep] = useState(1);

  // Sync draft in context as user types
  const updateFormData = (fields: Partial<OnboardingFormData>) => {
    setFormData((prev) => {
      const current = prev || studentOnboardingPreset;
      const updated = { ...current, ...fields };
      setOnboardingDraft(updated);
      return updated;
    });
  };

  const handleLoadPreset = (role: UserRole) => {
    let preset = studentOnboardingPreset;
    if (role === "professional") preset = professionalOnboardingPreset;
    if (role === "both") preset = bothOnboardingPreset;

    setFormData(preset);
    setOnboardingDraft(preset);
  };

  // Determine dynamic step list based on userType
  const activeUserType = formData?.userType || "student";
  const isBoth = activeUserType === "both";
  const isStudent = activeUserType === "student";
  const isPro = activeUserType === "professional";

  // Step definitions
  // 1: Welcome
  // 2: User Type
  // 3: Personal Info
  // 4: Daily Routine
  // [5: Academic Info (if student or both)]
  // [6: Professional Info (if pro or both)]
  // Next: Goals
  // Next: Habits
  // Next: Productivity Preferences
  // Next: Sustainability
  // Next: Review Summary
  // Next: Schedule Preview

  type StepKey =
    | "welcome"
    | "user_type"
    | "personal_info"
    | "daily_routine"
    | "academic_info"
    | "professional_info"
    | "goals"
    | "habits"
    | "productivity"
    | "sustainability"
    | "review"
    | "preview";

  const getStepFlow = (): { key: StepKey; title: string }[] => {
    const base: { key: StepKey; title: string }[] = [
      { key: "welcome", title: "Welcome to Kronos" },
      { key: "user_type", title: "Select Profile Type" },
      { key: "personal_info", title: "Personal Details" },
      { key: "daily_routine", title: "Daily Routine & Sleep" },
    ];

    if (isStudent || isBoth) {
      base.push({ key: "academic_info", title: "Coursework & Timetable" });
    }
    if (isPro || isBoth) {
      base.push({ key: "professional_info", title: "Job Role & Standups" });
    }

    base.push(
      { key: "goals", title: "Goals & Outcomes" },
      { key: "habits", title: "Habit Formation" },
      { key: "productivity", title: "Focus & Flow Style" },
      { key: "sustainability", title: "Sustainability Routines" },
      { key: "review", title: "Review Profile Summary" },
      { key: "preview", title: "Schedule Preview & Approval" }
    );

    return base;
  };

  const stepFlow = getStepFlow();
  const totalSteps = stepFlow.length;
  const currentStepDef = stepFlow[currentStep - 1] || stepFlow[0];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoToStepNumber = (stepNum: number) => {
    if (stepNum >= 1 && stepNum <= totalSteps) {
      setCurrentStep(stepNum);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleApprove = async () => {
    completeOnboarding(formData);
    if (user?.id) {
      await dataService.saveOnboarding(user.id, totalSteps, formData, true);
    }
    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 flex flex-col justify-between selection:bg-amber-200">
      {/* Top Header */}
      <header className="border-b border-[#e6e3da] bg-white/80 backdrop-blur-md sticky top-0 z-30 px-3.5 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900 text-amber-100 flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4 text-amber-200" />
          </div>
          <span className="font-serif font-bold text-sm sm:text-base text-slate-900 tracking-tight">
            Kronos AI <span className="font-sans text-xs font-normal text-slate-500">• Setup</span>
          </span>
        </Link>

        <Link
          href="/home"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <span className="hidden sm:inline">Exit to Planner</span>
          <X className="w-4 h-4" />
        </Link>
      </header>

      {/* Main Content Form Card */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-12">
        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitle={currentStepDef.title}
          userType={formData.userType}
          onLoadPreset={handleLoadPreset}
        />

        {/* Step Component Routing */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#e6e3da] p-4 sm:p-10 shadow-xs">
          {currentStepDef.key === "welcome" && (
            <StepWelcome onNext={handleNext} />
          )}

          {currentStepDef.key === "user_type" && (
            <StepUserType
              value={formData.userType}
              onChange={(userType) => updateFormData({ userType })}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStepDef.key === "personal_info" && (
            <StepPersonalInfo
              data={{
                name: formData.name,
                email: formData.email,
                headline: formData.headline,
                institutionOrCompany: formData.institutionOrCompany,
              }}
              onChange={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStepDef.key === "daily_routine" && (
            <StepDailyRoutine
              data={{
                wakeTime: formData.wakeTime,
                sleepTime: formData.sleepTime,
                availableDays: formData.availableDays,
                mostProductivePeriod: formData.mostProductivePeriod,
              }}
              onChange={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStepDef.key === "academic_info" && (
            <StepAcademicInfo
              data={{
                course: formData.course,
                semester: formData.semester,
                subjects: formData.subjects,
                timetable: formData.timetable,
              }}
              onChange={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStepDef.key === "professional_info" && (
            <StepProfessionalInfo
              data={{
                jobRole: formData.jobRole,
                company: formData.company,
                workStartTime: formData.workStartTime,
                workEndTime: formData.workEndTime,
                recurringMeetings: formData.recurringMeetings,
              }}
              onChange={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStepDef.key === "goals" && (
            <StepGoals
              data={{
                shortTermGoal: formData.shortTermGoal,
                longTermGoal: formData.longTermGoal,
              }}
              onChange={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStepDef.key === "habits" && (
            <StepHabits
              data={{
                existingHabits: formData.existingHabits,
                desiredHabits: formData.desiredHabits,
              }}
              onChange={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStepDef.key === "productivity" && (
            <StepProductivityPreferences
              data={{
                preferredFocusDuration: formData.preferredFocusDuration,
                preferredBreakDuration: formData.preferredBreakDuration,
                planningStyle: formData.planningStyle,
              }}
              onChange={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStepDef.key === "sustainability" && (
            <StepSustainability
              data={{
                sustainabilityOptIn: formData.sustainabilityOptIn,
                ecoActivities: formData.ecoActivities,
              }}
              onChange={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStepDef.key === "review" && (
            <StepReviewSummary
              data={formData}
              onGoToStep={handleGoToStepNumber}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStepDef.key === "preview" && (
            <StepSchedulePreview
              data={formData}
              onApprove={handleApprove}
              onBack={handleBack}
            />
          )}
        </div>
      </main>

      {/* Footer info */}
      <footer className="p-6 text-center text-xs text-slate-400 border-t border-[#e6e3da]">
        Kronos AI Personal Time Manager • Phase 2 Onboarding & Profile Initialization
      </footer>
    </div>
  );
}
