import React from "react";
import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  Check,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export const metadata = {
  title: "Kronos AI — Intelligent Personal Planning & Time Management",
  description:
    "Calm, notebook-inspired AI personal planning assistant that understands your responsibilities, habits, routines, and goals. Compliant with Google API Services User Data Policy.",
};

export default function LandingHomePage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#201e1b] flex flex-col justify-between selection:bg-[#e8decb] font-sans w-full max-w-full overflow-x-hidden">
      {/* Top Navigation Header */}
      <header className="px-5 sm:px-8 py-3.5 border-b border-[#e8e2d5] bg-[#fbf9f5]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4 text-[#e8decb]" />
          </div>
          <span className="font-serif font-medium text-base text-[#201e1b] tracking-tight">
            Kronos AI
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/privacy"
            className="text-xs font-medium text-[#6e685f] hover:text-[#201e1b] hidden sm:inline-block transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs font-medium text-[#6e685f] hover:text-[#201e1b] hidden sm:inline-block transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/login"
            className="text-xs font-medium text-[#545049] hover:text-[#201e1b] px-3 py-1.5 rounded-lg border border-[#e4ded2] bg-white hover:bg-[#f2eee6] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-xs font-medium text-white px-3.5 py-1.5 rounded-lg bg-[#201e1b] hover:bg-[#34312c] transition-colors shadow-xs"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 sm:px-8 py-10 sm:py-16 space-y-16">
        <section className="text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#edf2ec] text-[#3e5940] border border-[#d6e0d5] text-[11px] font-medium shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Google API User Data Policy Compliant • Intelligent Personal Planning</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-[#201e1b] font-normal tracking-tight leading-tight max-w-2xl mx-auto">
            Calm, Realistic Daily Planning That Never Collapses.
          </h1>

          <p className="text-sm sm:text-base text-[#615c54] max-w-xl mx-auto leading-relaxed">
            Kronos AI is an adaptive time manager for students, working professionals, and dual-track learners. It understands your class timetables, standups, biological sleep boundaries, and personal habits to create realistic, conflict-free daily schedules.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#201e1b] text-white text-sm font-medium hover:bg-[#34312c] transition-colors shadow-xs"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-[#d8d1c3] bg-white text-[#201e1b] text-sm font-medium hover:bg-[#f2eee6] transition-colors"
            >
              <span>Sign In to Your Workspace</span>
            </Link>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl border border-[#e8e2d5] bg-white/70 backdrop-blur-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-[#f2eee6] text-[#201e1b] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#201e1b]">
              Deterministic Scheduling
            </h3>
            <p className="text-xs text-[#6e685f] leading-relaxed">
              Unlike generative AI that hallucinates overlapping slots, our pure mathematical solver packs tasks strictly into open intervals, respects your 23:00 curfew, and preserves lunch buffers.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-[#e8e2d5] bg-white/70 backdrop-blur-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-[#f2eee6] text-[#201e1b] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#201e1b]">
              Google Calendar & Tasks
            </h3>
            <p className="text-xs text-[#6e685f] leading-relaxed">
              Imports university lectures, team meetings, and birthdays to eliminate double-booking. Syncs your daily to-do items bidirectionally with Google Tasks.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-[#e8e2d5] bg-white/70 backdrop-blur-xs space-y-3">
            <div className="w-9 h-9 rounded-xl bg-[#f2eee6] text-[#201e1b] flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-base font-semibold text-[#201e1b]">
              Flow Immersion & Habits
            </h3>
            <p className="text-xs text-[#6e685f] leading-relaxed">
              Execute planned focus blocks using Csíkszentmihályi immersion timers (20m, 25m, 45m, 50m, 90m), reflect on cognitive states (Flow, Steady, Boredom, Anxiety), and build sustainable habits.
            </p>
          </div>
        </section>

        {/* GOOGLE USER DATA & LIMITED USE DISCLOSURE (MINIMIZED & COMPLIANT) */}
        <section className="p-5 sm:p-6 rounded-2xl border border-[#d8d1c3] bg-[#fbf9f5] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8e2d5] pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#536b54]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Google API Limited Use Disclosure</span>
              </div>
              <h2 className="font-serif text-lg sm:text-xl text-[#201e1b] font-medium">
                Privacy-First Google Calendar & Tasks Integration
              </h2>
            </div>
            <Link
              href="/google-disclosure"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#f2eee6] text-[#201e1b] text-xs font-semibold border border-[#d5cdbd] transition-all shadow-2xs shrink-0 self-start sm:self-center"
            >
              <span>View Full Scopes Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#536b54]" />
            </Link>
          </div>

          <p className="text-xs text-[#545049] leading-relaxed">
            Kronos AI integrates with Google APIs strictly to prevent calendar double-booking and synchronize your daily to-dos. Kronos AI&apos;s use and transfer of information received from Google APIs to any other app adheres to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-[#201e1b] hover:text-[#536b54]"
            >
              Google API Services User Data Policy
            </a>
            , including the <strong>Limited Use</strong> requirements.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-white border border-[#e8e2d5] text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#536b54] tracking-wider">No Data Sale</div>
              <p className="text-[11px] text-[#6e685f] leading-snug">Zero third-party sharing or ads</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#e8e2d5] text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#536b54] tracking-wider">No AI Training</div>
              <p className="text-[11px] text-[#6e685f] leading-snug">Never trains generalized AI</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#e8e2d5] text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#536b54] tracking-wider">User Control</div>
              <p className="text-[11px] text-[#6e685f] leading-snug">1-click disconnect anytime</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#e8e2d5] text-center space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#536b54] tracking-wider">RLS Vault</div>
              <p className="text-[11px] text-[#6e685f] leading-snug">Encrypted PostgreSQL isolation</p>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8a8479] border-t border-[#f0ece1]">
            <span>
              Hosted on verified domain: <strong className="text-[#545049]">https://kronos-ai-theta.vercel.app</strong>
            </span>
            <div className="flex items-center gap-3">
              <Link href="/privacy" className="underline hover:text-[#201e1b]">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="underline hover:text-[#201e1b]">Terms of Service</Link>
              <span>•</span>
              <Link href="/google-disclosure" className="underline font-semibold text-[#201e1b] hover:text-[#536b54]">Detailed Disclosure</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-5 sm:p-8 text-center text-xs text-[#8a8479] border-t border-[#e8e2d5] space-y-2 bg-[#fbf9f5]">
        <p className="max-w-md mx-auto leading-relaxed">
          Kronos AI — Intelligent Personal Planning & Time Management. Built for students, working professionals, and lifelong learners.
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-[#6e685f] pt-1">
          <Link href="/privacy" className="underline hover:text-[#201e1b]">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="underline hover:text-[#201e1b]">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/google-disclosure" className="underline hover:text-[#201e1b] font-medium text-[#201e1b]">
            Google API Disclosure
          </Link>
          <span>•</span>
          <Link href="/login" className="underline hover:text-[#201e1b]">
            Sign In
          </Link>
          <span>•</span>
          <Link href="/signup" className="underline hover:text-[#201e1b]">
            Get Started
          </Link>
        </div>
      </footer>
    </div>
  );
}
