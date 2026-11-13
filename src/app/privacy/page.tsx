import React from "react";
import Link from "next/link";
import { Clock, ShieldCheck, ArrowLeft, Lock, Calendar, Trash2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Kronos AI",
  description: "Privacy Policy and Google API User Data Policy disclosure for Kronos AI.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#201e1b] flex flex-col justify-between selection:bg-[#e8decb] font-sans w-full max-w-full overflow-x-hidden">
      {/* Top Header */}
      <header className="px-5 sm:px-8 py-3.5 border-b border-[#e8e2d5] bg-[#fbf9f5]/90 backdrop-blur-md flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#201e1b] text-[#f8f6f0] flex items-center justify-center shadow-xs">
            <Clock className="w-4 h-4 text-[#e8decb]" />
          </div>
          <span className="font-serif font-medium text-base text-[#201e1b] tracking-tight">Kronos AI</span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-medium text-[#545049] hover:text-[#201e1b] flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e4ded2] bg-white hover:bg-[#f2eee6] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full p-5 sm:p-8 space-y-8 my-6">
        <div className="space-y-2 border-b border-[#e8e2d5] pb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#edf2ec] text-[#536b54] border border-[#d6e0d5] text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Google API User Data Policy Compliant</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#201e1b] font-normal">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#8a8479]">
            Last updated: November 2026 • Effective immediately
          </p>
        </div>

        {/* Section 1: Introduction */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">1. Overview</h2>
          <p>
            Kronos AI (&quot;we&quot;, &quot;our&quot;, or &quot;the platform&quot;) is an intelligent personal time manager designed to help students, working professionals, and dual-track learners organize their daily schedules, build sustainable focus habits, and protect productive routines.
          </p>
          <p>
            We believe your schedule and calendar are deeply private. We do not sell your personal data, we do not display commercial advertising, and we do not use your calendar entries to train public generative AI models.
          </p>
        </section>

        {/* Section 2: Information We Collect */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Account Information:</strong> When you register via email/password or Google OAuth, we collect your name, email address, and avatar image to authenticate you and personalize your workspace.
            </li>
            <li>
              <strong>Schedule & Task Data:</strong> Tasks, focus durations, academic subjects, and habit anchors you explicitly create in Kronos AI.
            </li>
            <li>
              <strong>Google Calendar & Tasks Data:</strong> If you choose to connect Google Calendar, we access:
              <ul className="list-circle pl-5 pt-1 space-y-1 text-xs text-[#6e685f]">
                <li>Calendar events (titles, start/end timestamps, recurrence) to map external lectures and meetings into your daily agenda as protected, immovable commitments.</li>
                <li>Google Tasks (task titles, due dates) to enable two-way task synchronization between Kronos and your Google account.</li>
              </ul>
            </li>
          </ul>
        </section>

        {/* Section 3: Google Limited Use Disclosure */}
        <section className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e8e2d5] space-y-3 text-xs sm:text-sm leading-relaxed shadow-xs">
          <div className="flex items-center gap-2 text-[#201e1b] font-semibold">
            <Lock className="w-4 h-4 text-[#536b54]" />
            <h2 className="font-serif text-base text-[#201e1b]">3. Google API Services User Data Policy (Limited Use Disclosure)</h2>
          </div>
          <p className="text-[#545049]">
            Kronos AI&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#201e1b] underline hover:text-[#536b54]"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#545049]">
            <li>We only use your Google Calendar and Tasks data to provide and improve user-facing scheduling features (conflict detection, schedule placement, and bi-directional synchronization).</li>
            <li>We do not transfer your Google data to third parties unless necessary to provide these scheduling features, comply with applicable law, or as part of a merger/acquisition.</li>
            <li>We never use your Google user data for serving advertisements, retargeting, or personalized marketing.</li>
            <li>Human beings do not read your Google calendar entries unless you give us explicit permission for troubleshooting, it is necessary for security reasons, or required by law.</li>
          </ul>
          <div className="pt-2 text-xs border-t border-[#f2eee6] text-[#545049]">
            For our complete granular scope justification breakdown (including <code className="text-[11px] bg-[#f2eee6] px-1 py-0.5 rounded font-mono">calendar.events</code>, <code className="text-[11px] bg-[#f2eee6] px-1 py-0.5 rounded font-mono">calendar.readonly</code>, and <code className="text-[11px] bg-[#f2eee6] px-1 py-0.5 rounded font-mono">tasks</code>), please visit our dedicated{" "}
            <Link href="/google-disclosure" className="underline font-semibold text-[#201e1b] hover:text-[#536b54]">
              Google API Scopes Transparency & Limited Use Disclosure
            </Link>{" "}
            page.
          </div>
        </section>

        {/* Section 4: Data Storage & Security */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">4. Data Storage, Security & Isolation</h2>
          <p>
            All user data is stored in enterprise-grade Supabase PostgreSQL databases protected by strict Row Level Security (RLS) policies. Every database record is cryptographically tied to your authenticated user identifier (<code className="text-[11px] bg-[#f2eee6] px-1 py-0.5 rounded">auth.uid() = user_id</code>), ensuring other users cannot view or modify your agenda.
          </p>
          <p>
            OAuth access and refresh tokens are encrypted at rest and transmitted strictly via HTTPS with TLS 1.3 encryption.
          </p>
        </section>

        {/* Section 5: Data Retention & User Control */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">5. Your Rights & Data Deletion</h2>
          <p>You maintain full sovereignty over your data at all times:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Disconnect Google Calendar:</strong> You can disconnect your Google Calendar and Google Tasks at any time from your Profile (<code className="text-[11px] bg-[#f2eee6] px-1 py-0.5 rounded">/profile</code>) or header sync modal. Disconnecting immediately revokes and wipes all stored access and refresh tokens.
            </li>
            <li>
              <strong>Revoke via Google Account:</strong> You can also revoke Kronos AI&apos;s permissions directly from your{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-[#201e1b]"
              >
                Google Account Permissions
              </a>{" "}
              dashboard.
            </li>
            <li>
              <strong>Delete Account & Data:</strong> You may request full account and data deletion by clicking &quot;Clear Local Workspace Data&quot; in the Profile workspace or contacting our privacy coordinator.
            </li>
          </ul>
        </section>

        {/* Section 6: Contact */}
        <section className="space-y-3 text-xs sm:text-sm text-[#545049] leading-relaxed border-t border-[#e8e2d5] pt-5">
          <h2 className="font-serif text-lg text-[#201e1b] font-semibold">6. Contact Information</h2>
          <p>
            If you have questions, privacy concerns, or data requests regarding Kronos AI, please contact:
          </p>
          <p className="font-mono text-xs bg-[#f2eee6] p-3 rounded-xl border border-[#e4ded2] text-[#201e1b] inline-block">
            Email: iamkolakiprajwal@gmail.com<br />
            Project: Kronos AI Personal Time Manager
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-[#8a8479] border-t border-[#e8e2d5] px-4 space-y-1">
        <p>Kronos AI • Notebook-Inspired Adaptive Personal Time Management</p>
        <div className="flex items-center justify-center gap-4 text-[11px]">
          <Link href="/privacy" className="underline hover:text-[#201e1b]">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="underline hover:text-[#201e1b]">Terms of Service</Link>
          <span>•</span>
          <Link href="/google-disclosure" className="underline hover:text-[#201e1b]">Google Disclosure</Link>
          <span>•</span>
          <Link href="/login" className="underline hover:text-[#201e1b]">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
