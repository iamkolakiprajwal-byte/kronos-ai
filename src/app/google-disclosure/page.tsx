import React from "react";
import Link from "next/link";
import {
  Clock,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Lock,
  Check,
  ExternalLink,
  Trash2,
  Database,
  EyeOff,
} from "lucide-react";

export const metadata = {
  title: "Google API Scopes Disclosure — Kronos AI",
  description: "Comprehensive transparency disclosure and Limited Use compliance for Google API user data in Kronos AI.",
};

export default function GoogleDisclosurePage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#201e1b] flex flex-col justify-between selection:bg-[#e8decb] font-sans w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <header className="px-5 sm:px-8 py-3.5 border-b border-[#e8e2d5] bg-[#fbf9f5]/90 backdrop-blur-md flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4 text-[#e8decb]" />
          </div>
          <span className="font-serif font-medium text-base text-[#201e1b] tracking-tight">Kronos AI</span>
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-[#545049] hover:text-[#201e1b] flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e4ded2] bg-white hover:bg-[#f2eee6] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-5 sm:p-8 space-y-8 my-6">
        {/* Page Title & Verification Overview */}
        <div className="space-y-3 border-b border-[#e8e2d5] pb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#edf2ec] text-[#536b54] border border-[#d6e0d5] text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#536b54]" />
            <span>Google API Scopes Transparency & Limited Use Disclosure</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#201e1b] font-normal tracking-tight">
            How Kronos AI Uses Your Google Account Data
          </h1>
          <p className="text-xs sm:text-sm text-[#545049] leading-relaxed">
            Kronos AI is hosted on the verified production domain (<strong>https://kronos-ai-theta.vercel.app</strong>). We integrate with Google APIs to deliver automated daily scheduling, prevent calendar double-booking, and synchronize actionable to-dos.
          </p>
          <div className="p-3.5 rounded-xl border border-[#d8d1c3] bg-[#fbf9f5] text-xs text-[#545049] leading-relaxed">
            Kronos AI&apos;s use and transfer of information received from Google APIs to any other app adheres strictly to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-[#201e1b] hover:text-[#536b54] inline-flex items-center gap-1"
            >
              <span>Google API Services User Data Policy</span>
              <ExternalLink className="w-3 h-3 inline" />
            </a>
            , including the <strong>Limited Use</strong> requirements.
          </div>
        </div>

        {/* Granular Scope Breakdown */}
        <section className="space-y-5">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">
            1. Requested Google API Scopes & Justification
          </h2>
          <p className="text-xs sm:text-sm text-[#545049] leading-relaxed">
            Kronos AI requests only the minimum necessary scopes required to provide core scheduling and task synchronization functionality. We never request access to your Gmail, Google Drive, contacts, or financial details.
          </p>

          {/* Scope Card 1: Google Calendar */}
          <div className="p-5 rounded-2xl border border-[#e8e2d5] bg-white shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#f2eee6] pb-3">
              <div className="w-8 h-8 rounded-lg bg-[#edf2ec] text-[#536b54] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#201e1b]">Google Calendar Access</h3>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8a8479]">
                  Two-Way Event Scheduling & Double-Booking Prevention
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#545049] uppercase tracking-wider">
                Requested OAuth Scopes:
              </span>
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-[#433f38] bg-[#f7f5f0] p-2 rounded-lg border border-[#e8e2d5] break-all">
                  https://www.googleapis.com/auth/calendar.events
                </div>
                <div className="text-[11px] font-mono text-[#433f38] bg-[#f7f5f0] p-2 rounded-lg border border-[#e8e2d5] break-all">
                  https://www.googleapis.com/auth/calendar.readonly
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#545049] leading-relaxed">
              <p>
                <strong>Why it is requested (Conflict Detection & Open Interval Solving):</strong> Kronos AI reads your existing calendar events (such as university lectures, lab sections, team standups, doctor appointments, and personal commitments) from your primary and secondary Google Calendars. These external events are treated as immutable boundaries in our deterministic scheduling solver. The algorithm calculates the open intervals in your day and places your study blocks, assignments, and deep-work sessions strictly into these available windows so you are never double-booked.
              </p>
              <p>
                <strong>Event creation & schedule export:</strong> When you review and explicitly approve your generated daily schedule in Kronos AI, the application can write your scheduled focus blocks to your Google Calendar upon your confirmation. If you reschedule or delete a planned session inside Kronos AI, the corresponding Google Calendar event is kept cleanly in sync or removed.
              </p>
            </div>
          </div>

          {/* Scope Card 2: Google Tasks */}
          <div className="p-5 rounded-2xl border border-[#e8e2d5] bg-white shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#f2eee6] pb-3">
              <div className="w-8 h-8 rounded-lg bg-[#edf2ec] text-[#536b54] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#201e1b]">Google Tasks Access</h3>
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8a8479]">
                  Bidirectional Actionable To-Do Synchronization
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-[#545049] uppercase tracking-wider">
                Requested OAuth Scope:
              </span>
              <div className="text-[11px] font-mono text-[#433f38] bg-[#f7f5f0] p-2 rounded-lg border border-[#e8e2d5] break-all">
                https://www.googleapis.com/auth/tasks
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-[#545049] leading-relaxed">
              <p>
                <strong>Why it is requested (Unified Task Management):</strong> Kronos AI synchronizes your daily actionable to-do items bidirectionally with Google Tasks (your default list). This ensures you can review, create, and manage tasks from your phone, laptop, or Google Workspace widgets without losing progress.
              </p>
              <p>
                <strong>Two-way status updates & deletion handling:</strong> Checking off a task in Kronos AI updates the corresponding task in Google Tasks as completed, and completing a task in Google Tasks marks it completed in Kronos. When you remove a task in Kronos, our tombstone architecture ensures the task is deleted from Google Tasks so it never re-appears.
              </p>
            </div>
          </div>
        </section>

        {/* Strict Privacy & Limited Use Guarantees */}
        <section className="space-y-4">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">
            2. Our Strict Privacy & Limited Use Guarantees
          </h2>
          <p className="text-xs sm:text-sm text-[#545049] leading-relaxed">
            In compliance with Google&apos;s Limited Use requirements and strict data protection standards, Kronos AI guarantees the following:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl border border-[#e8e2d5] bg-white space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#536b54]">
                <Check className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-semibold text-[#201e1b]">Zero Third-Party Sale or Sharing</h4>
              </div>
              <p className="text-xs text-[#6e685f] leading-relaxed">
                We never sell, rent, license, or share your Google account data with third parties, commercial brokers, or advertising networks for any reason.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#e8e2d5] bg-white space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#536b54]">
                <EyeOff className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-semibold text-[#201e1b]">Zero AI Model Training</h4>
              </div>
              <p className="text-xs text-[#6e685f] leading-relaxed">
                Your personal calendar entries, commitments, and tasks are never used to train, fine-tune, or improve generalized or public artificial intelligence models.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#e8e2d5] bg-white space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#536b54]">
                <Database className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-semibold text-[#201e1b]">Encrypted PostgreSQL RLS Vault</h4>
              </div>
              <p className="text-xs text-[#6e685f] leading-relaxed">
                All credentials and tokens are encrypted at rest with AES-256 and transmitted strictly via HTTPS (TLS 1.3). Supabase Row Level Security (RLS) cryptographically restricts access solely to your authenticated user account.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-[#e8e2d5] bg-white space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#536b54]">
                <Lock className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-semibold text-[#201e1b]">Complete User Control & Revocation</h4>
              </div>
              <p className="text-xs text-[#6e685f] leading-relaxed">
                You can disconnect your Google integration with a single click anytime from your Profile settings or header sync button. Disconnecting immediately deletes and revokes all stored tokens.
              </p>
            </div>
          </div>
        </section>

        {/* User Sovereignty & How to Disconnect */}
        <section className="p-5 rounded-2xl border border-[#e8e2d5] bg-white space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-[#201e1b] font-semibold">
            <Trash2 className="w-4 h-4 text-[#b85437]" />
            <h2 className="font-serif text-base text-[#201e1b]">
              3. How to Disconnect or Revoke Access
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#545049] leading-relaxed">
            You maintain complete sovereignty over your Google account data at all times:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-[#545049] leading-relaxed">
            <li>
              <strong>Inside Kronos AI:</strong> Navigate to your <strong>Profile Settings</strong> (<code className="text-[11px] bg-[#f2eee6] px-1 py-0.5 rounded font-mono">/profile</code>) or click the Calendar status pill in the top navigation header, then select <strong>Disconnect</strong>. This permanently removes all cached tokens and sync markers from our database.
            </li>
            <li>
              <strong>Directly from Google:</strong> You can manage or revoke Kronos AI&apos;s third-party app permissions at any time directly through your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold text-[#201e1b] hover:text-[#536b54] inline-flex items-center gap-1"
              >
                <span>Google Account Permissions Dashboard</span>
                <ExternalLink className="w-3 h-3 inline" />
              </a>
              .
            </li>
          </ul>
        </section>

        {/* Contact Information */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed border-t border-[#e8e2d5] pt-5">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">
            4. Questions & Privacy Contact
          </h2>
          <p>
            If you have any questions regarding this Google API disclosure, privacy practices, or data deletion, please contact our lead developer:
          </p>
          <div className="font-mono text-xs bg-[#f2eee6] p-3.5 rounded-xl border border-[#e4ded2] text-[#201e1b] space-y-1">
            <div><strong>Email:</strong> iamkolakiprajwal@gmail.com</div>
            <div><strong>Application:</strong> Kronos AI Personal Time Manager</div>
            <div><strong>Verified Domain:</strong> https://kronos-ai-theta.vercel.app</div>
          </div>
          <div className="pt-2 text-xs text-[#6e685f]">
            Also review our publicly available{" "}
            <Link href="/privacy" className="underline font-medium text-[#201e1b] hover:text-[#536b54]">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="underline font-medium text-[#201e1b] hover:text-[#536b54]">
              Terms of Service
            </Link>
            .
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
